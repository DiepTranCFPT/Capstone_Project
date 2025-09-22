import { Outlet } from "react-router-dom";
import StudentSidebar from "./StudentSidebar";


export default function StudentLayout() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <StudentSidebar />
      <main className="flex-1 p-8 ml-0 md:ml-4">
        <Outlet />
      </main>
    </div>
  );
}
