<?php

namespace App\Support;

use Illuminate\Support\Facades\DB;
use Illuminate\Database\Query\Builder as QueryBuilder;
use Illuminate\Database\Eloquent\Builder as EloquentBuilder;

class DatabaseHelper
{
    /**
     * Get the current database driver name.
     */
    public static function getDriver(): string
    {
        return DB::connection()->getDriverName();
    }

    /**
     * Get the SQL fragment for extracting the year from a date column.
     */
    public static function year(string $column): string
    {
        return match (self::getDriver()) {
            'sqlite' => "strftime('%Y', $column)",
            'pgsql' => "EXTRACT(YEAR FROM $column)",
            default => "YEAR($column)",
        };
    }

    /**
     * alias for year().
     */
    public static function getYear(string $column): string
    {
        return self::year($column);
    }

    /**
     * Get the SQL fragment for extracting the month from a date column.
     */
    public static function month(string $column): string
    {
        return match (self::getDriver()) {
            'sqlite' => "strftime('%m', $column)",
            'pgsql' => "EXTRACT(MONTH FROM $column)",
            default => "MONTH($column)",
        };
    }

    /**
     * alias for month().
     */
    public static function getMonth(string $column): string
    {
        return self::month($column);
    }

    /**
     * Get the SQL fragment for extracting the day from a date column.
     */
    public static function day(string $column): string
    {
        return match (self::getDriver()) {
            'sqlite' => "strftime('%d', $column)",
            'pgsql' => "EXTRACT(DAY FROM $column)",
            default => "DAY($column)",
        };
    }

    /**
     * Group a query by year and month of a specific column.
     * 
     * @param QueryBuilder|EloquentBuilder $query
     * @param string $column
     * @return QueryBuilder|EloquentBuilder
     */
    public static function groupByYearMonth($query, string $column)
    {
        $yearSql = self::year($column);
        $monthSql = self::month($column);
        $driver = self::getDriver();

        $query->selectRaw("{$yearSql} as year, {$monthSql} as month, COUNT(*) as value");

        if ($driver === 'pgsql') {
            // PostgreSQL requires grouping by the expression, not the alias
            return $query->groupBy(DB::raw($yearSql), DB::raw($monthSql))
                         ->orderBy(DB::raw($yearSql))
                         ->orderBy(DB::raw($monthSql));
        }

        // MySQL and SQLite can group by alias
        return $query->groupBy('year', 'month')
                     ->orderBy('year')
                     ->orderBy('month');
    }

    /**
     * Get the SQL fragment for a random order.
     */
    public static function randomOrder(): string
    {
        return match (self::getDriver()) {
            'sqlite' => 'RANDOM()',
            'pgsql' => 'RANDOM()',
            default => 'RAND()',
        };
    }
}
