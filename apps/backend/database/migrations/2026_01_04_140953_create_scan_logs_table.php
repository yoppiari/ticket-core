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
        Schema::create('scan_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->foreignUuid('event_id')->constrained()->cascadeOnDelete();
            $table->foreignUuid('ticket_id')->constrained()->cascadeOnDelete();
            $table->foreignId('gate_staff_id')->constrained('users')->cascadeOnDelete();
            $table->string('status'); // valid, duplicate, invalid
            $table->timestamp('scanned_at');
            $table->string('device_id')->nullable();
            $table->boolean('synced')->default(true); // Server side logs are always synced initially? 
            // Actually this is for client. On server, maybe 'is_offline_sync' to know source?
            $table->boolean('is_offline_sync')->default(false);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('scan_logs');
    }
};
