<?php

namespace App\Support;

use Illuminate\Http\UploadedFile;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use ZipArchive;

class DispoImportParser
{
    /**
     * @return array<int, array{jour:int,debut:string,fin:string,niveau:string,motif:?string}>
     */
    public function parse(UploadedFile $file): array
    {
        $extension = strtolower($file->getClientOriginalExtension());

        $rows = match ($extension) {
            'xlsx' => $this->parseXlsx($file),
            'csv', 'txt' => $this->parseCsv($file),
            default => throw ValidationException::withMessages([
                'fichier' => 'Le format du fichier n est pas pris en charge.',
            ]),
        };

        return $this->rowsToCreneaux($rows);
    }

    /**
     * @return array<int, array<int, string>>
     */
    protected function parseCsv(UploadedFile $file): array
    {
        $path = $file->getRealPath();

        if ($path === false) {
            throw ValidationException::withMessages([
                'fichier' => 'Impossible de lire le fichier importe.',
            ]);
        }

        $content = file_get_contents($path);

        if ($content === false) {
            throw ValidationException::withMessages([
                'fichier' => 'Impossible de lire le fichier importe.',
            ]);
        }

        $content = preg_replace('/^\xEF\xBB\xBF/', '', $content) ?? $content;
        $lines = preg_split("/\r\n|\n|\r/", $content) ?: [];
        $rows = [];
        $delimiter = null;

        foreach ($lines as $line) {
            if (trim($line) === '') {
                continue;
            }

            $delimiter ??= $this->detectDelimiter($line);
            $rows[] = array_map(
                fn (string $value) => trim($value),
                str_getcsv($line, $delimiter)
            );
        }

        return $rows;
    }

    protected function detectDelimiter(string $line): string
    {
        $delimiters = [',', ';', "\t"];
        $scores = [];

        foreach ($delimiters as $candidate) {
            $scores[$candidate] = count(str_getcsv($line, $candidate));
        }

        arsort($scores);

        return (string) array_key_first($scores);
    }

    /**
     * @return array<int, array<int, string>>
     */
    protected function parseXlsx(UploadedFile $file): array
    {
        if (! class_exists(ZipArchive::class)) {
            throw ValidationException::withMessages([
                'fichier' => 'L extension ZIP de PHP est requise pour importer un fichier .xlsx.',
            ]);
        }

        $path = $file->getRealPath();

        if ($path === false) {
            throw ValidationException::withMessages([
                'fichier' => 'Impossible de lire le fichier importe.',
            ]);
        }

        $zip = new ZipArchive;

        if ($zip->open($path) !== true) {
            throw ValidationException::withMessages([
                'fichier' => 'Le fichier .xlsx est invalide ou corrompu.',
            ]);
        }

        try {
            $sharedStrings = $this->readSharedStrings($zip);
            $sheetPath = $this->resolveFirstWorksheetPath($zip);
            $sheetXml = $zip->getFromName($sheetPath);

            if ($sheetXml === false) {
                throw ValidationException::withMessages([
                    'fichier' => 'Impossible de lire la premiere feuille du fichier Excel.',
                ]);
            }

            $xml = simplexml_load_string($sheetXml);

            if ($xml === false) {
                throw ValidationException::withMessages([
                    'fichier' => 'Le contenu de la feuille Excel est invalide.',
                ]);
            }

            $namespaces = $xml->getNamespaces(true);
            $mainNs = $namespaces[''] ?? null;

            if ($mainNs !== null) {
                $xml->registerXPathNamespace('main', $mainNs);
            }

            $rows = [];
            $rowNodes = $xml->xpath($mainNs !== null ? '//main:sheetData/main:row' : '//sheetData/row') ?: [];

            foreach ($rowNodes as $rowNode) {
                if ($mainNs !== null) {
                    $rowNode->registerXPathNamespace('main', $mainNs);
                }

                $row = [];
                $cells = $rowNode->xpath($mainNs !== null ? './main:c' : './c') ?: [];

                foreach ($cells as $cell) {
                    $reference = (string) ($cell['r'] ?? '');
                    $columnIndex = $this->columnIndexFromReference($reference);
                    $row[$columnIndex] = $this->extractCellValue($cell, $sharedStrings, $mainNs);
                }

                if ($row === []) {
                    continue;
                }

                ksort($row);
                $rows[] = array_values($row);
            }

            return $rows;
        } finally {
            $zip->close();
        }
    }

