import { Outlet } from "react-router-dom";
import TeacherSidebar from "./TeacherSidebar.tsx";

export default function TeacherLayout() {
    return (
        <div className="flex min-h-screen bg-gray-100">
            <TeacherSidebar />
            <main className="flex-1 p-8">
                <Outlet />
            </main>
        </div>
    );
}

