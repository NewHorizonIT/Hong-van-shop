import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";

class ExportService {
  async exportOrders(from: Date, to: Date): Promise<Buffer> {
    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: from, lte: to },
      },
      include: {
        customer: true,
        createdBy: {
          select: { id: true, name: true },
        },
        items: {
          include: {
            productVariant: {
              include: { product: true },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const workbook = XLSX.utils.book_new();

    // Orders Summary Sheet
    const ordersData = orders.map((order) => ({
      "Mã đơn": order.id.slice(0, 8),
      "Khách hàng": order.customer?.name || order.customerName,
      SĐT: order.customer?.phone || order.phone,
      "Địa chỉ": order.address,
      "Tổng tiền": order.totalAmount.toNumber(),
      "Giảm giá": order.discount.toNumber(),
      "Lợi nhuận": order.totalProfit.toNumber(),
      "Trạng thái": this.translateStatus(order.status),
      "Giờ giao": order.deliveryTime
        ? new Date(order.deliveryTime).toLocaleString("vi-VN")
        : "-",
      "Ghi chú": order.note || "",
      "Ngày tạo": new Date(order.createdAt).toLocaleString("vi-VN"),
      "Người tạo": order.createdBy?.name || "",
    }));

    const ordersSheet = XLSX.utils.json_to_sheet(ordersData);
    ordersSheet["!cols"] = [
      { wch: 12 },
      { wch: 20 },
      { wch: 12 },
      { wch: 30 },
      { wch: 12 },
      { wch: 10 },
      { wch: 12 },
      { wch: 12 },
      { wch: 18 },
      { wch: 25 },
      { wch: 18 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, ordersSheet, "Đơn hàng");

    // Order Items Detail Sheet
    const itemsData: Record<string, string | number>[] = [];
    orders.forEach((order) => {
      order.items.forEach((item) => {
        itemsData.push({
          "Mã đơn": order.id.slice(0, 8),
          "Sản phẩm": item.productVariant.product.name,
          "Biến thể": item.productVariant.name,
          "Đơn vị": item.productVariant.unit,
          "Số lượng": item.quantity,
          "Đơn giá": item.unitPrice.toNumber(),
          "Thành tiền": item.subtotal.toNumber(),
        });
      });
    });

    if (itemsData.length > 0) {
      const itemsSheet = XLSX.utils.json_to_sheet(itemsData);
      itemsSheet["!cols"] = [
        { wch: 12 },
        { wch: 25 },
        { wch: 15 },
        { wch: 10 },
        { wch: 10 },
        { wch: 12 },
        { wch: 15 },
      ];
      XLSX.utils.book_append_sheet(workbook, itemsSheet, "Chi tiết đơn");
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  }

  async exportRevenue(from: Date, to: Date): Promise<Buffer> {
    const orders = await prisma.order.findMany({
      where: {
        status: { in: ["CONFIRMED", "DONE"] },
        createdAt: { gte: from, lte: to },
      },
      select: {
        id: true,
        totalAmount: true,
        totalCost: true,
        totalProfit: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    // Daily aggregation
    const dailyMap = new Map<
      string,
      { revenue: number; cost: number; profit: number; orders: number }
    >();
    orders.forEach((order) => {
      const dateKey = order.createdAt.toISOString().split("T")[0];
      const existing = dailyMap.get(dateKey) || {
        revenue: 0,
        cost: 0,
        profit: 0,
        orders: 0,
      };
      existing.revenue += order.totalAmount.toNumber();
      existing.cost += order.totalCost.toNumber();
      existing.profit += order.totalProfit.toNumber();
      existing.orders++;
      dailyMap.set(dateKey, existing);
    });

    const workbook = XLSX.utils.book_new();

    // Summary Sheet
    const totalRevenue = orders.reduce(
      (sum, o) => sum + o.totalAmount.toNumber(),
      0,
    );
    const totalCost = orders.reduce(
      (sum, o) => sum + o.totalCost.toNumber(),
      0,
    );
    const totalProfit = orders.reduce(
      (sum, o) => sum + o.totalProfit.toNumber(),
      0,
    );

    const summaryData = [
      ["BÁO CÁO DOANH THU - LỢI NHUẬN"],
      [""],
      ["Từ ngày", from.toLocaleDateString("vi-VN")],
      ["Đến ngày", to.toLocaleDateString("vi-VN")],
      [""],
      ["Tổng doanh thu", totalRevenue],
      ["Tổng chi phí", totalCost],
      ["Tổng lợi nhuận", totalProfit],
      ["Số đơn hàng", orders.length],
      ["Giá trị TB/đơn", orders.length > 0 ? totalRevenue / orders.length : 0],
    ];

    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 20 }, { wch: 25 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Tổng quan");

    // Daily Breakdown Sheet
    const dailyData = Array.from(dailyMap.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([date, data]) => ({
        Ngày: date,
        "Doanh thu": data.revenue,
        "Chi phí": data.cost,
        "Lợi nhuận": data.profit,
        "Số đơn": data.orders,
      }));

    if (dailyData.length > 0) {
      const dailySheet = XLSX.utils.json_to_sheet(dailyData);
      dailySheet["!cols"] = [
        { wch: 12 },
        { wch: 15 },
        { wch: 15 },
        { wch: 15 },
        { wch: 10 },
      ];
      XLSX.utils.book_append_sheet(workbook, dailySheet, "Theo ngày");
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  }

  async exportCustomers(from?: Date, to?: Date): Promise<Buffer> {
    const whereClause = from && to ? { createdAt: { gte: from, lte: to } } : {};

    const customers = await prisma.customer.findMany({
      where: whereClause,
      include: {
        _count: {
          select: { orders: true },
        },
        orders: {
          select: {
            totalAmount: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const workbook = XLSX.utils.book_new();

    const customersData = customers.map((c) => {
      const totalSpent = c.orders.reduce(
        (sum, o) => sum + o.totalAmount.toNumber(),
        0,
      );
      return {
        Tên: c.name,
        SĐT: c.phone,
        "Địa chỉ": c.address || "",
        "Ghi chú": c.note || "",
        "Số đơn": c._count.orders,
        "Tổng chi tiêu": totalSpent,
        "Ngày tạo": new Date(c.createdAt).toLocaleDateString("vi-VN"),
      };
    });

    const sheet = XLSX.utils.json_to_sheet(customersData);
    sheet["!cols"] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 30 },
      { wch: 25 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, sheet, "Khách hàng");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  }

  async exportProducts(): Promise<Buffer> {
    const products = await prisma.product.findMany({
      include: {
        category: true,
        variants: true,
      },
      orderBy: { name: "asc" },
    });

    const workbook = XLSX.utils.book_new();

    // Products Sheet
    const productsData = products.map((p) => ({
      Tên: p.name,
      "Danh mục": p.category.name,
      "Mô tả": p.description || "",
      "Số biến thể": p.variants.length,
      "Trạng thái": p.isActive ? "Hoạt động" : "Ẩn",
    }));

    const productsSheet = XLSX.utils.json_to_sheet(productsData);
    productsSheet["!cols"] = [
      { wch: 25 },
      { wch: 15 },
      { wch: 40 },
      { wch: 12 },
      { wch: 12 },
    ];
    XLSX.utils.book_append_sheet(workbook, productsSheet, "Sản phẩm");

    // Variants Sheet
    const variantsData: Record<string, string | number>[] = [];
    products.forEach((p) => {
      p.variants.forEach((v) => {
        variantsData.push({
          "Sản phẩm": p.name,
          "Biến thể": v.name,
          "Đơn vị": v.unit,
          "Giá bán": v.sellingPrice.toNumber(),
          "Trạng thái": v.isActive ? "Hoạt động" : "Ẩn",
        });
      });
    });

    if (variantsData.length > 0) {
      const variantsSheet = XLSX.utils.json_to_sheet(variantsData);
      variantsSheet["!cols"] = [
        { wch: 25 },
        { wch: 15 },
        { wch: 10 },
        { wch: 12 },
        { wch: 12 },
      ];
      XLSX.utils.book_append_sheet(workbook, variantsSheet, "Biến thể");
    }

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  }

  async exportInventoryImports(from: Date, to: Date): Promise<Buffer> {
    const imports = await prisma.inventoryImport.findMany({
      where: {
        importDate: { gte: from, lte: to },
      },
      include: {
        ingredient: true,
        createdBy: {
          select: { name: true },
        },
      },
      orderBy: { importDate: "desc" },
    });

    const workbook = XLSX.utils.book_new();

    const importsData = imports.map((imp) => ({
      "Nguyên liệu": imp.ingredient.name,
      "Đơn vị": imp.ingredient.unit,
      "Số lượng": Number(imp.quantity),
      "Giá nhập": imp.importPrice.toNumber(),
      "Thành tiền": Number(imp.totalPrice),
      "Ngày nhập": new Date(imp.importDate).toLocaleDateString("vi-VN"),
      "Người nhập": imp.createdBy?.name || "",
    }));

    const sheet = XLSX.utils.json_to_sheet(importsData);
    sheet["!cols"] = [
      { wch: 20 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 },
    ];
    XLSX.utils.book_append_sheet(workbook, sheet, "Nhập hàng");

    // Summary
    const totalCost = imports.reduce(
      (sum, imp) => sum + Number(imp.totalPrice),
      0,
    );
    const summaryData = [
      ["TỔNG KẾT NHẬP HÀNG"],
      [""],
      ["Từ ngày", from.toLocaleDateString("vi-VN")],
      ["Đến ngày", to.toLocaleDateString("vi-VN")],
      [""],
      ["Tổng chi phí nhập", totalCost],
      ["Số lần nhập", imports.length],
    ];
    const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
    summarySheet["!cols"] = [{ wch: 20 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(workbook, summarySheet, "Tổng kết");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });
    return buffer;
  }

  private translateStatus(status: string): string {
    const statusMap: Record<string, string> = {
      PENDING: "Chờ xử lý",
      CONFIRMED: "Đã xác nhận",
      DONE: "Hoàn thành",
      CANCELLED: "Đã huỷ",
    };
    return statusMap[status] || status;
  }
}

export const exportService = new ExportService();