    /**
     * @return array<int, string>
     */
    protected function readSharedStrings(ZipArchive $zip): array
    {
        $xmlString = $zip->getFromName('xl/sharedStrings.xml');

        if ($xmlString === false) {
            return [];
        }

        $xml = simplexml_load_string($xmlString);

        if ($xml === false) {
            return [];
        }

        $namespaces = $xml->getNamespaces(true);
        $mainNs = $namespaces[''] ?? null;

        if ($mainNs !== null) {
            $xml->registerXPathNamespace('main', $mainNs);
        }

        $nodes = $xml->xpath($mainNs !== null ? '//main:si' : '//si') ?: [];
        $strings = [];

        foreach ($nodes as $node) {
            if ($mainNs !== null) {
                $node->registerXPathNamespace('main', $mainNs);
            }

            $parts = $node->xpath($mainNs !== null ? './/main:t' : './/t') ?: [];
            $strings[] = trim(implode('', array_map(fn ($part) => (string) $part, $parts)));
        }

        return $strings;
    }

    protected function resolveFirstWorksheetPath(ZipArchive $zip): string
    {
        $workbookXml = $zip->getFromName('xl/workbook.xml');
        $relsXml = $zip->getFromName('xl/_rels/workbook.xml.rels');

        if ($workbookXml === false || $relsXml === false) {
            throw ValidationException::withMessages([
                'fichier' => 'Le fichier Excel est incomplet.',
            ]);
        }

        $workbook = simplexml_load_string($workbookXml);
        $rels = simplexml_load_string($relsXml);

        if ($workbook === false || $rels === false) {
            throw ValidationException::withMessages([
                'fichier' => 'Le contenu du classeur Excel est invalide.',
            ]);
        }

        $workbookNamespaces = $workbook->getNamespaces(true);
        $mainNs = $workbookNamespaces[''] ?? null;
        $relNs = $workbookNamespaces['r'] ?? 'http://schemas.openxmlformats.org/officeDocument/2006/relationships';

        if ($mainNs !== null) {
            $workbook->registerXPathNamespace('main', $mainNs);
        }

        $workbook->registerXPathNamespace('rel', $relNs);
        $sheet = ($workbook->xpath($mainNs !== null ? '//main:sheets/main:sheet[1]' : '//sheets/sheet[1]') ?: [])[0] ?? null;

        if ($sheet === null) {
            throw ValidationException::withMessages([
                'fichier' => 'Aucune feuille n a ete trouvee dans le fichier Excel.',
            ]);
        }

        $relationId = $this->extractRelationshipId($sheet, $relNs);

        if ($relationId === '') {
            throw ValidationException::withMessages([
                'fichier' => 'Impossible d identifier la premiere feuille du fichier Excel. Verifiez que le classeur contient une feuille standard non protegee.',
            ]);
        }

        $relsNamespaces = $rels->getNamespaces(true);
        $relsNs = $relsNamespaces[''] ?? null;

        if ($relsNs !== null) {
            $rels->registerXPathNamespace('main', $relsNs);
        }

        $relation = collect($rels->xpath($relsNs !== null ? '//main:Relationship' : '//Relationship') ?: [])
            ->first(fn ($item) => (string) $item['Id'] === $relationId);

        if ($relation === null) {
            throw ValidationException::withMessages([
                'fichier' => 'Impossible de retrouver la feuille Excel a importer.',
            ]);
        }

        $target = str_replace('\\', '/', (string) $relation['Target']);

        if (str_starts_with($target, '/')) {
            return ltrim($target, '/');
        }

        return 'xl/'.ltrim($target, '/');
    }

    protected function extractRelationshipId(\SimpleXMLElement $sheet, string $relNs): string
    {
        $namespacedAttributes = $sheet->attributes($relNs, true);

        if ($namespacedAttributes !== null) {
            foreach (['id', 'r:id'] as $attributeName) {
                $value = trim((string) ($namespacedAttributes[$attributeName] ?? ''));

                if ($value !== '') {
                    return $value;
                }
            }
        }

        foreach (['id', 'r:id'] as $attributeName) {
            $value = trim((string) ($sheet[$attributeName] ?? ''));

            if ($value !== '') {
                return $value;
            }
        }

        $rawXml = $sheet->asXML() ?: '';

        if (preg_match('/\br:id="([^"]+)"/', $rawXml, $matches) === 1) {
            return trim($matches[1]);
        }

        return '';
    }

