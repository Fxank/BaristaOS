import { PrismaClient } from '../src/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding BaristaOS database...')

  // ============================================================
  // CATEGORÍAS
  // ============================================================
  const categories = await Promise.all([
    // Categorías de ingredientes
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
    // Categorías de recetas
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

  console.log(`✅ ${categories.length} categorías creadas`)

  // ============================================================
  // PROVEEDOR
  // ============================================================
  const supplier = await prisma.supplier.upsert({
    where: { id: 'supplier-001' },
    update: {},
    create: {
      id: 'supplier-001',
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
  const lacteosCat = categories[0]
  const cafesCat = categories[1]
  const endulzantesCat = categories[2]
  const saborizantesCat = categories[3]
  const desechablesCat = categories[4]

  const ingredients = await Promise.all([
    // Lácteos
    prisma.ingredient.upsert({
      where: { id: 'ing-leche' },
      update: {},
      create: {
        id: 'ing-leche',
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
      where: { id: 'ing-crema' },
      update: {},
      create: {
        id: 'ing-crema',
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
    // Cafés
    prisma.ingredient.upsert({
      where: { id: 'ing-cafe-soluble' },
      update: {},
      create: {
        id: 'ing-cafe-soluble',
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
      where: { id: 'ing-cafe-espresso' },
      update: {},
      create: {
        id: 'ing-cafe-espresso',
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
    // Endulzantes
    prisma.ingredient.upsert({
      where: { id: 'ing-azucar' },
      update: {},
      create: {
        id: 'ing-azucar',
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
      where: { id: 'ing-jarabe-vainilla' },
      update: {},
      create: {
        id: 'ing-jarabe-vainilla',
        name: 'Jarabe de vainilla',
        baseUnit: 'ml',
        purchaseUnit: 'litro',
        conversionFactor: 1000,
        purchasePrice: 180,
        currentStock: 2,
        minimumStock: 0.5,
        wastePercentage: 1,
        categoryId: endulzantesCat.id,
      },
    }),
    // Saborizantes
    prisma.ingredient.upsert({
      where: { id: 'ing-chocolate' },
      update: {},
      create: {
        id: 'ing-chocolate',
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
      where: { id: 'ing-caramelo' },
      update: {},
      create: {
        id: 'ing-caramelo',
        name: 'Jarabe de caramelo',
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
    // Desechables
    prisma.ingredient.upsert({
      where: { id: 'ing-vaso-frio' },
      update: {},
      create: {
        id: 'ing-vaso-frio',
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
      where: { id: 'ing-tapa' },
      update: {},
      create: {
        id: 'ing-tapa',
        name: 'Tapa para vaso frío',
        baseUnit: 'pieza',
        purchaseUnit: 'paquete',
        conversionFactor: 50,
        purchasePrice: 45,
        currentStock: 4,
        minimumStock: 1,
        wastePercentage: 0,
        categoryId: desechablesCat.id,
      },
    }),
    prisma.ingredient.upsert({
      where: { id: 'ing-popote' },
      update: {},
      create: {
        id: 'ing-popote',
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

  console.log(`✅ ${ingredients.length} ingredientes creados`)

  // ============================================================
  // RECETAS
  // ============================================================

  const frappesCat = categories[5]
  const cafesCalientesCat = categories[6]

  const [
    ingLeche,
    ingCrema,
    ingCafeSoluble,
    ingCafeEspresso,
    ingAzucar,
    ingJarabeVainilla,
    ingChocolate,
    ingCaramelo,
    ingVaso,
    ingTapa,
    ingPopote,
  ] = ingredients

  // Frappé Moka
  const frappeMoka = await prisma.recipe.upsert({
    where: { id: 'recipe-frappe-moka' },
    update: {},
    create: {
      id: 'recipe-frappe-moka',
      name: 'Frappé Moka',
      description: 'Frappé cremoso de café con chocolate',
      prepTimeMinutes: 4,
      status: 'ACTIVE',
      categoryId: frappesCat.id,
    },
  })

  await Promise.all([
    // Variante Mediano
    prisma.recipeVariant.upsert({
      where: { id: 'variant-frappe-moka-md' },
      update: {},
      create: {
        id: 'variant-frappe-moka-md',
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
            { ingredientId: ingTapa.id, quantity: 1 },
            { ingredientId: ingPopote.id, quantity: 1 },
          ],
        },
      },
    }),
    // Variante Grande
    prisma.recipeVariant.upsert({
      where: { id: 'variant-frappe-moka-lg' },
      update: {},
      create: {
        id: 'variant-frappe-moka-lg',
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
            { ingredientId: ingTapa.id, quantity: 1 },
            { ingredientId: ingPopote.id, quantity: 1 },
          ],
        },
      },
    }),
  ])

  // Frappé Vainilla
  const frappeVainilla = await prisma.recipe.upsert({
    where: { id: 'recipe-frappe-vainilla' },
    update: {},
    create: {
      id: 'recipe-frappe-vainilla',
      name: 'Frappé Vainilla',
      description: 'Frappé suave con jarabe de vainilla y crema',
      prepTimeMinutes: 4,
      status: 'ACTIVE',
      categoryId: frappesCat.id,
    },
  })

  await prisma.recipeVariant.upsert({
    where: { id: 'variant-frappe-vainilla-md' },
    update: {},
    create: {
      id: 'variant-frappe-vainilla-md',
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
          { ingredientId: ingTapa.id, quantity: 1 },
          { ingredientId: ingPopote.id, quantity: 1 },
        ],
      },
    },
  })

  // Café Americano
  const cafeAmericano = await prisma.recipe.upsert({
    where: { id: 'recipe-americano' },
    update: {},
    create: {
      id: 'recipe-americano',
      name: 'Café Americano',
      description: 'Espresso con agua caliente',
      prepTimeMinutes: 2,
      status: 'ACTIVE',
      categoryId: cafesCalientesCat.id,
    },
  })

  await prisma.recipeVariant.upsert({
    where: { id: 'variant-americano-unico' },
    update: {},
    create: {
      id: 'variant-americano-unico',
      recipeId: cafeAmericano.id,
      size: 'Único',
      salePrice: 35,
      items: {
        create: [{ ingredientId: ingCafeEspresso.id, quantity: 18 }],
      },
    },
  })

  // Café Caramelo
  const cafeCaramelo = await prisma.recipe.upsert({
    where: { id: 'recipe-cafe-caramelo' },
    update: {},
    create: {
      id: 'recipe-cafe-caramelo',
      name: 'Café Caramelo',
      description: 'Espresso con leche vaporizada y jarabe de caramelo',
      prepTimeMinutes: 3,
      status: 'ACTIVE',
      categoryId: cafesCalientesCat.id,
    },
  })

  await prisma.recipeVariant.upsert({
    where: { id: 'variant-cafe-caramelo-unico' },
    update: {},
    create: {
      id: 'variant-cafe-caramelo-unico',
      recipeId: cafeCaramelo.id,
      size: 'Único',
      salePrice: 55,
      items: {
        create: [
          { ingredientId: ingCafeEspresso.id, quantity: 18 },
          { ingredientId: ingLeche.id, quantity: 150 },
          { ingredientId: ingCaramelo.id, quantity: 25 },
        ],
      },
    },
  })

  console.log(`✅ Recetas creadas con sus variantes`)
  console.log('🚀 BaristaOS database seeded successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
