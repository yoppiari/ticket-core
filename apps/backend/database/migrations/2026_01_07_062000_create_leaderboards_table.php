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
        Schema::create('leaderboards', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('event_id')->constrained()->cascadeOnDelete();
            // Optional: If a leaderboard is tied to a specific addon (e.g. "Top Donors")
            $table->foreignUuid('addon_id')->nullable()->constrained()->cascadeOnDelete();

            $table->string('name');
            $table->text('description')->nullable();

            // JSON config for flexibility (e.g. points_per_item, ranking_strategy, prize_info)
            $table->json('config')->nullable();

            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();

            $table->boolean('is_active')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('leaderboards');
    }
};