    protected function extractCellValue(\SimpleXMLElement $cell, array $sharedStrings, ?string $mainNs): string
    {
        if ($mainNs !== null) {
            $cell->registerXPathNamespace('main', $mainNs);
        }

        $type = (string) ($cell['t'] ?? '');
        $valueNode = ($cell->xpath($mainNs !== null ? './main:v' : './v') ?: [])[0] ?? null;
        $inlineNode = ($cell->xpath($mainNs !== null ? './main:is//main:t' : './is//t') ?: []);

        if ($type === 'inlineStr' && $inlineNode !== []) {
            return trim(implode('', array_map(fn ($node) => (string) $node, $inlineNode)));
        }

        $value = trim((string) $valueNode);

        if ($type === 's') {
            return (string) ($sharedStrings[(int) $value] ?? '');
        }

        return $value;
    }

    protected function columnIndexFromReference(string $reference): int
    {
        if ($reference === '' || ! preg_match('/^[A-Z]+/i', $reference, $matches)) {
            return 0;
        }

        $letters = strtoupper($matches[0]);
        $index = 0;

        foreach (str_split($letters) as $letter) {
            $index = ($index * 26) + (ord($letter) - 64);
        }

        return max(0, $index - 1);
    }

    /**
     * @param  array<int, array<int, string>>  $rows
     * @return array<int, array{jour:int,debut:string,fin:string,niveau:string,motif:?string}>
     */
    protected function rowsToCreneaux(array $rows): array
    {
        if ($rows === []) {
            throw ValidationException::withMessages([
                'fichier' => 'Le fichier importe est vide.',
            ]);
        }

        $headers = array_map(fn ($header) => $this->normalizeHeader((string) $header), $rows[0]);
        $headerMap = $this->resolveHeaderMap($headers);
        $creneaux = [];
        $errors = [];

        foreach (array_slice($rows, 1) as $index => $row) {
            $lineNumber = $index + 2;

            if ($this->isEmptyRow($row)) {
                continue;
            }

            try {
                $jour = $this->extractRowValue($row, $headerMap, 'jour');
                $debut = $this->extractRowValue($row, $headerMap, 'debut');
                $fin = $this->extractRowValue($row, $headerMap, 'fin');
                $motif = $this->extractOptionalRowValue($row, $headerMap, 'motif');

                $creneaux[] = [
                    'jour' => $this->parseJour($jour),
                    'debut' => $this->parseHeure($debut),
                    'fin' => $this->parseHeure($fin),
                    'niveau' => 'prefere',
                    'motif' => $motif !== null ? trim($motif) : null,
                ];
            } catch (ValidationException $exception) {
                foreach ($exception->errors() as $messages) {
                    foreach ($messages as $message) {
                        $errors[] = "Ligne {$lineNumber} : {$message}";
                    }
                }
            }
        }

        if ($errors !== []) {
            throw ValidationException::withMessages([
                'fichier' => $errors,
            ]);
        }

        if ($creneaux === []) {
            throw ValidationException::withMessages([
                'fichier' => 'Aucune disponibilite exploitable n a ete trouvee dans le fichier.',
            ]);
        }

        return $creneaux;
    }

    /**
     * @param  array<int, string>  $headers
     * @return array<string, int>
     */
    protected function resolveHeaderMap(array $headers): array
    {
        $aliases = [
            'jour' => ['jour', 'jours', 'day'],
            'debut' => ['debut', 'heure_debut', 'debut_heure', 'start', 'heuredeb', 'horaire_debut'],
            'fin' => ['fin', 'heure_fin', 'fin_heure', 'end', 'heurefin', 'horaire_fin'],
            'motif' => ['motif', 'commentaire', 'commentaires', 'observation', 'observations', 'note', 'notes'],
        ];

        $map = [];

        foreach ($aliases as $field => $variants) {
            foreach ($headers as $index => $header) {
                if (in_array($header, $variants, true)) {
                    $map[$field] = $index;
                    break;
                }
            }
        }

        $required = ['jour', 'debut', 'fin'];
        $missing = array_values(array_filter($required, fn ($field) => ! array_key_exists($field, $map)));

        if ($missing !== []) {
            throw ValidationException::withMessages([
                'fichier' => 'Les colonnes requises sont : jour, debut, fin. La colonne motif est facultative.',
            ]);
        }

        return $map;
    }

