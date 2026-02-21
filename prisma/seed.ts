import { PrismaClient, Role, OrderStatus } from "@/lib/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcrypt";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

// Helper to generate random date within range
function randomDate(start: Date, end: Date): Date {
  return new Date(
    start.getTime() + Math.random() * (end.getTime() - start.getTime()),
  );
}

// Helper to get random item from array
function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Helper to get random number in range
function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export async function main() {
  console.log("🌱 Seeding database...\n");

  // Clean existing data
  console.log("🧹 Cleaning existing data...");
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryImport.deleteMany();
  await prisma.ingredient.deleteMany();
  await prisma.productVariant.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  // ============================================
  // USERS
  // ============================================
  console.log("👤 Creating users...");
  const adminPassword = await hashPassword("admin123");
  const staffPassword = await hashPassword("staff123");

  const admin = await prisma.user.create({
    data: {
      name: "Admin Hong Van",
      email: "admin@hongvan.com",
      passwordHash: adminPassword,
      role: Role.ADMIN,
      isActive: true,
    },
  });

  const staff1 = await prisma.user.create({
    data: {
      name: "Nguyễn Thị Mai",
      email: "mai@hongvan.com",
      passwordHash: staffPassword,
      role: Role.STAFF,
      isActive: true,
    },
  });

  const staff2 = await prisma.user.create({
    data: {
      name: "Trần Văn Hùng",
      email: "hung@hongvan.com",
      passwordHash: staffPassword,
      role: Role.STAFF,
      isActive: true,
    },
  });

  const users = [admin, staff1, staff2];
  console.log(`   ✅ Created ${users.length} users`);

  // ============================================
  // CATEGORIES
  // ============================================
  console.log("📁 Creating categories...");
  const categoryData = [
    { name: "Gà" },
    { name: "Xôi" },
    { name: "Nước uống" },
    { name: "Món ăn kèm" },
  ];

  const categories = await Promise.all(
    categoryData.map((cat) => prisma.category.create({ data: cat })),
  );
  console.log(`   ✅ Created ${categories.length} categories`);

  // ============================================
  // INGREDIENTS (Nguyên liệu)
  // ============================================
  console.log("🥬 Creating ingredients...");
  const ingredientData = [
    { name: "Gà nguyên con", unit: "con" },
    { name: "Gạo nếp", unit: "kg" },
    { name: "Đậu xanh", unit: "kg" },
    { name: "Hành phi", unit: "kg" },
    { name: "Mỡ hành", unit: "lít" },
    { name: "Nước mắm", unit: "lít" },
    { name: "Ớt tươi", unit: "kg" },
    { name: "Rau răm", unit: "bó" },
    { name: "Chanh", unit: "kg" },
    { name: "Gừng", unit: "kg" },
    { name: "Coca Cola", unit: "chai" },
    { name: "Pepsi", unit: "chai" },
    { name: "Nước suối", unit: "chai" },
    { name: "Dưa chuột muối", unit: "kg" },
    { name: "Giá đỗ", unit: "kg" },
  ];

  const ingredients = await Promise.all(
    ingredientData.map((ing) =>
      prisma.ingredient.create({
        data: {
          name: ing.name,
          unit: ing.unit,
          stockQuantity: randomInt(5, 50),
        },
      }),
    ),
  );
  console.log(`   ✅ Created ${ingredients.length} ingredients`);

  // ============================================
  // PRODUCTS
  // ============================================
  console.log("🍗 Creating products...");

  const gaCategory = categories.find((c) => c.name === "Gà")!;
  const xoiCategory = categories.find((c) => c.name === "Xôi")!;
  const nuocCategory = categories.find((c) => c.name === "Nước uống")!;
  const monKemCategory = categories.find((c) => c.name === "Món ăn kèm")!;

  // Gà products
  const gaLuoc = await prisma.product.create({
    data: {
      name: "Gà Luộc",
      description: "Gà ta luộc nguyên con, thịt ngọt, da giòn",
      categoryId: gaCategory.id,
      variants: {
        create: [
          { name: "Nửa con", sellingPrice: 150000, unit: "phần" },
          { name: "Nguyên con", sellingPrice: 280000, unit: "con" },
          { name: "Đùi", sellingPrice: 80000, unit: "phần" },
          { name: "Cánh", sellingPrice: 60000, unit: "phần" },
        ],
      },
    },
  });

  const gaRoti = await prisma.product.create({
    data: {
      name: "Gà Roti",
      description: "Gà nướng roti thơm ngon, vàng đều",
      categoryId: gaCategory.id,
      variants: {
        create: [
          { name: "Nửa con", sellingPrice: 170000, unit: "phần" },
          { name: "Nguyên con", sellingPrice: 320000, unit: "con" },
        ],
      },
    },
  });

  const gaXe = await prisma.product.create({
    data: {
      name: "Gà Xé",
      description: "Gà xé phay trộn hành tây, rau răm",
      categoryId: gaCategory.id,
      variants: {
        create: [
          { name: "Phần nhỏ", sellingPrice: 50000, unit: "phần" },
          { name: "Phần lớn", sellingPrice: 90000, unit: "phần" },
        ],
      },
    },
  });

  // Xôi products
  const xoiGa = await prisma.product.create({
    data: {
      name: "Xôi Gà",
      description: "Xôi nếp dẻo với gà xé sợi",
      categoryId: xoiCategory.id,
      variants: {
        create: [
          { name: "Phần nhỏ", sellingPrice: 35000, unit: "phần" },
          { name: "Phần lớn", sellingPrice: 50000, unit: "phần" },
        ],
      },
    },
  });

  const xoiDauXanh = await prisma.product.create({
    data: {
      name: "Xôi Đậu Xanh",
      description: "Xôi nếp với đậu xanh bở tơi",
      categoryId: xoiCategory.id,
      variants: {
        create: [
          { name: "Phần nhỏ", sellingPrice: 20000, unit: "phần" },
          { name: "Phần lớn", sellingPrice: 30000, unit: "phần" },
        ],
      },
    },
  });

  // Nước uống
  const cocaCola = await prisma.product.create({
    data: {
      name: "Coca Cola",
      description: "Nước ngọt Coca Cola",
      categoryId: nuocCategory.id,
      variants: {
        create: [
          { name: "Lon", sellingPrice: 15000, unit: "lon" },
          { name: "Chai 500ml", sellingPrice: 12000, unit: "chai" },
        ],
      },
    },
  });

  const pepsi = await prisma.product.create({
    data: {
      name: "Pepsi",
      description: "Nước ngọt Pepsi",
      categoryId: nuocCategory.id,
      variants: {
        create: [
          { name: "Lon", sellingPrice: 15000, unit: "lon" },
          { name: "Chai 500ml", sellingPrice: 12000, unit: "chai" },
        ],
      },
    },
  });

  const nuocSuoi = await prisma.product.create({
    data: {
      name: "Nước Suối",
      description: "Nước khoáng tinh khiết",
      categoryId: nuocCategory.id,
      variants: {
        create: [{ name: "Chai 500ml", sellingPrice: 8000, unit: "chai" }],
      },
    },
  });

  // Món ăn kèm
  const duaChuot = await prisma.product.create({
    data: {
      name: "Dưa Chuột Muối",
      description: "Dưa chuột muối chua ngọt",
      categoryId: monKemCategory.id,
      variants: {
        create: [{ name: "Phần nhỏ", sellingPrice: 10000, unit: "phần" }],
      },
    },
  });

  const rauSong = await prisma.product.create({
    data: {
      name: "Rau Sống",
      description: "Đĩa rau sống tươi ngon",
      categoryId: monKemCategory.id,
      variants: {
        create: [{ name: "Đĩa", sellingPrice: 15000, unit: "đĩa" }],
      },
    },
  });

  console.log(`   ✅ Created products with variants`);

  // Get all variants for orders
  const allVariants = await prisma.productVariant.findMany({
    include: { product: true },
  });

  // ============================================
  // CUSTOMERS
  // ============================================
  console.log("👥 Creating customers...");
  const customerNames = [
    "Nguyễn Văn An",
    "Trần Thị Bình",
    "Lê Văn Cường",
    "Phạm Thị Dung",
    "Hoàng Văn Em",
    "Đỗ Thị Phương",
    "Bùi Văn Giang",
    "Vũ Thị Hoa",
    "Ngô Văn Kiên",
    "Đinh Thị Lan",
    "Lý Văn Minh",
    "Cao Thị Ngọc",
    "Đặng Văn Phú",
    "Mai Thị Quỳnh",
    "Tạ Văn Sơn",
  ];

  const customers = await Promise.all(
    customerNames.map((name, index) =>
      prisma.customer.create({
        data: {
          name,
          phone: `090${String(index + 1).padStart(7, "0")}`,
          address: `Số ${randomInt(1, 200)}, Đường ${randomInt(1, 50)}, Quận ${randomInt(1, 12)}, TP.HCM`,
        },
      }),
    ),
  );
  console.log(`   ✅ Created ${customers.length} customers`);

  // ============================================
  // INVENTORY IMPORTS (Nhập nguyên liệu)
  // ============================================
  console.log("📦 Creating inventory imports...");
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  let importCount = 0;
  for (const ingredient of ingredients) {
    // Create 2-5 import records per ingredient
    const numImports = randomInt(2, 5);
    for (let i = 0; i < numImports; i++) {
      const quantity = randomInt(5, 30);
      const unitPrices: Record<string, number> = {
        con: randomInt(80000, 120000),
        kg: randomInt(20000, 80000),
        lít: randomInt(15000, 50000),
        bó: randomInt(5000, 15000),
        chai: randomInt(5000, 15000),
      };
      const importPrice =
        unitPrices[ingredient.unit] || randomInt(10000, 50000);

      await prisma.inventoryImport.create({
        data: {
          ingredientId: ingredient.id,
          quantity,
          importPrice,
          totalPrice: quantity * importPrice,
          importDate: randomDate(thirtyDaysAgo, now),
          createdById: randomItem(users).id,
          note:
            i === 0 ? `Nhập lô hàng đầu tiên - ${ingredient.name}` : undefined,
        },
      });
      importCount++;
    }
  }
  console.log(`   ✅ Created ${importCount} inventory imports`);

  // ============================================
  // ORDERS
  // ============================================
  console.log("📝 Creating orders...");
  const orderStatuses = [
    OrderStatus.DONE,
    OrderStatus.DONE,
    OrderStatus.DONE,
    OrderStatus.CONFIRMED,
    OrderStatus.PENDING,
    OrderStatus.CANCELLED,
  ];

  let orderCount = 0;
  for (let i = 0; i < 50; i++) {
    const customer = randomItem(customers);
    const status = randomItem(orderStatuses);
    const orderDate = randomDate(thirtyDaysAgo, now);
    const deliveryDate = new Date(
      orderDate.getTime() + randomInt(1, 24) * 60 * 60 * 1000,
    );

    // Random 1-5 items per order
    const numItems = randomInt(1, 5);
    const selectedVariants = [];
    for (let j = 0; j < numItems; j++) {
      const variant = randomItem(allVariants);
      if (!selectedVariants.find((v) => v.id === variant.id)) {
        selectedVariants.push(variant);
      }
    }

    let totalAmount = 0;
    let totalCost = 0;
    const orderItems = selectedVariants.map((variant) => {
      const quantity = randomInt(1, 3);
      const unitPrice = Number(variant.sellingPrice);
      const costPrice = Math.round(unitPrice * 0.6); // Assume 40% margin
      const subtotal = unitPrice * quantity;

      totalAmount += subtotal;
      totalCost += costPrice * quantity;

      return {
        productVariantId: variant.id,
        quantity,
        unitPrice,
        costPrice,
        subtotal,
      };
    });

    const discount = Math.random() < 0.2 ? randomInt(5000, 20000) : 0;
    totalAmount -= discount;
    const totalProfit = totalAmount - totalCost;

    const order = await prisma.order.create({
      data: {
        customerName: customer.name,
        phone: customer.phone,
        address: customer.address,
        deliveryTime: deliveryDate,
        status,
        totalAmount,
        totalCost,
        totalProfit,
        discount,
        createdById: randomItem(users).id,
        customerId: customer.id,
        createdAt: orderDate,
        items: {
          create: orderItems,
        },
      },
    });

    orderCount++;
  }
  console.log(`   ✅ Created ${orderCount} orders`);
}

main()
  .then(async () => {
    console.log("\n🎉 Seeding completed successfully!");
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error("❌ Seeding failed:", e);
    await prisma.$disconnect();
    process.exit(1);
  });
