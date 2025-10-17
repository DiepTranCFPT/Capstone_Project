import React, { useState } from "react";
import { Form, Input, DatePicker, Button, Card, message, Spin } from "antd";
import type { EditProfileRequest } from "~/types/auth";
import { updateProfileApi } from "~/services/authService";
import { useAuth } from "~/hooks/useAuth";
import dayjs from "dayjs";

interface EditProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditProfileForm: React.FC<EditProfileFormProps> = ({ onSuccess, onCancel }) => {
  const { user, updateAuthFromStorage } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Initialize form with current user data
  React.useEffect(() => {
    if (user) {
      form.setFieldsValue({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        dob: user.dob ? dayjs(user.dob) : null,
      });
    }
  }, [user, form]);

  const handleSubmit = async (values: {
    firstName: string;
    lastName: string;
    dob?: dayjs.Dayjs;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      const profileData: EditProfileRequest = {
        firstName: values.firstName,
        lastName: values.lastName,
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : user.dob.toISOString().split('T')[0],
      };

      await updateProfileApi(profileData);

      // Update auth context with new user data
      updateAuthFromStorage();

      message.success("Cập nhật thông tin thành công!");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      message.error(error instanceof Error ? error.message : "Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    if (onCancel) {
      onCancel();
    }
  };

  if (!user) {
    return (
      <Card title="Chỉnh sửa thông tin cá nhân">
        <div className="text-center py-4">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Chỉnh sửa thông tin cá nhân"
      className="w-full max-w-2xl"
    >
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={loading}
        initialValues={{
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          dob: user.dob ? dayjs(user.dob) : null,
        }}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Form.Item
            label="Họ"
            name="firstName"
            rules={[
              { required: true, message: "Vui lòng nhập họ!" },
              { min: 2, message: "Họ phải có ít nhất 2 ký tự!" },
              { max: 50, message: "Họ không được vượt quá 50 ký tự!" },
            ]}
          >
            <Input placeholder="Nhập họ" />
          </Form.Item>

          <Form.Item
            label="Tên"
            name="lastName"
            rules={[
              { required: true, message: "Vui lòng nhập tên!" },
              { min: 2, message: "Tên phải có ít nhất 2 ký tự!" },
              { max: 50, message: "Tên không được vượt quá 50 ký tự!" },
            ]}
          >
            <Input placeholder="Nhập tên" />
          </Form.Item>
        </div>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Vui lòng nhập email!" },
            { type: "email", message: "Email không hợp lệ!" },
          ]}
        >
          <Input placeholder="Nhập email" disabled />
        </Form.Item>

        <Form.Item
          label="Ngày sinh"
          name="dob"
          rules={[
            { required: true, message: "Vui lòng chọn ngày sinh!" },
          ]}
        >
          <DatePicker
            placeholder="Chọn ngày sinh"
            format="DD/MM/YYYY"
            className="w-full"
            disabledDate={(current) => {
              // Disable future dates and dates too far in the past (e.g., more than 100 years ago)
              const hundredYearsAgo = dayjs().subtract(100, 'years');
              const today = dayjs();
              return current && (current > today || current < hundredYearsAgo);
            }}
          />
        </Form.Item>

        <Form.Item className="mb-0">
          <div className="flex gap-2 justify-end">
            <Button onClick={handleCancel} disabled={loading}>
              Hủy
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Cập nhật
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditProfileForm;
