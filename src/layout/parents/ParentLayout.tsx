import { Outlet } from "react-router-dom";
import ParentSidebar from "./ParentSidebar";

export default function ParentLayout() {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <ParentSidebar />
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}