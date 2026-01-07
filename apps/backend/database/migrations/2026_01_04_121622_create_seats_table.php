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
        Schema::create('seats', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('event_id')->constrained()->onDelete('cascade');
            $table->foreignUuid('ticket_type_id')->nullable()->constrained()->onDelete('set null');
            $table->string('label'); // e.g. A-1
            $table->integer('row')->nullable();
            $table->integer('column')->nullable();
            $table->string('section')->nullable();
            $table->string('status')->default('available'); // available, reserved, sold
            $table->timestamps();

            $table->index(['event_id', 'status']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('seats');
    }
};
