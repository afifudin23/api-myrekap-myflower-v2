/*
  Warnings:

  - A unique constraint covering the columns `[product_id,month,year]` on the table `monthly_stock_reports` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `monthly_stock_reports_product_id_month_year_key` ON `monthly_stock_reports`(`product_id`, `month`, `year`);
