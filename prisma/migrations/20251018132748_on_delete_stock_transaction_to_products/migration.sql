-- DropForeignKey
ALTER TABLE `stock_transactions` DROP FOREIGN KEY `stock_transactions_product_id_fkey`;

-- DropIndex
DROP INDEX `stock_transactions_product_id_fkey` ON `stock_transactions`;

-- AddForeignKey
ALTER TABLE `stock_transactions` ADD CONSTRAINT `stock_transactions_product_id_fkey` FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
