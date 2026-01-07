<?php

return [
    /*
    |--------------------------------------------------------------------------
    | Waiting Room Settings
    |--------------------------------------------------------------------------
    |
    | This value determines the maximum number of concurrent users allowed
    | on critical purchase pages (seat map, checkout) before redirecting
    | others to a waiting line.
    |
    */
    'waiting_room_limit' => env('WAITING_ROOM_LIMIT', 1000),
];
