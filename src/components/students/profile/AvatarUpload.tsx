import React, { useState } from "react";
import { Upload, Button, Card, Avatar, Spin } from "antd";
import { UploadOutlined, UserOutlined, CameraOutlined } from "@ant-design/icons";
import type { UploadProps } from "antd";
import { uploadAvatarApi } from "~/services/authService";
import { useAuth } from "~/hooks/useAuth";
import { toast } from "~/components/common/Toast";

interface AvatarUploadProps {
  onSuccess?: () => void;
}

const AvatarUpload: React.FC<AvatarUploadProps> = ({ onSuccess }) => {
  const { user, updateAuthFromStorage } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleUpload = async (file: File) => {
    setLoading(true);
    try {
      await uploadAvatarApi(file);

      // Update auth context with new avatar URL
      updateAuthFromStorage();

      toast.success("Tải lên ảnh đại diện thành công!");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error uploading avatar:", error);
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra khi tải lên ảnh đại diện");
    } finally {
      setLoading(false);
    }
  };

  const uploadProps: UploadProps = {
    beforeUpload: (file) => {
      // Validate file type
      const isImage = file.type.startsWith('image/');
      if (!isImage) {
        toast.error('Chỉ cho phép tải lên file ảnh!');
        return false;
      }

      // Validate file size (max 5MB)
      const isLessThan5MB = file.size / 1024 / 1024 < 5;
      if (!isLessThan5MB) {
        toast.error('Kích thước ảnh không được vượt quá 5MB!');
        return false;
      }

      // Handle the upload
      handleUpload(file);
      return false; // Prevent default upload behavior
    },
    showUploadList: false,
    disabled: loading,
  };



  if (!user) {
    return (
      <Card title="Ảnh đại diện">
        <div className="text-center py-4">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card
        title="Ảnh đại diện"
        className="w-full mx-auto"
      >
        <div className="flex flex-col text-center items-center justify-center">
          <div className="relative inline-block mb-4">
            <Avatar
              size={120}
              src={user.imgUrl}
              icon={!user.imgUrl ? <UserOutlined /> : undefined}
              className="border-2 border-gray-200"
            />

            <Upload {...uploadProps} className="absolute -bottom-7 right-12">
              <Button
                type="primary"
                shape="circle"
                icon={<CameraOutlined />}
                size="small"
                loading={loading}
                className=""
                title="Thay đổi ảnh đại diện"
              />
            </Upload>
          </div>

          <div className="mt-4">
            <Upload {...uploadProps}>
              <Button
                type="primary"
                icon={<UploadOutlined />}
                loading={loading}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Đang tải lên..." : "Thay đổi ảnh đại diện"}
              </Button>
            </Upload>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            <p>Định dạng hỗ trợ: JPG, PNG, GIF</p>
            <p>Kích thước tối đa: 5MB</p>
          </div>
        </div>
      </Card>
    </>
  );
};

export default AvatarUpload;
