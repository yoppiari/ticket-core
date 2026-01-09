<?php

namespace Database\Factories;

use App\Models\Event;
use App\Models\Order;
use App\Models\TicketType;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Ticket>
 */
class TicketFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'event_id' => Event::factory(),
            'order_id' => Order::factory(),
            'ticket_type_id' => TicketType::factory(),
            'ticket_code' => strtoupper(Str::random(10)),
            'status' => 'valid',
            'checked_in_at' => null,
            'metadata' => [],
        ];
    }
}
