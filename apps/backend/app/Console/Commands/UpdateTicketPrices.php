<?php

namespace App\Console\Commands;

use App\Models\TicketType;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class UpdateTicketPrices extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'tickets:update-prices';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update ticket prices based on active pricing tiers';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting price update...');

        $updatedCount = 0;

        // Use chunk to prevent memory leaks with large datasets
        TicketType::with(['pricingTiers'])->chunk(100, function ($ticketTypes) use (&$updatedCount) {
            foreach ($ticketTypes as $ticketType) {
                $currentPrice = $ticketType->price;
                $now = now();

                // Find best active tier
                // Logic: Active date range AND highest priority (lowest number)
                $activeTier = $ticketType->pricingTiers
                    ->filter(function ($tier) use ($now) {
                        $starts = $tier->starts_at ? $tier->starts_at <= $now : true;
                        $ends = $tier->ends_at ? $tier->ends_at >= $now : true;
                        return $starts && $ends;
                    })
                    ->sortBy('priority') // Lower priority number = Higher priority
                    ->first();

                if ($activeTier) {
                    if ($activeTier->price != $currentPrice) {
                        $ticketType->update(['price' => $activeTier->price]);
                        $this->line("Updated {$ticketType->name}: {$currentPrice} -> {$activeTier->price} ({$activeTier->name})");
                        $updatedCount++;
                    }
                }
                // Note: If no active tier, we retain the current price. 
                // To revert to base price, a 'base_price' column would be needed in schema.
            }
        });

        $this->info("Prices updated. Total changed: {$updatedCount}");
    }
}
