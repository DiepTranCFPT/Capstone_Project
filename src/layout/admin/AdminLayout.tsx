import { Outlet } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";


export default function AdminLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <AdminSidebar />
      <main className="flex-1 p-8 ml-0 md:ml-4">
        <Outlet />
      </main>
    </div>
  );
}
