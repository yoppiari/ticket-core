<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Order>
 */
class OrderFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => \App\Models\User::factory(),
            'event_id' => \App\Models\Event::factory(),
            'total_amount' => $this->faker->numberBetween(10000, 1000000),
            'status' => 'pending',
            'session_id' => $this->faker->uuid,
            'expires_at' => now()->addMinutes(15),
        ];
    }
}
