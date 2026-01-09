<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Tenant;
use App\Models\Event;
use App\Models\TicketType;
use App\Models\Role;
use App\Models\Affiliate;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;

class DemoSeeder extends Seeder
{
    public function run()
    {
        $this->command->info('Seeding Demo Data...');

        // 1. Create Tenant
        $tenant = Tenant::firstOrCreate(
            ['slug' => 'demo'],
            [
                'name' => 'Demo Organizer',
                'branding' => null,
            ]
        );

        // 2. Create Owner
        $owner = User::firstOrCreate(
            ['email' => 'owner@example.com'],
            [
                'name' => 'Demo Owner',
                'password' => Hash::make('password'),
                'role' => 'owner',
                'tenant_id' => $tenant->id,
            ]
        );

        // 3. Create Staff
        $staff = User::firstOrCreate(
            ['email' => 'staff@example.com'],
            [
                'name' => 'Demo Staff',
                'password' => Hash::make('password'),
                'role' => 'staff',
                'tenant_id' => $tenant->id,
            ]
        );

        // 4. Create Event
        $event = Event::updateOrCreate(
            ['slug' => 'demo-event', 'tenant_id' => $tenant->id],
            [
                'name' => 'Tukutix Use Case 2026',
                'venue_name' => 'Jakarta Convention Center',
                'venue_address' => 'Jl. Gatot Subroto',
                'start_date' => now()->addDays(7),
                'end_date' => now()->addDays(8),
                'status' => 'published',
                'banner_url' => '/demo/banner.png',
            ]
        );

        // 5. Create Ticket Types
        // VIP
        TicketType::updateOrCreate(
            ['event_id' => $event->id, 'name' => 'VIP Access'],
            [
                'description' => 'Premium viewing area, skip the line, and exclusive lounge access.',
                'price' => 2500000,
                'stock' => 50,
                'sale_start_date' => now(),
                'sale_end_date' => $event->start_date,
                'image_url' => '/demo/vip.png',
            ]
        );

        // Regular Variations
        $regularTypes = [
            [
                'name' => 'Regular - Early Bird',
                'description' => 'Best price for early buyers. Limited quantity.',
                'price' => 750000,
                'stock' => 100,
                'sale_start_date' => now(),
                'sale_end_date' => now()->addDays(7), // Available for 1 week
                'image_url' => '/demo/general.png',
            ],
            [
                'name' => 'Regular - H-60 Promo',
                'description' => 'Special price for booking 2 months in advance.',
                'price' => 1000000,
                'stock' => 200,
                'sale_start_date' => now()->addDays(8), // Starts after Early Bird
                'sale_end_date' => $event->start_date->subDays(60),
                'image_url' => '/demo/general.png',
            ],
            [
                'name' => 'Regular - H-30 Promo',
                'description' => 'Great value for booking 1 month in advance.',
                'price' => 1250000,
                'stock' => 300,
                'sale_start_date' => $event->start_date->subDays(59), // Starts after H-60
                'sale_end_date' => $event->start_date->subDays(30),
                'image_url' => '/demo/general.png',
            ],
            [
                'name' => 'Regular - Standard',
                'description' => 'Standard admission price.',
                'price' => 1500000,
                'stock' => 500,
                'sale_start_date' => $event->start_date->subDays(29), // Starts after H-30
                'sale_end_date' => $event->start_date,
                'image_url' => '/demo/general.png',
            ],
        ];

        foreach ($regularTypes as $type) {
            TicketType::updateOrCreate(
                ['event_id' => $event->id, 'name' => $type['name']],
                array_merge($type, ['event_id' => $event->id])
            );
        }

        // 6. Create Affiliate
        $affiliateUser = User::firstOrCreate(
            ['email' => 'affiliate@example.com'],
            [
                'name' => 'Demo Affiliate',
                'password' => Hash::make('password'),
                'role' => 'user',
                'tenant_id' => null,
            ]
        );

        $affiliate = Affiliate::firstOrCreate(
            ['user_id' => $affiliateUser->id, 'tenant_id' => $tenant->id],
            [
                'referral_code' => 'DEMO2026',
                'commission_rate' => 0.10,
                'bank_details' => ['bank' => 'BCA', 'number' => '1234567890'],
                'status' => 'active'
            ]
        );

        // 7. Create Public User
        $publicUser = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Public User',
                'password' => Hash::make('password'),
                'role' => 'user',
                'tenant_id' => null,
            ]
        );

        // 8. Create Super Admin
        $superAdmin = User::firstOrCreate(
            ['email' => 'superadmin@tukutix.com'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
                'role' => 'super_admin',
                'tenant_id' => null, // Super Admin has no tenant
            ]
        );

        $this->command->info('Demo data seeded successfully!');
        $this->command->info('Owner: owner@example.com');
        $this->command->info('Staff: staff@example.com');
        $this->command->info('Affiliate: affiliate@example.com / Code: DEMO2026');
        $this->command->info('User: user@example.com');
        $this->command->info('Super Admin: superadmin@tukutix.com');
    }
}
