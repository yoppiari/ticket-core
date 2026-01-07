<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Models\Seat;
use App\Models\TicketType;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class SeatSeeder extends Seeder
{
    public function run(): void
    {
        $event = Event::where('slug', 'demo-event')->first() ?? Event::first();
        if (!$event)
            return;

        $ticketType = TicketType::where('event_id', $event->id)->first();
        if (!$ticketType)
            return;

        $seats = [];
        $rows = 40;
        $cols = 40;

        for ($r = 0; $r < $rows; $r++) {
            for ($c = 0; $c < $cols; $c++) {
                $status = 'available';
                // Randomly mark some as sold
                if (rand(1, 10) > 8) {
                    $status = 'sold';
                }

                $seats[] = [
                    'id' => (string) Str::uuid(),
                    'event_id' => $event->id,
                    'ticket_type_id' => $ticketType->id,
                    'label' => chr(65 + ($r % 26)) . ($c + 1),
                    'row' => $r,
                    'column' => $c,
                    'section' => 'Main Hall',
                    'status' => $status,
                    'created_at' => now(),
                    'updated_at' => now(),
                ];

                // Chunking to avoid memory issues
                if (count($seats) >= 1000) {
                    Seat::insert($seats);
                    $seats = [];
                }
            }
        }

        if (count($seats) > 0) {
            Seat::insert($seats);
        }

        // Update event layout
        $event->update([
            'seat_map_layout' => [
                'rows' => $rows,
                'cols' => $cols,
                'totalSeats' => $rows * $cols
            ]
        ]);
    }
}
