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
  const categories = await Promise.all([
    prisma.category.create({ data: { name: "Gà" } }),
    prisma.category.create({ data: { name: "Xôi" } }),
    prisma.category.create({ data: { name: "Món ăn kèm" } }),
    prisma.category.create({ data: { name: "Đồ uống" } }),
  ]);
  console.log(`   ✅ Created ${categories.length} categories`);

  const [catGa, catXoi, catAnKem, catDoUong] = categories;

  // ============================================
  // PRODUCTS & VARIANTS
  // ============================================
  console.log("🍗 Creating products and variants...");

  // Gà products
  const gaLuoc = await prisma.product.create({
    data: {
      name: "Gà luộc",
      description: "Gà ta luộc nguyên con, da vàng óng, thịt ngọt mềm",
      categoryId: catGa.id,
      variants: {
        create: [
          {
            name: "Nửa con",
            costPrice: 85000,
            sellingPrice: 120000,
            stockQuantity: 20,
            unit: "phần",
          },
          {
            name: "Nguyên con",
            costPrice: 160000,
            sellingPrice: 230000,
            stockQuantity: 15,
            unit: "con",
          },
          {
            name: "Đùi",
            costPrice: 45000,
            sellingPrice: 65000,
            stockQuantity: 30,
            unit: "phần",
          },
          {
            name: "Cánh",
            costPrice: 25000,
            sellingPrice: 40000,
            stockQuantity: 40,
            unit: "phần",
          },
        ],
      },
    },
    include: { variants: true },
  });

  const gaRoti = await prisma.product.create({
    data: {
      name: "Gà rô ti",
      description: "Gà nướng rô ti giòn rụm, thơm lừng",
      categoryId: catGa.id,
      variants: {
        create: [
          {
            name: "Nửa con",
            costPrice: 90000,
            sellingPrice: 130000,
            stockQuantity: 15,
            unit: "phần",
          },
          {
            name: "Nguyên con",
            costPrice: 170000,
            sellingPrice: 250000,
            stockQuantity: 10,
            unit: "con",
          },
        ],
      },
    },
    include: { variants: true },
  });

  const gaXe = await prisma.product.create({
    data: {
      name: "Gà xé",
      description: "Gà xé phay trộn rau răm, hành phi",
      categoryId: catGa.id,
      variants: {
        create: [
          {
            name: "Nhỏ",
            costPrice: 30000,
            sellingPrice: 45000,
            stockQuantity: 25,
            unit: "phần",
          },
          {
            name: "Lớn",
            costPrice: 55000,
            sellingPrice: 80000,
            stockQuantity: 20,
            unit: "phần",
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Xôi products
  const xoiGa = await prisma.product.create({
    data: {
      name: "Xôi gà",
      description: "Xôi nếp dẻo thơm ăn kèm gà luộc",
      categoryId: catXoi.id,
      variants: {
        create: [
          {
            name: "Nhỏ",
            costPrice: 12000,
            sellingPrice: 20000,
            stockQuantity: 50,
            unit: "phần",
          },
          {
            name: "Lớn",
            costPrice: 20000,
            sellingPrice: 35000,
            stockQuantity: 40,
            unit: "phần",
          },
        ],
      },
    },
    include: { variants: true },
  });

  const xoiDau = await prisma.product.create({
    data: {
      name: "Xôi đậu xanh",
      description: "Xôi đậu xanh bùi bùi, béo ngậy",
      categoryId: catXoi.id,
      variants: {
        create: [
          {
            name: "Nhỏ",
            costPrice: 10000,
            sellingPrice: 18000,
            stockQuantity: 45,
            unit: "phần",
          },
          {
            name: "Lớn",
            costPrice: 18000,
            sellingPrice: 30000,
            stockQuantity: 35,
            unit: "phần",
          },
        ],
      },
    },
    include: { variants: true },
  });

  const xoiLac = await prisma.product.create({
    data: {
      name: "Xôi lạc",
      description: "Xôi lạc rang muối bùi thơm",
      categoryId: catXoi.id,
      variants: {
        create: [
          {
            name: "Nhỏ",
            costPrice: 8000,
            sellingPrice: 15000,
            stockQuantity: 50,
            unit: "phần",
          },
          {
            name: "Lớn",
            costPrice: 15000,
            sellingPrice: 25000,
            stockQuantity: 40,
            unit: "phần",
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Món ăn kèm
  const nuocMam = await prisma.product.create({
    data: {
      name: "Nước mắm gừng",
      description: "Nước mắm pha gừng chua ngọt",
      categoryId: catAnKem.id,
      variants: {
        create: [
          {
            name: "Chén nhỏ",
            costPrice: 3000,
            sellingPrice: 5000,
            stockQuantity: 100,
            unit: "chén",
          },
          {
            name: "Chén lớn",
            costPrice: 5000,
            sellingPrice: 10000,
            stockQuantity: 80,
            unit: "chén",
          },
        ],
      },
    },
    include: { variants: true },
  });

  const rauSong = await prisma.product.create({
    data: {
      name: "Rau sống",
      description: "Đĩa rau sống tươi ngon",
      categoryId: catAnKem.id,
      variants: {
        create: [
          {
            name: "Đĩa nhỏ",
            costPrice: 8000,
            sellingPrice: 15000,
            stockQuantity: 60,
            unit: "đĩa",
          },
          {
            name: "Đĩa lớn",
            costPrice: 15000,
            sellingPrice: 25000,
            stockQuantity: 40,
            unit: "đĩa",
          },
        ],
      },
    },
    include: { variants: true },
  });

  const chaoLong = await prisma.product.create({
    data: {
      name: "Cháo lòng gà",
      description: "Cháo lòng gà nóng hổi, thơm ngon",
      categoryId: catAnKem.id,
      variants: {
        create: [
          {
            name: "Bát nhỏ",
            costPrice: 15000,
            sellingPrice: 25000,
            stockQuantity: 30,
            unit: "bát",
          },
          {
            name: "Bát lớn",
            costPrice: 25000,
            sellingPrice: 40000,
            stockQuantity: 25,
            unit: "bát",
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Đồ uống
  const traDa = await prisma.product.create({
    data: {
      name: "Trà đá",
      description: "Trà đá mát lạnh",
      categoryId: catDoUong.id,
      variants: {
        create: [
          {
            name: "Ly",
            costPrice: 2000,
            sellingPrice: 5000,
            stockQuantity: 200,
            unit: "ly",
          },
          {
            name: "Bình",
            costPrice: 8000,
            sellingPrice: 15000,
            stockQuantity: 50,
            unit: "bình",
          },
        ],
      },
    },
    include: { variants: true },
  });

  const nuocNgot = await prisma.product.create({
    data: {
      name: "Nước ngọt",
      description: "Coca, Pepsi, 7Up",
      categoryId: catDoUong.id,
      variants: {
        create: [
          {
            name: "Lon",
            costPrice: 8000,
            sellingPrice: 15000,
            stockQuantity: 100,
            unit: "lon",
          },
          {
            name: "Chai",
            costPrice: 10000,
            sellingPrice: 18000,
            stockQuantity: 60,
            unit: "chai",
          },
        ],
      },
    },
    include: { variants: true },
  });

  const bia = await prisma.product.create({
    data: {
      name: "Bia",
      description: "Bia Hà Nội, Tiger, Heineken",
      categoryId: catDoUong.id,
      variants: {
        create: [
          {
            name: "Hà Nội",
            costPrice: 12000,
            sellingPrice: 20000,
            stockQuantity: 100,
            unit: "lon",
          },
          {
            name: "Tiger",
            costPrice: 15000,
            sellingPrice: 25000,
            stockQuantity: 80,
            unit: "lon",
          },
          {
            name: "Heineken",
            costPrice: 18000,
            sellingPrice: 30000,
            stockQuantity: 60,
            unit: "lon",
          },
        ],
      },
    },
    include: { variants: true },
  });

  // Collect all variants for order creation
  const allProducts = [
    gaLuoc,
    gaRoti,
    gaXe,
    xoiGa,
    xoiDau,
    xoiLac,
    nuocMam,
    rauSong,
    chaoLong,
    traDa,
    nuocNgot,
    bia,
  ];
  const allVariants = allProducts.flatMap((p) => p.variants);
  console.log(
    `   ✅ Created ${allProducts.length} products with ${allVariants.length} variants`,
  );

  // ============================================
  // CUSTOMERS
  // ============================================
  console.log("👥 Creating customers...");
  const customerData = [
    {
      name: "Nguyễn Văn An",
      phone: "0901234567",
      address: "123 Láng Hạ, Đống Đa, Hà Nội",
    },
    {
      name: "Trần Thị Bình",
      phone: "0912345678",
      address: "45 Giảng Võ, Ba Đình, Hà Nội",
    },
    {
      name: "Lê Hoàng Cường",
      phone: "0923456789",
      address: "78 Nguyễn Chí Thanh, Đống Đa, Hà Nội",
    },
    {
      name: "Phạm Thị Duyên",
      phone: "0934567890",
      address: "90 Tây Sơn, Đống Đa, Hà Nội",
    },
    {
      name: "Hoàng Văn Em",
      phone: "0945678901",
      address: "234 Xã Đàn, Đống Đa, Hà Nội",
    },
    {
      name: "Ngô Thị Phương",
      phone: "0956789012",
      address: "567 Trường Chinh, Thanh Xuân, Hà Nội",
    },
    {
      name: "Đặng Minh Giang",
      phone: "0967890123",
      address: "12 Khâm Thiên, Đống Đa, Hà Nội",
    },
    {
      name: "Vũ Thị Hương",
      phone: "0978901234",
      address: "89 Thái Hà, Đống Đa, Hà Nội",
    },
    {
      name: "Bùi Văn Khang",
      phone: "0989012345",
      address: "156 Nguyễn Lương Bằng, Đống Đa, Hà Nội",
    },
    {
      name: "Lý Thị Lan",
      phone: "0990123456",
      address: "23 Huỳnh Thúc Kháng, Đống Đa, Hà Nội",
    },
    {
      name: "Cao Văn Mạnh",
      phone: "0911223344",
      address: "45 Chùa Bộc, Đống Đa, Hà Nội",
    },
    {
      name: "Đinh Thị Nga",
      phone: "0922334455",
      address: "67 Phạm Ngọc Thạch, Đống Đa, Hà Nội",
    },
    {
      name: "Tô Văn Phú",
      phone: "0933445566",
      address: "89 Đặng Văn Ngữ, Đống Đa, Hà Nội",
    },
    {
      name: "Mai Thị Quỳnh",
      phone: "0944556677",
      address: "101 Tôn Thất Tùng, Đống Đa, Hà Nội",
    },
    {
      name: "Dương Văn Sơn",
      phone: "0955667788",
      address: "202 Cầu Giấy, Cầu Giấy, Hà Nội",
    },
  ];

  const customers = await Promise.all(
    customerData.map((c) => prisma.customer.create({ data: c })),
  );
  console.log(`   ✅ Created ${customers.length} customers`);

  // ============================================
  // ORDERS
  // ============================================
  console.log("📦 Creating orders...");

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  // Generate 50 orders
  const orderPromises = [];
  for (let i = 0; i < 50; i++) {
    const customer = randomItem(customers);
    const user = randomItem(users);
    const orderDate = randomDate(thirtyDaysAgo, now);
    const deliveryTime = new Date(
      orderDate.getTime() + randomInt(1, 4) * 60 * 60 * 1000,
    );

    // Determine order status based on delivery time
    let status: OrderStatus;
    if (deliveryTime < now) {
      // Past delivery - mostly DONE, some CANCELLED
      status = Math.random() > 0.1 ? OrderStatus.DONE : OrderStatus.CANCELLED;
    } else {
      // Future delivery - PENDING or CONFIRMED
      status =
        Math.random() > 0.4 ? OrderStatus.CONFIRMED : OrderStatus.PENDING;
    }

    // Generate 1-5 items per order
    const numItems = randomInt(1, 5);
    const selectedVariants: typeof allVariants = [];
    for (let j = 0; j < numItems; j++) {
      const variant = randomItem(allVariants);
      if (!selectedVariants.find((v) => v.id === variant.id)) {
        selectedVariants.push(variant);
      }
    }

    const items = selectedVariants.map((variant) => ({
      quantity: randomInt(1, 3),
      unitPrice: variant.sellingPrice,
      costPrice: variant.costPrice,
      subtotal: Number(variant.sellingPrice) * randomInt(1, 3),
      productVariantId: variant.id,
    }));

    // Calculate totals
    const totalAmount = items.reduce((sum, item) => sum + item.subtotal, 0);
    const totalCost = items.reduce(
      (sum, item) => sum + Number(item.costPrice) * item.quantity,
      0,
    );
    const discount = Math.random() > 0.8 ? randomInt(1, 5) * 10000 : 0;
    const totalProfit = totalAmount - totalCost - discount;

    // Fix item subtotals with actual quantities
    const fixedItems = items.map((item) => ({
      ...item,
      subtotal: Number(item.unitPrice) * item.quantity,
    }));

    const fixedTotalAmount = fixedItems.reduce(
      (sum, item) => sum + item.subtotal,
      0,
    );
    const fixedTotalCost = fixedItems.reduce(
      (sum, item) => sum + Number(item.costPrice) * item.quantity,
      0,
    );
    const fixedTotalProfit = fixedTotalAmount - fixedTotalCost - discount;

    orderPromises.push(
      prisma.order.create({
        data: {
          customerName: customer.name,
          phone: customer.phone,
          address: customer.address || "Tự đến lấy",
          deliveryTime,
          status,
          totalAmount: fixedTotalAmount,
          totalCost: fixedTotalCost,
          totalProfit: fixedTotalProfit,
          discount,
          note:
            Math.random() > 0.7
              ? randomItem([
                  "Giao trước 12h",
                  "Gọi trước khi giao",
                  "Để ở bảo vệ",
                  "Không cần đũa",
                  "Thêm ớt",
                  "Ít nước mắm",
                ])
              : null,
          createdById: user.id,
          customerId: customer.id,
          createdAt: orderDate,
          items: {
            create: fixedItems,
          },
        },
      }),
    );
  }

  const orders = await Promise.all(orderPromises);
  console.log(`   ✅ Created ${orders.length} orders`);

  // ============================================
  // INVENTORY IMPORTS
  // ============================================
  console.log("📥 Creating inventory imports...");

  const importPromises = [];
  for (const variant of allVariants) {
    // Create 2-4 imports per variant in last 30 days
    const numImports = randomInt(2, 4);
    for (let i = 0; i < numImports; i++) {
      const importDate = randomDate(thirtyDaysAgo, now);
      importPromises.push(
        prisma.inventoryImport.create({
          data: {
            quantity: randomInt(10, 50),
            importPrice: variant.costPrice,
            importDate,
            productVariantId: variant.id,
            createdById: randomItem(users).id,
          },
        }),
      );
    }
  }

  const imports = await Promise.all(importPromises);
  console.log(`   ✅ Created ${imports.length} inventory imports`);

  // ============================================
  // SUMMARY
  // ============================================
  console.log("\n✨ Seeding completed!");
  console.log("─".repeat(40));
  console.log(`   Users: ${users.length}`);
  console.log(`   Categories: ${categories.length}`);
  console.log(`   Products: ${allProducts.length}`);
  console.log(`   Product Variants: ${allVariants.length}`);
  console.log(`   Customers: ${customers.length}`);
  console.log(`   Orders: ${orders.length}`);
  console.log(`   Inventory Imports: ${imports.length}`);
  console.log("─".repeat(40));
  console.log("\n📝 Login credentials:");
  console.log("   Admin: admin@hongvan.com / admin123");
  console.log("   Staff: mai@hongvan.com / staff123");
  console.log("   Staff: hung@hongvan.com / staff123");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
