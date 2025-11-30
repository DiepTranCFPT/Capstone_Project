import React, { useEffect, useRef } from "react";
import { Typography } from "antd";
import { useLocation } from "react-router-dom";
import { useRegisteredMaterials } from "~/hooks/useRegisteredMaterials";
import RegisteredMaterialsList from "~/components/students/myCourses/RegisteredMaterialsList";

const { Title } = Typography;

const MyCoursesPage: React.FC = () => {
  const { materials, loading, error, refetch } = useRegisteredMaterials();
  const location = useLocation();
  const hasRefetchedRef = useRef(false);

  // Auto-refresh when navigating to this page
  useEffect(() => {
    if (location.pathname === "/student/my-courses") {
      // Reset refetch flag when navigating to this page
      hasRefetchedRef.current = false;
      // Small delay to ensure page is fully loaded
      const timer = setTimeout(() => {
        refetch();
        hasRefetchedRef.current = true;
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.pathname, refetch]);

  // Also refetch when page becomes visible (user switches back to tab)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && location.pathname === "/student/my-courses") {
        // Wait a bit before refetching to allow backend to update
        setTimeout(() => {
          refetch();
        }, 500);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [location.pathname, refetch]);

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={2}>My Courses</Title>
        <p className="text-gray-500">
          {materials.length > 0
            ? `You have registered for ${materials.length} course${materials.length > 1 ? "s" : ""}`
            : "You haven't registered for any courses yet"}
        </p>
      </div>

      <RegisteredMaterialsList
        materials={materials}
        loading={loading}
        error={error}
        onRetry={refetch}
      />
    </div>
  );
};

export default MyCoursesPage;

