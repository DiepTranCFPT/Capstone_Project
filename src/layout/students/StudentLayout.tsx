import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import StudentSidebar, { MobileMenuButton } from "./StudentSidebar";

export default function StudentLayout() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile screen
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile Menu Button - chỉ hiển thị khi là mobile */}
      {isMobile && (
        <MobileMenuButton onClick={() => setMobileMenuOpen(true)} />
      )}

      {/* Sidebar */}
      <StudentSidebar
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Main Content */}
      <main className={`flex-1 md:p-8 ${isMobile ? 'pt-16' : 'pt-8'}`}>
        <Outlet />
      </main>
    </div>
  );
}


