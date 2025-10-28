import { Outlet } from "react-router-dom";
import TeacherSidebar from "./TeacherSidebar.tsx";
import { QuestionBankProvider } from "~/context/QuestionBankProvider";

export default function TeacherLayout() {
    return (
        <QuestionBankProvider>
            <div className="flex min-h-screen bg-gray-100">
                <TeacherSidebar />
                <main className="flex-1 p-8">
                    <Outlet />
                </main>
            </div>
        </QuestionBankProvider>
    );
}
