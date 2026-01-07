<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('leaderboard_entries', function (Blueprint $table) {
            $table->id(); // Entries can stay BigInt as they are internal rows, or UUID. Let's keep BigInt for performance on heavy writes unless exposed.
            $table->foreignUuid('leaderboard_id')->constrained()->cascadeOnDelete();

            // Identifying the user (Buyer)
            $table->string('buyer_email')->index();
            $table->string('buyer_name');

            // Stats
            $table->integer('total_quantity')->default(0);
            $table->decimal('points', 12, 2)->default(0);

            // Cache rank here for easier querying if needed, or calculate on fly
            $table->integer('rank')->nullable();

            $table->timestamps();

            // Unique constraint: One entry per email per leaderboard
            $table->unique(['leaderboard_id', 'buyer_email']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leaderboard_entries');
    }
};
