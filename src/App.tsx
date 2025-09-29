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

// --- Teacher Imports ---
import TeacherLayout from "./layout/teachers/TeacherLayout";
import TeacherDashboardPage from "./pages/teachers/TeacherDashboardPage";
import ProtectedRoute from "./context/ProtectedRoute";
import MyClassesPage from "./pages/teachers/MyClassPage";
import ClassroomDetailPage from "./pages/teachers/ClassroomDetailPage";
import QuestionBankPage from "./pages/teachers/QuestionBankPage";
import CreateExamPage from "./pages/teachers/CreateExamPage";

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
          <Route path="/materials" element={<MaterialsPage />} />
          <Route path="/materials/:id" element={<MaterialsDetailPage />} />
          <Route path="/community" element={<CommunityPage />} />
          <Route path="/community/groups/:groupId" element={<GroupDetailPage />} />
        </Route>

        {/* Student routes with StudentLayout */}
        <Route path="/student" element={<ProtectedRoute roles={['student']}><StudentLayout /></ProtectedRoute>}>
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

        {/* Teacher routes with TeacherLayout */}
        <Route path="/teacher" element={<TeacherLayout />} >
          <Route path="dashboard" element={<ProtectedRoute roles={['teacher']}><TeacherDashboardPage /></ProtectedRoute>} />
          {/* Các routes khác của Teacher sẽ được thêm vào đây */}
          <Route path="classes" element={<MyClassesPage />} />
          <Route path="classes/:classId" element={<ClassroomDetailPage />} />
          <Route path="question-bank" element={<QuestionBankPage />} />
          <Route path="create-exam" element={<CreateExamPage />} />
            {/* <Route path="content" element={<ManageContentPage />} /> */}
            {/* <Route path="grading" element={<GradingPage />} />
            <Route path="analytics" element={<AnalyticsPage />} /> */}

        </Route>

      </Routes>
    </Router>
  );
}

export default App;
