<?php

namespace Tests\Feature;

use App\Models\Dispo;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Tests\TestCase;

class DispoImportTest extends TestCase
{
    use RefreshDatabase;

    public function test_enseignant_peut_importer_des_disponibilites_depuis_un_csv(): void
    {
        $enseignant = User::factory()->create([
            'role' => 'enseignant',
        ]);

        $fichier = UploadedFile::fake()->createWithContent(
            'disponibilites.csv',
            implode("\n", [
                'jour;debut;fin;motif',
                'Lundi;08:00;10:00;Cours du matin',
                'Mercredi;14:00;16:30;',
            ])
        );

        $response = $this
            ->actingAs($enseignant)
            ->post('/dispos/import', [
                'fichier' => $fichier,
            ]);

        $response
            ->assertRedirect('/dispos')
            ->assertSessionHas('ok', 'Disponibilites importees avec succes.');

        $this->assertDatabaseCount('dispos', 2);

        $this->assertDatabaseHas('dispos', [
            'user_id' => $enseignant->id,
            'jour' => 1,
            'debut' => '08:00:00',
            'fin' => '10:00:00',
            'niveau' => 'prefere',
            'motif' => 'Cours du matin',
        ]);

        $this->assertDatabaseHas('dispos', [
            'user_id' => $enseignant->id,
            'jour' => 3,
            'debut' => '14:00:00',
            'fin' => '16:30:00',
            'niveau' => 'prefere',
        ]);
    }

    public function test_import_refuse_un_fichier_sans_colonnes_requises(): void
    {
        $enseignant = User::factory()->create([
            'role' => 'enseignant',
        ]);

        $fichier = UploadedFile::fake()->createWithContent(
            'disponibilites.csv',
            implode("\n", [
                'date;heure_debut;heure_fin',
                'Lundi;08:00;10:00',
            ])
        );

        $response = $this
            ->actingAs($enseignant)
            ->from('/dispos/ajout')
            ->post('/dispos/import', [
                'fichier' => $fichier,
            ]);

        $response
            ->assertRedirect('/dispos/ajout')
            ->assertSessionHasErrors('fichier');

        $this->assertSame(0, Dispo::query()->count());
    }

    public function test_import_signale_le_jour_deja_enregistre(): void
    {
        $enseignant = User::factory()->create([
            'role' => 'enseignant',
        ]);

        Dispo::query()->create([
            'user_id' => $enseignant->id,
            'jour' => 1,
            'debut' => '08:00:00',
            'fin' => '10:00:00',
            'niveau' => 'prefere',
        ]);

        $fichier = UploadedFile::fake()->createWithContent(
            'disponibilites.csv',
            implode("\n", [
                'jour;debut;fin;motif',
                'Lundi;14:00;16:00;Doublon',
            ])
        );

        $response = $this
            ->actingAs($enseignant)
            ->from('/dispos/ajout')
            ->post('/dispos/import', [
                'fichier' => $fichier,
            ]);

        $response
            ->assertRedirect('/dispos/ajout')
            ->assertSessionHasErrors([
                'fichier' => 'Ligne 2 : Une disponibilite existe deja pour le lundi.',
            ]);

        $this->assertDatabaseCount('dispos', 1);
    }

    public function test_import_refuse_un_fichier_xlsx_incomplet_avec_un_message_propre(): void
    {
        $enseignant = User::factory()->create([
            'role' => 'enseignant',
        ]);

        $tmp = tempnam(sys_get_temp_dir(), 'xlsx');
        $zip = new \ZipArchive;
        $zip->open($tmp, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);
        $zip->addFromString('xl/workbook.xml', <<<'XML'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheets>
    <sheet name="Feuil1" sheetId="1"/>
  </sheets>
</workbook>
XML);
        $zip->addFromString('xl/_rels/workbook.xml.rels', <<<'XML'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>
XML);
        $zip->close();

        $fichier = new UploadedFile($tmp, 'classeur.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);

        $response = $this
            ->actingAs($enseignant)
            ->from('/dispos/ajout')
            ->post('/dispos/import', [
                'fichier' => $fichier,
            ]);

        $response
            ->assertRedirect('/dispos/ajout')
            ->assertSessionHasErrors('fichier');
    }

    public function test_import_xlsx_avec_namespace_sur_les_noeuds_enfants_ne_declenche_pas_d_erreur_500(): void
    {
        $enseignant = User::factory()->create([
            'role' => 'enseignant',
        ]);

        $tmp = tempnam(sys_get_temp_dir(), 'xlsx');
        $zip = new \ZipArchive;
        $zip->open($tmp, \ZipArchive::CREATE | \ZipArchive::OVERWRITE);
        $zip->addFromString('[Content_Types].xml', <<<'XML'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>
XML);
        $zip->addFromString('xl/workbook.xml', <<<'XML'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="Feuil1" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>
XML);
        $zip->addFromString('xl/_rels/workbook.xml.rels', <<<'XML'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>
XML);
        $zip->addFromString('xl/worksheets/sheet1.xml', <<<'XML'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetData>
    <row r="1">
      <c r="A1" t="inlineStr"><is><t>jour</t></is></c>
      <c r="B1" t="inlineStr"><is><t>debut</t></is></c>
      <c r="C1" t="inlineStr"><is><t>fin</t></is></c>
      <c r="D1" t="inlineStr"><is><t>motif</t></is></c>
    </row>
    <row r="2">
      <c r="A2" t="inlineStr"><is><t>Lundi</t></is></c>
      <c r="B2" t="inlineStr"><is><t>08:00</t></is></c>
      <c r="C2" t="inlineStr"><is><t>10:00</t></is></c>
      <c r="D2" t="inlineStr"><is><t>Import test</t></is></c>
    </row>
  </sheetData>
</worksheet>
XML);
        $zip->close();

        $fichier = new UploadedFile($tmp, 'classeur.xlsx', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', null, true);

        $response = $this
            ->actingAs($enseignant)
            ->post('/dispos/import', [
                'fichier' => $fichier,
            ]);

        $response
            ->assertRedirect('/dispos')
            ->assertSessionHas('ok', 'Disponibilite importee avec succes.');

        $this->assertDatabaseHas('dispos', [
            'user_id' => $enseignant->id,
            'jour' => 1,
            'debut' => '08:00:00',
            'fin' => '10:00:00',
            'niveau' => 'prefere',
            'motif' => 'Import test',
        ]);
    }
}
