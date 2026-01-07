<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Support\Facades\Cookie;

class CookieTest extends TestCase
{
    public function test_cookie_handling()
    {
        $response = $this->get('/api/tenants/fest');
        // If this works, then it's not the general get() call.
        $response->assertStatus(200);
    }

    public function test_manual_cookie()
    {
        $response = $this->withCookie('test_cookie', 'test_value')
            ->get('/api/tenants/fest');
        $response->assertStatus(200);
    }
}
