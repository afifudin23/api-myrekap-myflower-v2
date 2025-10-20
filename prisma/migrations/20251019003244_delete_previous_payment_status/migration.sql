/*
  Warnings:

  - You are about to drop the column `previous_payment_status` on the `orders` table. All the data in the column will be lost.
  - The values [akademik,rumah_sakit,polisi_militer] on the enum `orders_customer_category` will be removed. If these variants are still used in the database, this will fail.
  - The values [canceled] on the enum `orders_payment_status` will be removed. If these variants are still used in the database, this will fail.
  - The values [akademik,rumah_sakit,polisi_militer] on the enum `orders_customer_category` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `orders` DROP COLUMN `previous_payment_status`,
    MODIFY `customer_category` ENUM('umum', 'pemda', 'perbankan') NOT NULL DEFAULT 'umum',
    MODIFY `payment_status` ENUM('pending', 'unpaid', 'paid', 'expired', 'refunded', 'denied') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `users` MODIFY `customer_category` ENUM('umum', 'pemda', 'perbankan') NULL;
