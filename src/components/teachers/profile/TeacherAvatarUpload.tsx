import React from "react";
import { Card, Avatar, Button } from "antd";
import { UserOutlined, UploadOutlined } from "@ant-design/icons";
import { useAuth } from "~/hooks/useAuth";
import { toast } from "~/components/common/Toast";

const TeacherAvatarUpload: React.FC = () => {
  const { user } = useAuth();

  const handleUpload = () => {
    toast.info("Avatar upload component - Coming soon!");
  };

  return (
    <Card title="Ảnh đại diện" className="w-full mx-auto">
      <div className="flex flex-col text-center items-center justify-center">
        <div className="relative inline-block mb-4">
          <Avatar
            size={120}
            src={user?.imgUrl || `https://ui-avatars.com/api/?name=${user?.firstName} ${user?.lastName}&background=random`}
            icon={!user?.imgUrl ? <UserOutlined /> : undefined}
            className="border-2 border-gray-200"
          />
        </div>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={handleUpload}
          className="w-full"
        >
          Thay đổi ảnh đại diện
        </Button>
      </div>
    </Card>
  );
};

export default TeacherAvatarUpload;
