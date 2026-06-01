-- CreateTable
CREATE TABLE "RecipeOptionGroup" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL DEFAULT true,
    "multiSelect" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "recipeId" TEXT NOT NULL,

    CONSTRAINT "RecipeOptionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RecipeOption" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priceModifier" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "quantity" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "groupId" TEXT NOT NULL,
    "ingredientId" TEXT,

    CONSTRAINT "RecipeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SaleItemOption" (
    "id" TEXT NOT NULL,
    "optionName" TEXT NOT NULL,
    "priceModifier" DECIMAL(65,30) NOT NULL,
    "quantity" DECIMAL(65,30) NOT NULL,
    "saleItemId" TEXT NOT NULL,
    "optionId" TEXT NOT NULL,

    CONSTRAINT "SaleItemOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RecipeOptionGroup" ADD CONSTRAINT "RecipeOptionGroup_recipeId_fkey" FOREIGN KEY ("recipeId") REFERENCES "Recipe"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeOption" ADD CONSTRAINT "RecipeOption_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "RecipeOptionGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RecipeOption" ADD CONSTRAINT "RecipeOption_ingredientId_fkey" FOREIGN KEY ("ingredientId") REFERENCES "Ingredient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItemOption" ADD CONSTRAINT "SaleItemOption_saleItemId_fkey" FOREIGN KEY ("saleItemId") REFERENCES "SaleItem"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SaleItemOption" ADD CONSTRAINT "SaleItemOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "RecipeOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
