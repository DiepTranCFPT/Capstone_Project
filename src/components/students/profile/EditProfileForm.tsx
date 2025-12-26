import React, { useState } from "react";
import { Form, Input, DatePicker, Button, Card, Spin } from "antd";
import type { EditProfileRequest } from "~/types/auth";
import { updateProfileApi } from "~/services/authService";
import { useAuth } from "~/hooks/useAuth";
import dayjs from "dayjs";
import { toast } from "~/components/common/Toast";

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
        dob: values.dob ? values.dob.format('YYYY-MM-DD') : user.dob,
      };

      await updateProfileApi(profileData);

      // Update auth context with new user data
      updateAuthFromStorage();

      toast.success("Update profile successfully!");

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error instanceof Error ? error.message : "Error updating profile");
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
      <Card title="Edit Profile">
        <div className="text-center py-4">
          <Spin size="large" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      title="Edit Profile"
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
            label="First Name"
            name="firstName"
            rules={[
              { required: true, message: "Please enter first name!" },
              { min: 2, message: "First name must be at least 2 characters!" },
              { max: 50, message: "First name cannot exceed 50 characters!" },
            ]}
          >
            <Input placeholder="Enter first name" />
          </Form.Item>

          <Form.Item
            label="Last Name"
            name="lastName"
            rules={[
              { required: true, message: "Please enter last name!" },
              { min: 2, message: "Last name must be at least 2 characters!" },
              { max: 50, message: "Last name cannot exceed 50 characters!" },
            ]}
          >
            <Input placeholder="Enter last name" />
          </Form.Item>
        </div>

        <Form.Item
          label="Email"
          name="email"
          rules={[
            { required: true, message: "Please enter email!" },
            { type: "email", message: "Email is not valid!" },
          ]}
        >
          <Input placeholder="Enter email" disabled />
        </Form.Item>

        <Form.Item
          label="Date of Birth"
          name="dob"
          rules={[
            { required: true, message: "Please select date of birth!" },
          ]}
        >
          <DatePicker
            placeholder="Select date of birth"
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
              Cancel
            </Button>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update
            </Button>
          </div>
        </Form.Item>
      </Form>
    </Card>
  );
};

export default EditProfileForm;
