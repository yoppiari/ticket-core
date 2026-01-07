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
        Schema::create('invitations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('email');
            $table->string('role')->default('scanner');
            $table->string('token')->unique();
            $table->foreignUuid('tenant_id')->constrained()->onDelete('cascade');
            $table->timestamp('expires_at');
            $table->timestamps();

            $table->unique(['email', 'tenant_id']); // Prevent duplicate invites
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invitations');
    }
};
