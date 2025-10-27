/*
  Warnings:

  - You are about to alter the column `posX` on the `ImageTag` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.
  - You are about to alter the column `posY` on the `ImageTag` table. The data in that column could be lost. The data in that column will be cast from `Decimal(65,30)` to `DoublePrecision`.

*/
-- AlterTable
ALTER TABLE "public"."ImageTag" ALTER COLUMN "posX" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "posY" SET DATA TYPE DOUBLE PRECISION;
