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
        // 1. Make tenant_id nullable in affiliates
        Schema::table('affiliates', function (Blueprint $table) {
            $table->foreignUuid('tenant_id')->nullable()->change();
        });

        // 2. Add commission settings to events
        Schema::table('events', function (Blueprint $table) {
            $table->boolean('affiliate_enabled')->default(false);
            $table->string('commission_type')->default('percent'); // percent, fixed
            $table->decimal('commission_value', 12, 2)->default(0);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('affiliates', function (Blueprint $table) {
            // Revert nullable is tricky with data, but we define intent
            // $table->foreignUuid('tenant_id')->nullable(false)->change(); 
            // Better to leave nullable or handle data cleanup
        });

        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['affiliate_enabled', 'commission_type', 'commission_value']);
        });
    }
};
