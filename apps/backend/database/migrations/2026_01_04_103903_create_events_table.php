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
        Schema::create('events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('slug');
            $table->dateTime('start_date');
            $table->dateTime('end_date');
            $table->string('venue_name');
            $table->text('venue_address')->nullable();
            $table->string('status')->default('draft'); // draft, published, ended
            $table->foreignUuid('tenant_id')->constrained()->onDelete('cascade');
            $table->timestamps();

            $table->unique(['slug', 'tenant_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
