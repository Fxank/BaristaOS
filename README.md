# ☕ BaristaOS

> Sistema de gestión para negocios de bebidas preparadas — proyecto real en producción activa, construido con Next.js 16, TypeScript, Prisma y PostgreSQL.

## 🔗 Demo en vivo

**[Demo disponible próximamente]**

| Rol           | Email             | Contraseña  |
| ------------- | ----------------- | ----------- |
| Administrador | admin@barista.os  | Demo2024#   |
| Cajero        | cajero@barista.os | Cajero2024# |

---

## 🧩 ¿Qué es BaristaOS?

BaristaOS nació de una necesidad real — gestionar un negocio de bebidas preparadas en una escuela donde el WiFi es inestable y el tiempo de atención por cliente es crítico.

El sistema fue diseñado desde el inicio para operar en condiciones reales: soporte offline completo en el punto de venta, cálculo automático de costos y márgenes, control de inventario con trazabilidad completa y roles diferenciados por tipo de usuario.

**No es un CRUD de demostración. Es un sistema en producción activa.**

---

## ✨ Funcionalidades principales

### Panel de administración (OWNER)

- **Dashboard** con KPIs en tiempo real — ventas del día, ingresos, margen de ganancia y alertas de stock bajo
- **Ingredientes** — CRUD completo con cálculo automático de costo unitario, factor de conversión entre unidades de compra y unidades base, y porcentaje de merma
- **Recetas** — gestión de bebidas con múltiples variantes de tamaño, cálculo de costos de producción en tiempo real y análisis de margen de ganancia con indicador visual
- **Grupos de opciones** — sistema de personalización por bebida (sabores, extras, toppings) con soporte de múltiples ingredientes por opción y descuento automático de inventario
- **Ventas** — historial completo con desglose de ingresos, ganancias y canal de venta
- **Inventario** — control de stock con historial de movimientos, reabastecimiento y ajustes manuales
- **Reportes** — gráficas de ingresos y ganancias por período, top productos más vendidos y análisis por canal de venta

### Punto de venta — POS (CASHIER)

- **Offline-first** — funciona completamente sin internet usando IndexedDB (Dexie.js)
- **Sincronización automática** — las ventas registradas sin conexión se sincronizan al recuperar internet sin intervención manual
- **Optimizado para móvil** — interfaz táctil diseñada para operar desde un teléfono en un entorno de ritmo alto
- **Sin información sensible** — costos de producción y márgenes de ganancia ocultos para el rol de cajero

### Seguridad

- Autenticación con NextAuth v5
- Roles diferenciados: **OWNER** (acceso total) y **CASHIER** (solo POS)
- Row Level Security habilitado en Supabase
- Credenciales de producción manejadas por variables de entorno

---

## 🛠️ Stack tecnológico

| Categoría     | Tecnología               | Justificación                                                 |
| ------------- | ------------------------ | ------------------------------------------------------------- |
| Framework     | Next.js 16 (App Router)  | Server Actions, SSR y routing sin API REST manual             |
| Lenguaje      | TypeScript estricto      | Tipado de extremo a extremo, errores en tiempo de compilación |
| Estilos       | Tailwind CSS + shadcn/ui | Componentes accesibles con control total del código           |
| Base de datos | PostgreSQL (Supabase)    | Relacional, escalable, RLS integrado                          |
| ORM           | Prisma 6                 | Tipado automático desde el schema, migraciones versionadas    |
| Autenticación | NextAuth v5              | Sesiones seguras con soporte de roles personalizados          |
| Offline/Sync  | Dexie.js (IndexedDB)     | Base de datos local en el navegador para el POS offline       |
| Gráficas      | Recharts                 | Componentes React nativos sin dependencias externas pesadas   |
| Validación    | Zod                      | Validación en cliente y servidor con tipos inferidos          |
| Deploy        | Vercel + Supabase        | CI/CD automático por rama, base de datos en la nube           |

---

## 🏗️ Arquitectura

src/
├── app/ # Next.js App Router — rutas y páginas
│ ├── page.tsx # Dashboard
│ ├── ingredients/ # Módulo de ingredientes
│ ├── recipes/ # Módulo de recetas
│ ├── sales/ # Módulo de ventas
│ ├── inventory/ # Módulo de inventario
│ ├── reports/ # Módulo de reportes
│ ├── pos/ # Punto de venta offline-first
│ ├── login/ # Autenticación
│ └── api/auth/ # NextAuth route handler
├── components/
│ ├── layout/ # Sidebar responsive con menú hamburguesa en móvil
│ ├── dashboard/ # StatsCard, LowStockAlert, RecentSales
│ ├── ingredients/ # IngredientTable, IngredientForm
│ ├── recipes/ # RecipeCard, RecipeForm, OptionGroupsManager
│ ├── sales/ # SalesList, NewSaleModal con showCosts prop
│ ├── inventory/ # InventoryTable, MovementsTable, RestockModal
│ ├── reports/ # RevenueChart, ChannelChart, TopProductsTable
│ ├── pos/ # POSClient, POSMenu, POSCart, POSStatusBar
│ └── auth/ # LoginForm
├── server/
│ ├── actions/ # Server Actions — ingredients, recipes, sales, pos
│ └── services/ # dashboard.service
├── hooks/
│ └── usePOSSync.ts # Hook de sincronización offline/online con Dexie
├── lib/
│ ├── prisma.ts # Cliente Prisma singleton (patrón global)
│ ├── db.ts # Base de datos local IndexedDB con Dexie
│ └── utils.ts # formatCurrency, formatDate (zona horaria CDMX)
├── types/ # Tipos TypeScript compartidos
├── validations/ # Schemas Zod para validación en servidor
└── auth.ts # Configuración NextAuth con roles

