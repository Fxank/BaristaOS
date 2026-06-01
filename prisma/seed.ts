import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding BaristaOS database...')

  // ============================================================
  // CATEGORÍAS
  // ============================================================
  const [
    lacteosCat,
    cafesCat,
    endulzantesCat,
    saborizantesCat,
    desechablesCat,
    frappesCat,
    cafesCalientesCat,
    bebidasFriasCat,
  ] = await Promise.all([
    prisma.category.upsert({
      where: { name_type: { name: 'Lácteos', type: 'INGREDIENT' } },
      update: {},
      create: { name: 'Lácteos', type: 'INGREDIENT', color: '#3B82F6' },
    }),
    prisma.category.upsert({
      where: { name_type: { name: 'Cafés y bases', type: 'INGREDIENT' } },
      update: {},
      create: { name: 'Cafés y bases', type: 'INGREDIENT', color: '#92400E' },
    }),
    prisma.category.upsert({
      where: { name_type: { name: 'Endulzantes', type: 'INGREDIENT' } },
      update: {},
      create: { name: 'Endulzantes', type: 'INGREDIENT', color: '#F59E0B' },
    }),
    prisma.category.upsert({
      where: { name_type: { name: 'Saborizantes', type: 'INGREDIENT' } },
      update: {},
      create: { name: 'Saborizantes', type: 'INGREDIENT', color: '#8B5CF6' },
    }),
    prisma.category.upsert({
      where: { name_type: { name: 'Desechables', type: 'INGREDIENT' } },
      update: {},
      create: { name: 'Desechables', type: 'INGREDIENT', color: '#6B7280' },
    }),
    prisma.category.upsert({
      where: { name_type: { name: 'Frappés', type: 'RECIPE' } },
      update: {},
      create: { name: 'Frappés', type: 'RECIPE', color: '#06B6D4' },
    }),
    prisma.category.upsert({
      where: { name_type: { name: 'Cafés calientes', type: 'RECIPE' } },
      update: {},
      create: { name: 'Cafés calientes', type: 'RECIPE', color: '#DC2626' },
    }),
    prisma.category.upsert({
      where: { name_type: { name: 'Bebidas frías', type: 'RECIPE' } },
      update: {},
      create: { name: 'Bebidas frías', type: 'RECIPE', color: '#059669' },
    }),
  ])

  console.log('✅ Categorías creadas')

  // ============================================================
  // PROVEEDOR
  // ============================================================
  const supplier = await prisma.supplier.upsert({
    where: { id: 'supplier-demo-001' },
    update: {},
    create: {
      id: 'supplier-demo-001',
      name: 'Distribuidora La Esperanza',
      contact: 'Carlos Méndez',
      phone: '555-123-4567',
      email: 'ventas@laesperanza.com',
    },
  })

  console.log(`✅ Proveedor creado: ${supplier.name}`)

  // ============================================================
  // INGREDIENTES
  // ============================================================
  const [
    ingLeche,
    ingCrema,
    ingCafeSoluble,
    ingCafeEspresso,
    ingAzucar,
    ingJarabeVainilla,
    ingJarabeMango,
    ingChocolate,
    ingVaso,
    ingPopote,
  ] = await Promise.all([
    prisma.ingredient.upsert({
      where: { id: 'ing-demo-leche' },
      update: {},
      create: {
        id: 'ing-demo-leche',
        name: 'Leche entera',
        baseUnit: 'ml',
        purchaseUnit: 'litro',
        conversionFactor: 1000,
        purchasePrice: 24,
        currentStock: 10,
        minimumStock: 3,
        wastePercentage: 2,
        categoryId: lacteosCat.id,
        supplierId: supplier.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: 'ing-demo-crema' },
      update: {},
      create: {
        id: 'ing-demo-crema',
        name: 'Crema para batir',
        baseUnit: 'ml',
        purchaseUnit: 'litro',
        conversionFactor: 1000,
        purchasePrice: 85,
        currentStock: 4,
        minimumStock: 1,
        wastePercentage: 3,
        categoryId: lacteosCat.id,
        supplierId: supplier.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: 'ing-demo-cafe-soluble' },
      update: {},
      create: {
        id: 'ing-demo-cafe-soluble',
        name: 'Café soluble',
        baseUnit: 'g',
        purchaseUnit: 'kg',
        conversionFactor: 1000,
        purchasePrice: 320,
        currentStock: 2,
        minimumStock: 0.5,
        wastePercentage: 1,
        categoryId: cafesCat.id,
        supplierId: supplier.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: 'ing-demo-cafe-espresso' },
      update: {},
      create: {
        id: 'ing-demo-cafe-espresso',
        name: 'Café espresso molido',
        baseUnit: 'g',
        purchaseUnit: 'kg',
        conversionFactor: 1000,
        purchasePrice: 280,
        currentStock: 1.5,
        minimumStock: 0.5,
        wastePercentage: 2,
        categoryId: cafesCat.id,
        supplierId: supplier.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: 'ing-demo-azucar' },
      update: {},
      create: {
        id: 'ing-demo-azucar',
        name: 'Azúcar estándar',
        baseUnit: 'g',
        purchaseUnit: 'kg',
        conversionFactor: 1000,
        purchasePrice: 28,
        currentStock: 5,
        minimumStock: 1,
        wastePercentage: 0,
        categoryId: endulzantesCat.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: 'ing-demo-vainilla' },
      update: {},
      create: {
        id: 'ing-demo-vainilla',
        name: 'Jarabe de vainilla',
        baseUnit: 'ml',
        purchaseUnit: 'litro',
        conversionFactor: 1000,
        purchasePrice: 180,
        currentStock: 2,
        minimumStock: 0.5,
        wastePercentage: 1,
        categoryId: saborizantesCat.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: 'ing-demo-mango' },
      update: {},
      create: {
        id: 'ing-demo-mango',
        name: 'Jarabe de mango',
        baseUnit: 'ml',
        purchaseUnit: 'litro',
        conversionFactor: 1000,
        purchasePrice: 165,
        currentStock: 1.5,
        minimumStock: 0.5,
        wastePercentage: 1,
        categoryId: saborizantesCat.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: 'ing-demo-chocolate' },
      update: {},
      create: {
        id: 'ing-demo-chocolate',
        name: 'Chocolate en polvo',
        baseUnit: 'g',
        purchaseUnit: 'kg',
        conversionFactor: 1000,
        purchasePrice: 145,
        currentStock: 3,
        minimumStock: 0.5,
        wastePercentage: 2,
        categoryId: saborizantesCat.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: 'ing-demo-vaso' },
      update: {},
      create: {
        id: 'ing-demo-vaso',
        name: 'Vaso plástico 500ml',
        baseUnit: 'pieza',
        purchaseUnit: 'paquete',
        conversionFactor: 50,
        purchasePrice: 85,
        currentStock: 4,
        minimumStock: 1,
        wastePercentage: 0,
        categoryId: desechablesCat.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: 'ing-demo-popote' },
      update: {},
      create: {
        id: 'ing-demo-popote',
        name: 'Popote',
        baseUnit: 'pieza',
        purchaseUnit: 'paquete',
        conversionFactor: 100,
        purchasePrice: 35,
        currentStock: 3,
        minimumStock: 1,
        wastePercentage: 0,
        categoryId: desechablesCat.id,
      },
    }),
  ])

  console.log('✅ Ingredientes creados')

  // ============================================================
  // RECETAS
  // ============================================================

  // Frappé Moka
  const frappeMoka = await prisma.recipe.upsert({
    where: { id: 'recipe-demo-frappe-moka' },
    update: {},
    create: {
      id: 'recipe-demo-frappe-moka',
      name: 'Frappé Moka',
      description: 'Frappé cremoso de café con chocolate',
      prepTimeMinutes: 4,
      status: 'ACTIVE',
      categoryId: frappesCat.id,
    },
  })

  await Promise.all([
    prisma.recipeVariant.upsert({
      where: { id: 'variant-demo-moka-md' },
      update: {},
      create: {
        id: 'variant-demo-moka-md',
        recipeId: frappeMoka.id,
        size: 'Mediano',
        salePrice: 65,
        items: {
          create: [
            { ingredientId: ingCafeSoluble.id, quantity: 15 },
            { ingredientId: ingLeche.id, quantity: 250 },
            { ingredientId: ingAzucar.id, quantity: 20 },
            { ingredientId: ingChocolate.id, quantity: 20 },
            { ingredientId: ingVaso.id, quantity: 1 },
            { ingredientId: ingPopote.id, quantity: 1 },
          ],
        },
      },
    }),
    prisma.recipeVariant.upsert({
      where: { id: 'variant-demo-moka-lg' },
      update: {},
      create: {
        id: 'variant-demo-moka-lg',
        recipeId: frappeMoka.id,
        size: 'Grande',
        salePrice: 80,
        items: {
          create: [
            { ingredientId: ingCafeSoluble.id, quantity: 20 },
            { ingredientId: ingLeche.id, quantity: 350 },
            { ingredientId: ingAzucar.id, quantity: 25 },
            { ingredientId: ingChocolate.id, quantity: 25 },
            { ingredientId: ingVaso.id, quantity: 1 },
            { ingredientId: ingPopote.id, quantity: 1 },
          ],
        },
      },
    }),
  ])

  // Frappé Vainilla
  const frappeVainilla = await prisma.recipe.upsert({
    where: { id: 'recipe-demo-frappe-vainilla' },
    update: {},
    create: {
      id: 'recipe-demo-frappe-vainilla',
      name: 'Frappé Vainilla',
      description: 'Frappé suave con jarabe de vainilla y crema',
      prepTimeMinutes: 4,
      status: 'ACTIVE',
      categoryId: frappesCat.id,
    },
  })

  await prisma.recipeVariant.upsert({
    where: { id: 'variant-demo-vainilla-md' },
    update: {},
    create: {
      id: 'variant-demo-vainilla-md',
      recipeId: frappeVainilla.id,
      size: 'Mediano',
      salePrice: 65,
      items: {
        create: [
          { ingredientId: ingCafeSoluble.id, quantity: 15 },
          { ingredientId: ingLeche.id, quantity: 200 },
          { ingredientId: ingJarabeVainilla.id, quantity: 30 },
          { ingredientId: ingCrema.id, quantity: 50 },
          { ingredientId: ingVaso.id, quantity: 1 },
          { ingredientId: ingPopote.id, quantity: 1 },
        ],
      },
    },
  })

  // Café Americano
  const cafeAmericano = await prisma.recipe.upsert({
    where: { id: 'recipe-demo-americano' },
    update: {},
    create: {
      id: 'recipe-demo-americano',
      name: 'Café Americano',
      description: 'Espresso con agua caliente',
      prepTimeMinutes: 2,
      status: 'ACTIVE',
      categoryId: cafesCalientesCat.id,
    },
  })

  await prisma.recipeVariant.upsert({
    where: { id: 'variant-demo-americano' },
    update: {},
    create: {
      id: 'variant-demo-americano',
      recipeId: cafeAmericano.id,
      size: 'Único',
      salePrice: 35,
      items: {
        create: [{ ingredientId: ingCafeEspresso.id, quantity: 18 }],
      },
    },
  })

  // Soda Italiana — con grupos de opciones
  const sodaItaliana = await prisma.recipe.upsert({
    where: { id: 'recipe-demo-soda' },
    update: {},
    create: {
      id: 'recipe-demo-soda',
      name: 'Soda Italiana',
      description: 'Bebida fría con jarabe y agua mineral',
      prepTimeMinutes: 3,
      status: 'ACTIVE',
      categoryId: bebidasFriasCat.id,
    },
  })

  await prisma.recipeVariant.upsert({
    where: { id: 'variant-demo-soda' },
    update: {},
    create: {
      id: 'variant-demo-soda',
      recipeId: sodaItaliana.id,
      size: 'Único',
      salePrice: 55,
      items: {
        create: [
          { ingredientId: ingVaso.id, quantity: 1 },
          { ingredientId: ingPopote.id, quantity: 1 },
        ],
      },
    },
  })

  // Grupo de opciones: Sabor
  await prisma.recipeOptionGroup.upsert({
    where: { id: 'group-demo-sabor' },
    update: {},
    create: {
      id: 'group-demo-sabor',
      recipeId: sodaItaliana.id,
      name: 'Sabor',
      required: true,
      multiSelect: false,
      sortOrder: 0,
      options: {
        create: [
          {
            name: 'Vainilla',
            ingredientId: ingJarabeVainilla.id,
            quantity: 30,
            priceModifier: 0,
            sortOrder: 0,
            isDefault: true,
          },
          {
            name: 'Mango',
            ingredientId: ingJarabeMango.id,
            quantity: 30,
            priceModifier: 0,
            sortOrder: 1,
            isDefault: false,
          },
        ],
      },
    },
  })

  // Grupo de opciones: Extras
  await prisma.recipeOptionGroup.upsert({
    where: { id: 'group-demo-extras' },
    update: {},
    create: {
      id: 'group-demo-extras',
      recipeId: sodaItaliana.id,
      name: 'Extras',
      required: false,
      multiSelect: true,
      sortOrder: 1,
      options: {
        create: [
          {
            name: 'Crema batida',
            ingredientId: ingCrema.id,
            quantity: 30,
            priceModifier: 5,
            sortOrder: 0,
            isDefault: false,
          },
        ],
      },
    },
  })

  console.log('✅ Recetas creadas con variantes y opciones')

  // ============================================================
  // VENTAS DE EJEMPLO
  // ============================================================
  const ventas = [
    {
      id: 'sale-demo-001',
      folio: 'VTA-0001',
      items: [
        {
          recipeId: frappeMoka.id,
          variantId: 'variant-demo-moka-md',
          quantity: 2,
          unitPrice: 65,
          unitCost: 8.5,
        },
      ],
    },
    {
      id: 'sale-demo-002',
      folio: 'VTA-0002',
      items: [
        {
          recipeId: cafeAmericano.id,
          variantId: 'variant-demo-americano',
          quantity: 1,
          unitPrice: 35,
          unitCost: 5.04,
        },
        {
          recipeId: frappeVainilla.id,
          variantId: 'variant-demo-vainilla-md',
          quantity: 1,
          unitPrice: 65,
          unitCost: 10.2,
        },
      ],
    },
    {
      id: 'sale-demo-003',
      folio: 'VTA-0003',
      items: [
        {
          recipeId: frappeMoka.id,
          variantId: 'variant-demo-moka-lg',
          quantity: 1,
          unitPrice: 80,
          unitCost: 11.8,
        },
      ],
    },
  ]

  for (const venta of ventas) {
    await prisma.sale.upsert({
      where: { id: venta.id },
      update: {},
      create: {
        id: venta.id,
        folio: venta.folio,
        status: 'COMPLETED',
        channel: 'IN_STORE',
        discount: 0,
        items: {
          create: venta.items.map((item) => ({
            recipeId: item.recipeId,
            recipeVariantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            unitCost: item.unitCost,
          })),
        },
      },
    })
  }

  console.log('✅ Ventas de ejemplo creadas')
  console.log('🚀 BaristaOS demo database seeded successfully!')
  console.log('')
  console.log('📌 Para cargar datos reales del negocio:')
  console.log('   pnpm db:seed:local')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
