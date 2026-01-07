<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Addon;
use Illuminate\Database\Seeder;

class AddonSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $events = Event::all();

        foreach ($events as $event) {
            Addon::create([
                'event_id' => $event->id,
                'name' => 'Premium Parking',
                'description' => 'Guaranteed parking spot close to the entrance.',
                'price' => 50000,
                'stock' => 100,
                'type' => 'parking',
            ]);

            Addon::create([
                'event_id' => $event->id,
                'name' => 'Official T-Shirt',
                'description' => 'Limited edition event t-shirt. Available in all sizes.',
                'price' => 150000,
                'stock' => 500,
                'type' => 'merch',
            ]);

            Addon::create([
                'event_id' => $event->id,
                'name' => 'Fast Track Entry',
                'description' => 'Skip the long queues with our dedicated fast track entrance.',
                'price' => 75000,
                'stock' => 200,
                'type' => 'service',
            ]);
        }
    }
}
