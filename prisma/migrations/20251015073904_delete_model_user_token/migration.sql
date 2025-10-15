/*
  Warnings:

  - You are about to drop the `user_tokens` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `user_tokens` DROP FOREIGN KEY `user_tokens_user_id_fkey`;

-- DropTable
DROP TABLE `user_tokens`;
