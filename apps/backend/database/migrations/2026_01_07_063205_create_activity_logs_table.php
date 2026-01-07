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
        Schema::create('activity_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignUuid('tenant_id')->nullable()->constrained()->cascadeOnDelete();

            // User who performed action
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();

            $table->string('actable_type')->nullable();
            $table->uuid('actable_id')->nullable();

            $table->string('action'); // create, update, delete, login, etc
            $table->text('description')->nullable();

            $table->json('properties')->nullable(); // changed attributes

            $table->string('ip_address')->nullable();
            $table->string('user_agent')->nullable();

            $table->timestamps();

            $table->index(['actable_type', 'actable_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('activity_logs');
    }
};
