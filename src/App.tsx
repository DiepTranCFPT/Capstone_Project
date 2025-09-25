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
import AITutorPage from "./pages/students/AITutorPage";
import FindTutorPage from "./pages/students/FindTutorPage";
import TutorDetailPage from "./pages/students/TutorDetailPage";
import MyBookingsPage from "./pages/students/MyBookingsPage";
import QuizBattlePage from "./pages/students/QuizBattlePage";

import TestReportsPage from "./pages/students/TestReportsPage";
import TestReportDetailPage from "./pages/students/TestReportDetailPage";
import GroupDetailPage from "./pages/community/GroupDetailPage";

import ProfileDashboard from "./components/students/profile/ProfileDashboard";
import AdminLayout from "./layout/admin/AdminLayout";
import ParentManagerPage from "./pages/admins/ParentManagerPage";
import CourseManagerPage from "./pages/admins/CourseManagerPage";
import StudentMangerPage from "./pages/admins/StudentMangerPage";
import MockTestManagerPage from "./pages/admins/MockTestManagerPage";



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

        {/*Admin routes with AdminLayout */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="parents" element={<ParentManagerPage />} />
          <Route path="courses" element={<CourseManagerPage />} />
          <Route path="students" element={<StudentMangerPage />} />
          <Route path="mock-tests" element={<MockTestManagerPage />} />
        </Route>

        {/* Main routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/" element={<HomePages />} />         
          <Route path="/exam-test" element={<ExamTestPage />} />    
          <Route path="/exam-test/:examId" element={<ExamDetailsPage />} />
          <Route path="/test-result/:submissionId" element={<TestResultPage />} /> 
          <Route path="/materials" element={<MaterialsPage/>} />  
          <Route path="/materials/:id" element={<MaterialsDetailPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/groups/:groupId" element={<GroupDetailPage />} />
        </Route>

        {/* Student routes with StudentLayout */}
        <Route path="/student" element={<StudentLayout />}>
          <Route path="dashboard" element={<StudentDashboardPage />} />

          <Route path="test-reports" element={<TestReportsPage />} />
          <Route path="test-reports/:reportId" element={<TestReportDetailPage />} />

          <Route path="profile" element={<ProfileDashboard />} />
          <Route path="ai-tutor" element={<AITutorPage />} />
          <Route path="find-tutor" element={<FindTutorPage />} />
          <Route path="tutor/:tutorId" element={<TutorDetailPage />} />
          <Route path="my-bookings" element={<MyBookingsPage />} />
          <Route path="quiz-battle" element={<QuizBattlePage />} />
        </Route>

      </Routes>
    </Router>
  );
}

export default App;
