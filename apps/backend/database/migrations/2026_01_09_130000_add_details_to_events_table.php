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
            $table->longText('description')->nullable()->after('name');
            $table->longText('terms_and_conditions')->nullable()->after('description');
            $table->text('facilities')->nullable()->after('terms_and_conditions');
            $table->json('social_media')->nullable()->after('facilities');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            $table->dropColumn(['description', 'terms_and_conditions', 'facilities', 'social_media']);
        });
    }
};
