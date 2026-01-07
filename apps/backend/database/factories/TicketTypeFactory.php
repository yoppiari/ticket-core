<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\TicketType>
 */
class TicketTypeFactory extends Factory
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
            'event_id' => \App\Models\Event::factory(),
            'name' => $this->faker->word(),
            'description' => $this->faker->sentence(),
            'price' => 100000,
            'stock' => 100,
        ];
    }
}
