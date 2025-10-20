/*
  Warnings:

  - You are about to drop the `payment_proofs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `payment_proofs` DROP FOREIGN KEY `payment_proofs_order_id_fkey`;

-- DropTable
DROP TABLE `payment_proofs`;

-- CreateTable
CREATE TABLE `order_images` (
    `id` VARCHAR(191) NOT NULL,
    `file_name` VARCHAR(191) NOT NULL,
    `size` INTEGER NOT NULL,
    `public_id` VARCHAR(191) NOT NULL,
    `secure_url` VARCHAR(191) NOT NULL,
    `type` ENUM('payment_proof', 'finished_product') NOT NULL,
    `order_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `order_images_order_id_type_key`(`order_id`, `type`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `order_images` ADD CONSTRAINT `order_images_order_id_fkey` FOREIGN KEY (`order_id`) REFERENCES `orders`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
