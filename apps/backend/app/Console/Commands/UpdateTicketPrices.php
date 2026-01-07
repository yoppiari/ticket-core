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

        $ticketTypes = TicketType::with(['pricingTiers'])->get();
        $updatedCount = 0;

        foreach ($ticketTypes as $ticketType) {
            $currentPrice = $ticketType->price;

            // Find best active tier
            $activeTier = $ticketType->pricingTiers
                ->filter(function ($tier) {
                    $now = now();
                    $starts = $tier->starts_at ? $tier->starts_at <= $now : true;
                    $ends = $tier->ends_at ? $tier->ends_at >= $now : true;

                    // TODO: Check quantity_limit vs sold count if implemented
    
                    return $starts && $ends;
                })
                ->sortBy('priority') // Lower priority number = Higher priority (0 first)
                ->first();

            if ($activeTier) {
                if ($activeTier->price != $currentPrice) {
                    $ticketType->update(['price' => $activeTier->price]);
                    $this->line("Updated {$ticketType->name}: {$currentPrice} -> {$activeTier->price} ({$activeTier->name})");
                    $updatedCount++;
                }
            } else {
                // Optional: Revert to some base price or log?
                // For now, do nothing.
                //$this->warn("No active tier for {$ticketType->name}");
            }
        }

        $this->info("Prices updated. Total changed: {$updatedCount}");
    }
}
