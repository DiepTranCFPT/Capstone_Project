import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import Footer from "./layout/Footer";
import Navbar from "./layout/Navbar";
import HomePages from "./pages/home/HomePages";
// import LoginPage from "./pages/auth/LoginPage";
// import RegisterPage from "./pages/auth/RegisterPage";
import AuthPage from "./pages/auth/AuthPage";
import ForgotPasswordPage from "./pages/auth/ForgotPassword";

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
        {/* Auth routes */}
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        <Route element={<Layout />}>
          <Route path="/" element={<HomePages />} />         
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
