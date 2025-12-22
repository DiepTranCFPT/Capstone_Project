import React, { useState } from "react";
import { Form, Input, Button, Modal } from "antd";
import { LockOutlined, EyeInvisibleOutlined, EyeOutlined } from "@ant-design/icons";
import { changePasswordApi } from "~/services/authService";
import { useAuth } from "~/hooks/useAuth";
import { toast } from "~/components/common/Toast";

interface ChangePasswordFormProps {
  onSuccess?: () => void;
}

const ChangePasswordForm: React.FC<ChangePasswordFormProps> = ({ onSuccess }) => {
  const { user } = useAuth();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);

  const handleSubmit = async (values: {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
  }) => {
    if (!user) return;

    setLoading(true);
    try {
      // Generate a temporary token for the API call
      // In a real app, you might want to get this from the auth context
      const tempToken = localStorage.getItem('token') || '';
      const formData = {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
        token: tempToken,
      }

      await changePasswordApi(formData);

      toast.success("Change password successfully!");

      form.resetFields();
      setVisibleModal(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error instanceof Error ? error.message : "Error changing password");
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject("Please enter new password!");
    }

    if (value.length < 6) {
      return Promise.reject("Password must be at least 6 characters!");
    }

    if (!/(?=.*[a-z])/.test(value)) {
      return Promise.reject("Password must contain at least 1 lowercase letter!");
    }

    // if (!/(?=.*\d)/.test(value)) {
    //   return Promise.reject("Mật khẩu phải chứa ít nhất 1 chữ số!");
    // }

    // if (!/(?=.*[@$!%*?&])/.test(value)) {
    //   return Promise.reject("Mật khẩu phải chứa ít nhất 1 ký tự đặc biệt (@$!%*?&)!".replace(/!/g, ''));
    // }

    return Promise.resolve();
  };

  const validateConfirmPassword = {
    validator(_: unknown, value: string) {
      const newPassword = form.getFieldValue('newPassword');
      if (!value || newPassword === value) {
        return Promise.resolve();
      }
      return Promise.reject("Confirm password does not match!");
    },
  };

  return (
    <>
      <Button
        type="primary"
        icon={<LockOutlined />}
        onClick={() => setVisibleModal(true)}
        className="mb-4"
      >
        Change Password
      </Button>

      <Modal
        title="Change Password"
        open={visibleModal}
        onCancel={() => {
          setVisibleModal(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loading}
        >
          <Form.Item
            label="Current Password"
            name="currentPassword"
            rules={[
              { required: true, message: "Please enter current password!" },
              { min: 1, message: "Please enter current password!" },
            ]}
          >
            <Input.Password
              placeholder="Enter current password"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="New Password"
            name="newPassword"
            rules={[
              { validator: validatePassword },
            ]}
          >
            <Input.Password
              placeholder="Enter new password"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="Confirm New Password"
            name="confirmPassword"
            rules={[
              { required: true, message: "Please confirm new password!" },
              validateConfirmPassword,
            ]}
          >
            <Input.Password
              placeholder="Enter new password again"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item className="mb-0">
            <div className="flex gap-2 justify-end">
              <Button
                onClick={() => {
                  setVisibleModal(false);
                  form.resetFields();
                }}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Change Password
              </Button>
            </div>
          </Form.Item>
        </Form>

        <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
          <p className="font-medium mb-1">Password requirements:</p>
          <ul className="text-xs space-y-1">
            <li>• At least 6 characters</li>
            <li>• Contains lowercase letter (a-z)</li>
            {/* <li>• Chứa chữ số (0-9)</li> */}
            {/* <li>• Chứa ký tự đặc biệt (@$!%*?&)</li> */}
          </ul>
        </div>
      </Modal>
    </>
  );
};

export default ChangePasswordForm;
