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
        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('buyer_phone', 'buyer_whatsapp');
            $table->enum('delivery_method', ['email', 'whatsapp', 'both'])->default('email')->after('buyer_email');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->renameColumn('buyer_whatsapp', 'buyer_phone');
            $table->dropColumn('delivery_method');
        });
    }
};
