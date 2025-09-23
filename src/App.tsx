import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import Footer from "./layout/Footer";
import Navbar from "./layout/Navbar";
import HomePages from "./pages/home/HomePages";
// import LoginPage from "./pages/auth/LoginPage";
// import RegisterPage from "./pages/auth/RegisterPage";
import AuthPage from "./pages/auth/AuthPage";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";

import ExamTestPage from "./pages/exam/ExamTestPage";
import ExamDetailsPage from "./pages/exam/ExamDetailsPage";
import TestResultPage from "./pages/exam/TestResultPage";
import DoTestPage from "./pages/exam/DoTestPage";

import MaterialsPage from "./pages/generics/materials/MaterialsPage";
import MaterialsDetailPage from "./pages/generics/materials/MaterialsDetailPage";
import CommunityPage from "./pages/community/CommunityPage";
import StudentDashboardPage from "./pages/students/StudentDashboardPage";
import StudentLayout from "./layout/students/StudentLayout";
import ProfileDashboard from "./components/students/profile/ProfileDashboard";


// Layout Wrapper for common UI elements
const Layout = () => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main>
      <Outlet />
    </main>
    <Footer />
  </div>
);

function App() {
  return (
    <Router>
      <Routes>
        {/* Routes không có Layout (Navbar/Footer) */}
        <Route path="/do-test/:examId/:testType" element={<DoTestPage />} />
        {/* Auth routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />


        <Route element={<Layout />}>
          <Route path="/" element={<HomePages />} />         
          <Route path="/exam-test" element={<ExamTestPage />} />    
          <Route path="/exam-test/:examId" element={<ExamDetailsPage />} />
          <Route path="/test-result/:submissionId" element={<TestResultPage />} /> 
          <Route path="/materials" element={<MaterialsPage/>} />  
          <Route path="/materials/:id" element={<MaterialsDetailPage />} />
          <Route path="/community" element={<CommunityPage />} />
        </Route>

        {/* Student routes with StudentLayout */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboardPage />} />
          <Route path="profile" element={<ProfileDashboard />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
