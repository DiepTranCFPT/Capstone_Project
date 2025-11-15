import React from "react";
import { Tabs, message } from "antd";
import { useNavigate } from "react-router-dom";
import type { Material } from "~/types/material";
import { useMaterialRegister } from "~/hooks/useMaterialRegister";

interface MaterialDetailTabProps {
  material: Material;
}

const MaterialDetailTab: React.FC<MaterialDetailTabProps> = ({ material }) => {
  const { register, loading, error } = useMaterialRegister();
  const navigate = useNavigate();

  const handleRegister = async () => {
    try {
      await register(material.id);
      message.success("Đăng ký tài liệu thành công!");
      // Chuyển đến trang học sau khi đăng ký thành công
      setTimeout(() => {
        navigate(`/materials/${material.id}/learn`);
      }, 1000);
    } catch (err: unknown) {
      // Kiểm tra nếu đã đăng ký rồi (code 1033)
      if (
        typeof err === "object" &&
        err !== null &&
        "response" in err
      ) {
        const axiosError = err as { 
          response?: { 
            data?: { 
              message?: string; 
              error?: string;
              code?: number;
            };
            status?: number;
          } 
        };
        
        // Nếu đã đăng ký rồi, chuyển đến trang học luôn
        if (axiosError.response?.data?.code === 1033 || 
            axiosError.response?.data?.message?.includes("already registered")) {
          message.info("Bạn đã đăng ký khóa học này rồi. Đang chuyển đến trang học...");
          setTimeout(() => {
            navigate(`/materials/${material.id}/learn`);
          }, 500);
          return;
        }
        
        // Xử lý các lỗi khác
        let errorMessage = "Đã xảy ra lỗi khi đăng ký tài liệu.";
        if (axiosError.response?.data?.message) {
          errorMessage = axiosError.response.data.message;
        } else if (axiosError.response?.data?.error) {
          errorMessage = axiosError.response.data.error;
        } else if (axiosError.response?.status === 400) {
          errorMessage = "Yêu cầu không hợp lệ. Vui lòng kiểm tra lại thông tin.";
        } else if (axiosError.response?.status === 401) {
          errorMessage = "Bạn cần đăng nhập để đăng ký tài liệu.";
        } else if (axiosError.response?.status === 403) {
          errorMessage = "Bạn không có quyền thực hiện thao tác này.";
        }
        message.error(errorMessage);
      } else if (error) {
        message.error(error);
      } else {
        message.error("Đã xảy ra lỗi khi đăng ký tài liệu.");
      }
    }
  };
  return (
    <div className="bg-white rounded-xl shadow p-4">
      {/* Hình ảnh + tiêu đề */}
      <img
        src={material.image}
        alt={material.title}
        className="w-full h-60 object-cover rounded-lg mb-4"
      />
      <h2 className="text-xl font-semibold mb-2">{material.title}</h2>
      <p className="text-gray-500 mb-4">
        {material.topic} • {material.subject}
      </p>

      {/* Tabs */}
      <Tabs
        defaultActiveKey="overview"
        items={[
          {
            key: "overview",
            label: "Overview",
            children: (
              <div>
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p className="text-gray-600 mb-4">{material.description}</p>

                <h3 className="text-lg font-semibold mb-2">What Will You Learn?</h3>
                <p className="text-gray-600 mb-4">
                  Quickly synergize cutting-edge scenarios and professional
                  results. Assertively deliver cross-media results before
                  client-centric results. Uniquely initiate intuitive communities
                  through process-centric internal or "organic" sources.
                </p>
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-40 bg-teal-400 hover:bg-teal-500 disabled:bg-gray-300 disabled:cursor-not-allowed text-white border-0 rounded-xl h-12 font-semibold"
                >
                  {loading ? "Đang xử lý..." : "Register Now"}
                </button>
              </div>
            ),
          },
          {
            key: "curriculum",
            label: "Curriculum",
            children: <p>Curriculum content will go here...</p>,
          },
          {
            key: "instructor",
            label: "Instructor",
            children: <p>Instructor details will go here...</p>,
          },
          {
            key: "reviews",
            label: "Reviews",
            children: <p>Reviews will go here...</p>,
          },
        ]}
      />
    </div>
  );
};

export default MaterialDetailTab;

