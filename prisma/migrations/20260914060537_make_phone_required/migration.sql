/*
  Warnings:

  - Made the column `phone` on table `LoyaltyCard` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "LoyaltyCard" ALTER COLUMN "phone" SET NOT NULL;
