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
        Schema::table('events', function (Blueprint $table) {
            $table->string('banner_url')->nullable();
        });

        Schema::table('ticket_types', function (Blueprint $table) {
            $table->string('image_url')->nullable();
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->string('logo_url')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn('banner_url');
        });

        Schema::table('ticket_types', function (Blueprint $table) {
            $table->dropColumn('image_url');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn('logo_url');
        });
    }
};
