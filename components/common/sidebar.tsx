import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  ChartBar,
  ChevronDown,
  Database,
  FolderTree,
  Gauge,
  icons,
  Leaf,
  ListOrdered,
  MonitorCog,
  Package,
  User,
} from "lucide-react";
import Link from "next/link";

export function SidebarLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <SidebarMenuItem>
      <Link href={href}>{children}</Link>
    </SidebarMenuItem>
  );
}

export function AppSidebar() {
  const links = [
    { href: "/admin", label: "Dashboard", icons: <Gauge /> },
    { href: "/admin/orders", label: "Đơn hàng", icons: <ListOrdered /> },
    { href: "/admin/categories", label: "Danh mục", icons: <FolderTree /> },
    { href: "/admin/products", label: "Sản phẩm", icons: <Database /> },
    { href: "/admin/ingredients", label: "Nguyên liệu", icons: <Leaf /> },
    { href: "/admin/inventory", label: "Nhập hàng", icons: <Package /> },
    { href: "/admin/customers", label: "Khách hàng", icons: <User /> },
    { href: "/admin/analytics", label: "Báo cáo", icons: <ChartBar /> },
    { href: "/admin/system", label: "Hệ thống", icons: <MonitorCog /> },
  ];
  return (
    <Sidebar>
      <SidebarHeader>
        {/* Logo and navigation */}
        <Link href="/admin" className="flex items-center space-x-2 px-4 py-3">
          {/* Replace with your logo */}
          <Database />
          <span className="text-lg font-semibold">Admin Panel</span>
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarLink key={link.href} href={link.href}>
              <div className="flex items-center space-x-4 hover:bg-gray-100 rounded-md px-3 py-2">
                {link.icons}
                <span>{link.label}</span>
              </div>
            </SidebarLink>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
