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
        Schema::create('pricing_tiers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('ticket_type_id')->constrained()->cascadeOnDelete();

            $table->string('name'); // e.g., "Early Bird"
            $table->decimal('price', 12, 2);

            // Valid period
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();

            // Auto-switch based on limits
            $table->integer('quantity_limit')->nullable();

            // Lower priority = checked first (or higher, depends on logic. Let's say 1 = First Tier)
            $table->integer('priority')->default(0);

            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('pricing_tiers');
    }
};