    protected function normalizeHeader(string $value): string
    {
        return str_replace('-', '_', Str::slug($value, '_'));
    }

    /**
     * @param  array<int, string>  $row
     * @param  array<string, int>  $headerMap
     */
    protected function extractRowValue(array $row, array $headerMap, string $field): string
    {
        $value = trim((string) ($row[$headerMap[$field]] ?? ''));

        if ($value === '') {
            throw ValidationException::withMessages([
                $field => "La colonne {$field} est requise.",
            ]);
        }

        return $value;
    }

    /**
     * @param  array<int, string>  $row
     * @param  array<string, int>  $headerMap
     */
    protected function extractOptionalRowValue(array $row, array $headerMap, string $field): ?string
    {
        if (! array_key_exists($field, $headerMap)) {
            return null;
        }

        $value = trim((string) ($row[$headerMap[$field]] ?? ''));

        return $value === '' ? null : $value;
    }

    /**
     * @param  array<int, string>  $row
     */
    protected function isEmptyRow(array $row): bool
    {
        foreach ($row as $value) {
            if (trim((string) $value) !== '') {
                return false;
            }
        }

        return true;
    }

    protected function parseJour(string $value): int
    {
        $normalized = $this->normalizeHeader($value);

        $days = [
            '1' => 1,
            'lundi' => 1,
            'lun' => 1,
            '2' => 2,
            'mardi' => 2,
            'mar' => 2,
            '3' => 3,
            'mercredi' => 3,
            'mer' => 3,
            '4' => 4,
            'jeudi' => 4,
            'jeu' => 4,
            '5' => 5,
            'vendredi' => 5,
            'ven' => 5,
            '6' => 6,
            'samedi' => 6,
            'sam' => 6,
            '7' => 7,
            'dimanche' => 7,
            'dim' => 7,
        ];

        if (array_key_exists($normalized, $days)) {
            return $days[$normalized];
        }

        throw ValidationException::withMessages([
            'jour' => 'Le jour doit etre un numero de 1 a 7 ou un nom de jour valide.',
        ]);
    }

    protected function parseHeure(string $value): string
    {
        $trimmed = trim(str_replace('h', ':', strtolower($value)));

        if (preg_match('/^\d{1,2}:\d{2}$/', $trimmed)) {
            [$hours, $minutes] = array_map('intval', explode(':', $trimmed));

            if ($hours >= 0 && $hours < 24 && $minutes >= 0 && $minutes < 60) {
                return sprintf('%02d:%02d', $hours, $minutes);
            }
        }

        if (preg_match('/^\d{1,2}:\d{2}:\d{2}$/', $trimmed)) {
            [$hours, $minutes] = array_map('intval', array_slice(explode(':', $trimmed), 0, 2));

            if ($hours >= 0 && $hours < 24 && $minutes >= 0 && $minutes < 60) {
                return sprintf('%02d:%02d', $hours, $minutes);
            }
        }

        if (preg_match('/^\d{3,4}$/', $trimmed)) {
            $trimmed = str_pad($trimmed, 4, '0', STR_PAD_LEFT);
            $hours = (int) substr($trimmed, 0, 2);
            $minutes = (int) substr($trimmed, 2, 2);

            if ($hours >= 0 && $hours < 24 && $minutes >= 0 && $minutes < 60) {
                return sprintf('%02d:%02d', $hours, $minutes);
            }
        }

        if (is_numeric($trimmed)) {
            $number = (float) str_replace(',', '.', $trimmed);

            if ($number >= 0 && $number < 1) {
                $minutes = (int) round($number * 24 * 60);
                $hours = intdiv($minutes, 60) % 24;
                $remainingMinutes = $minutes % 60;

                return sprintf('%02d:%02d', $hours, $remainingMinutes);
            }
        }

        throw ValidationException::withMessages([
            'heure' => 'L heure doit etre au format HH:MM.',
        ]);
    }
}
