<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Event>
 */
class EventFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'id' => \Illuminate\Support\Str::uuid(),
            'name' => $this->faker->sentence(3),
            'slug' => $this->faker->unique()->slug(),
            'start_date' => now()->addDays(7),
            'end_date' => now()->addDays(8),
            'venue_name' => $this->faker->streetName(),
            'venue_address' => $this->faker->address(),
            'status' => 'published',
            'tenant_id' => \App\Models\Tenant::factory(),
            'seat_map_layout' => ['rows' => 10, 'cols' => 10]
        ];
    }
}
