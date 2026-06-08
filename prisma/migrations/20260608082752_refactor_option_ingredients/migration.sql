/*
  Warnings:

  - You are about to drop the column `ingredientId` on the `RecipeOption` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `RecipeOption` table. All the data in the column will be lost.
  - You are about to drop the column `quantity` on the `SaleItemOption` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "RecipeOption" DROP CONSTRAINT "RecipeOption_ingredientId_fkey";

-- AlterTable
ALTER TABLE "RecipeOption" DROP COLUMN "ingredientId",
DROP COLUMN "quantity";

-- AlterTable
ALTER TABLE "SaleItemOption" DROP COLUMN "quantity";

-- CreateTable
CREATE TABLE "RecipeOptionIngredient" (
    "id" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "optionId" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,

    CONSTRAINT "RecipeOptionIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItemOptionIngredient" (
    "id" TEXT NOT NULL,
    "ingredientId" TEXT NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "unitCost" DECIMAL(65,30) NOT NULL,
    "saleItemOptionId" TEXT NOT NULL,

    CONSTRAINT "SaleItemOptionIngredient_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RecipeOptionIngredient_optionId_ingredientId_key" ON "RecipeOptionIngredient"("optionId", "ingredientId");

-- AddForeignKey
ALTER TABLE "RecipeOptionIngredient" ADD CONSTRAINT "RecipeOptionIngredient_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "RecipeOption"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeOptionIngredient" ADD CONSTRAINT "RecipeOptionIngredient_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItemOptionIngredient" ADD CONSTRAINT "SaleItemOptionIngredient_saleItemOptionId_fkey" FOREIGN KEY ("saleItemOptionId") REFERENCES "SaleItemOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
