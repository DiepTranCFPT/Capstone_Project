import { BrowserRouter as Router, Route, Routes, Outlet } from "react-router-dom";
import Footer from "./layout/Footer";
import Navbar from "./layout/Navbar";
import HomePages from "./pages/home/HomePages";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

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
        <Route element={<Layout />}>
          <Route path="/" element={<HomePages />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
