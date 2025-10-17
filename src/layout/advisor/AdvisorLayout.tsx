import { Outlet } from "react-router-dom";
import AdvisorSidebar from "../advisor/AdvisorSidebar";

export default function AdvisorLayout() {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdvisorSidebar />
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}

