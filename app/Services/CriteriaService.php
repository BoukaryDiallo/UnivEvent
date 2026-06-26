<?php

namespace App\Services;

use App\Models\JuryCriterion;
use App\Models\JuryPanel;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * Service for managing scoring criteria
 * Handles CRUD and validation of evaluation criteria
 */
class CriteriaService
{
    /**
     * Create multiple criteria for a jury panel
     */
    public function createMultiple(JuryPanel $panel, array $criteria): Collection
    {
        return DB::transaction(function () use ($panel, $criteria) {
            $created = collect();
            $ordre = 1;

            foreach ($criteria as $criterion) {
                $record = $panel->criteria()->create([
                    'nom' => $criterion['nom'],
                    'description' => $criterion['description'] ?? null,
                    'bareme' => $criterion['bareme'] ?? 20,
                    'coefficient' => $criterion['coefficient'] ?? 1,
                    'ordre' => $criterion['ordre'] ?? $ordre++,
                    'actif' => true,
                ]);

                $created->push($record);
            }

            return $created;
        });
    }

    /**
     * Create single criterion
     */
    public function create(JuryPanel $panel, array $data): JuryCriterion
    {
        $nextOrder = $panel->criteria()->max('ordre') + 1;

        return $panel->criteria()->create([
            'nom' => $data['nom'],
            'description' => $data['description'] ?? null,
            'bareme' => $data['bareme'] ?? 20,
            'coefficient' => $data['coefficient'] ?? 1,
            'ordre' => $data['ordre'] ?? $nextOrder,
            'actif' => true,
        ]);
    }

    /**
     * Update criterion
     */
    public function update(JuryCriterion $criterion, array $data): JuryCriterion
    {
        $criterion->update([
            'nom' => $data['nom'] ?? $criterion->nom,
            'description' => $data['description'] ?? $criterion->description,
            'bareme' => $data['bareme'] ?? $criterion->bareme,
            'coefficient' => $data['coefficient'] ?? $criterion->coefficient,
            'ordre' => $data['ordre'] ?? $criterion->ordre,
        ]);

        return $criterion->fresh();
    }

    /**
     * Delete criterion (soft delete by deactivating)
     */
    public function delete(JuryCriterion $criterion): bool
    {
        return $criterion->update(['actif' => false]);
    }

    /**
     * Permanently delete criterion
     */
    public function forceDelete(JuryCriterion $criterion): ?bool
    {
        return $criterion->forceDelete();
    }

    /**
     * Reorder criteria
     */
    public function reorder(JuryPanel $panel, array $ordering): Collection
    {
        return DB::transaction(function () use ($panel, $ordering) {
            foreach ($ordering as $index => $criterionId) {
                JuryCriterion::find($criterionId)?->update(['ordre' => $index + 1]);
            }

            return $panel->criteria()->orderBy('ordre')->get();
        });
    }

    /**
     * Get active criteria with weightings
     */
    public function getActiveCriteria(JuryPanel $panel): Collection
    {
        return $panel->criteria()
            ->where('actif', true)
            ->orderBy('ordre')
            ->get();
    }

    /**
     * Calculate total weight
     */
    public function calculateTotalWeight(JuryPanel $panel): float
    {
        return $panel->criteria()
            ->where('actif', true)
            ->sum('coefficient');
    }

    /**
     * Validate criteria structure
     */
    public function validate(JuryPanel $panel): array
    {
        $errors = [];
        $criteria = $this->getActiveCriteria($panel);

        if ($criteria->isEmpty()) {
            $errors[] = 'Au moins un critère d\'évaluation est requis';
        }

        $totalWeight = $this->calculateTotalWeight($panel);
        if ($totalWeight <= 0) {
            $errors[] = 'Le poids total des critères doit être positif';
        }

        foreach ($criteria as $criterion) {
            if (empty($criterion->nom)) {
                $errors[] = "Le critère #{$criterion->id} n'a pas de nom";
            }
            if ($criterion->bareme <= 0) {
                $errors[] = "Le barème du critère '{$criterion->nom}' doit être positif";
            }
        }

        return $errors;
    }

    /**
     * Clone criteria from another jury panel
     */
    public function cloneFromPanel(JuryPanel $source, JuryPanel $target): Collection
    {
        return DB::transaction(function () use ($source, $target) {
            $cloned = collect();

            foreach ($source->criteria()->where('actif', true)->get() as $criterion) {
                $clone = $target->criteria()->create([
                    'nom' => $criterion->nom,
                    'description' => $criterion->description,
                    'bareme' => $criterion->bareme,
                    'coefficient' => $criterion->coefficient,
                    'ordre' => $criterion->ordre,
                    'actif' => true,
                ]);

                $cloned->push($clone);
            }

            return $cloned;
        });
    }
}