---

## 📐 Decisiones de arquitectura destacadas

**Offline-first en el POS**
El negocio opera en una escuela con red inestable. Las ventas se guardan localmente en IndexedDB (Dexie.js) y se sincronizan automáticamente al recuperar conexión. Un `localId` único por venta previene duplicados en caso de sincronizaciones múltiples.

**Snapshots en ventas**
Cada `SaleItem` guarda el precio y costo exacto al momento de la venta. Si mañana sube el precio de un ingrediente, el historial histórico sigue siendo correcto — refleja lo que realmente costó producir cada bebida en ese momento.

**Dual seed strategy**
`seed.ts` contiene datos ficticios realistas para el repositorio público. `seed.local.ts` (en `.gitignore`) contiene los datos reales del negocio exportados automáticamente con `pnpm db:export`. Así el proyecto es portfolio-ready sin exponer información sensible.

**Server Actions sobre API Routes**
Elimina la necesidad de endpoints REST manuales, mantiene tipado de extremo a extremo con Prisma y simplifica el manejo de errores. Las mutaciones ocurren en el servidor con `revalidatePath` para actualizar el caché automáticamente.

**Motor de costos reactivo**
El costo de producción de cada receta se calcula en tiempo real sumando `(purchasePrice / conversionFactor) * (1 + wastePercentage/100) * quantity` por ingrediente. Al modificar el precio de un ingrediente, todos los márgenes se recalculan automáticamente en la siguiente consulta.

---

## 📊 Modelo de datos

Category ──── Ingredient ──── RecipeItem ──── RecipeVariant ──── Recipe
│ │
StockMovement RecipeOptionGroup ──── RecipeOption
│
RecipeOptionIngredient ──── Ingredient

Sale ──── SaleItem ──── SaleItemOption ──── SaleItemOptionIngredient

---

## 🚀 Instalación local

### Requisitos previos

- Node.js 20+
- pnpm (`npm install -g pnpm`)
- Docker Desktop

### Configuración

```bash
# 1. Clonar el repositorio
git clone https://github.com/Fxank/barista-os.git
cd barista-os

# 2. Instalar dependencias
pnpm install

# 3. Copiar variables de entorno
cp .env.example .env
# Edita .env con tus valores (ver sección siguiente)

# 4. Iniciar PostgreSQL local con Docker
docker run --name barista-os-db \
  -e POSTGRES_PASSWORD=barista123 \
  -e POSTGRES_DB=barista_os \
  -p 5432:5432 -d postgres:16

# 5. Correr migraciones y seed de demo
pnpm exec prisma migrate deploy
pnpm db:seed

# 6. Iniciar el servidor de desarrollo
docker start barista-os-db
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000)

### Variables de entorno

```env
# Base de datos
DATABASE_URL="postgresql://postgres:barista123@localhost:5432/barista_os"
DIRECT_URL="postgresql://postgres:barista123@localhost:5432/barista_os"

# NextAuth
AUTH_SECRET="genera-con: node -e \"console.log(require('crypto').randomBytes(32).toString('hex'))\""

# Credenciales de usuarios
OWNER_PASSWORD="tu-contraseña-admin"
CASHIER_PASSWORD="tu-contraseña-cajero"
```

### Comandos útiles

```bash
pnpm dev              # Servidor de desarrollo
pnpm build            # Build de producción
pnpm db:seed          # Cargar datos de demo
pnpm db:reset         # Resetear base de datos
pnpm db:studio        # Abrir Prisma Studio
pnpm db:export        # Exportar datos reales a seed.local.ts
pnpm db:seed:local    # Cargar datos reales (requiere seed.local.ts)
```

---

## 🔮 Próximas funcionalidades

- [ ] Método de pago por venta (efectivo / transferencia)
- [ ] Sistema de lealtad digital por cliente
- [ ] Usuarios individuales por empleado con trazabilidad de ventas
- [ ] Vista de recetas para cajeros (ingredientes sin costos)
- [ ] CRUD de categorías desde la interfaz
- [ ] Exportación de reportes a PDF/Excel
- [ ] Soporte multi-sucursal
- [ ] Notificaciones de stock bajo

---

## 👨‍💻 Autor

**Francisco Lopez Villamar** — Estudiante de Ingeniería en Computación

[![GitHub](https://img.shields.io/badge/GitHub-Fxank-181717?style=flat&logo=github)](https://github.com/Fxank)

---

_BaristaOS es un proyecto real en producción activa para un negocio de bebidas preparadas. Fue construido con énfasis en arquitectura escalable, experiencia de usuario en condiciones reales y buenas prácticas de desarrollo._
