import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <h1 className="text-4xl font-bold text-gray-800">
        Welcome to Inventory Management System
      </h1>
      <Link
        href="/admin"
        className="mt-4 inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        Đến trang quản trị
      </Link>
    </div>
  );
}
