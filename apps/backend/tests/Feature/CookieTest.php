<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Cookie;

class CookieTest extends TestCase
{
    use \Illuminate\Foundation\Testing\RefreshDatabase;

    public function test_cookie_handling()
    {
        \App\Models\Tenant::create(['name' => 'Fest', 'slug' => 'fest', 'status' => 'active']);

        $response = $this->get('/api/tenants/fest');
        $response->assertStatus(200);
    }

    public function test_manual_cookie()
    {
        \App\Models\Tenant::create(['name' => 'Fest', 'slug' => 'fest', 'status' => 'active']);

        $response = $this->withCookie('test_cookie', 'test_value')
            ->get('/api/tenants/fest');
        $response->assertStatus(200);
    }
}
