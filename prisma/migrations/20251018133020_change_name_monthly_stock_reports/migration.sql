/*
  Warnings:

  - You are about to drop the `MonthlyStockReport` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `MonthlyStockReport` DROP FOREIGN KEY `MonthlyStockReport_product_id_fkey`;

-- DropTable
DROP TABLE `MonthlyStockReport`;

-- CreateTable
CREATE TABLE `monthly_stock_reports` (
    `id` VARCHAR(191) NOT NULL,
    `product_id` VARCHAR(191) NOT NULL,
    `month` INTEGER NOT NULL,
    `year` INTEGER NOT NULL,
    `initial_stock` INTEGER NOT NULL,
    `stock_in` INTEGER NOT NULL,
    `stock_out` INTEGER NOT NULL,
    `final_stock` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `monthly_stock_reports` ADD CONSTRAINT `monthly_stock_reports_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
