/*
  Warnings:

  - The values [pickup] on the enum `orders_delivery_option` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `orders` MODIFY `delivery_option` ENUM('delivery', 'self_pickup') NOT NULL;
