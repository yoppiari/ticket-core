<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Seat>
 */
class SeatFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => \App\Models\Event::factory(),
            'ticket_type_id' => \App\Models\TicketType::factory(),
            'label' => 'A1',
            'row' => 1,
            'column' => 1,
            'section' => 'Main',
            'status' => 'available',
        ];
    }
}
