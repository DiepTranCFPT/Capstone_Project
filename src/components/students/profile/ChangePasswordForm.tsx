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

      toast.success("Đổi mật khẩu thành công!");

      form.resetFields();
      setVisibleModal(false);

      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast.error(error instanceof Error ? error.message : "Có lỗi xảy ra khi đổi mật khẩu");
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (_: unknown, value: string) => {
    if (!value) {
      return Promise.reject("Vui lòng nhập mật khẩu mới!");
    }

    if (value.length < 6) {
      return Promise.reject("Mật khẩu phải có ít nhất 6 ký tự!");
    }

    if (!/(?=.*[a-z])/.test(value)) {
      return Promise.reject("Mật khẩu phải chứa ít nhất 1 chữ cái thường!");
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
      return Promise.reject("Mật khẩu xác nhận không khớp!");
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
        Đổi mật khẩu
      </Button>

      <Modal
        title="Đổi mật khẩu"
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
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[
              { required: true, message: "Vui lòng nhập mật khẩu hiện tại!" },
              { min: 1, message: "Vui lòng nhập mật khẩu hiện tại!" },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu hiện tại"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { validator: validatePassword },
            ]}
          >
            <Input.Password
              placeholder="Nhập mật khẩu mới"
              iconRender={(visible) =>
                visible ? <EyeOutlined /> : <EyeInvisibleOutlined />
              }
            />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            rules={[
              { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
              validateConfirmPassword,
            ]}
          >
            <Input.Password
              placeholder="Nhập lại mật khẩu mới"
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
                Hủy
              </Button>
              <Button type="primary" htmlType="submit" loading={loading}>
                Đổi mật khẩu
              </Button>
            </div>
          </Form.Item>
        </Form>

        <div className="mt-4 p-3 bg-gray-50 rounded text-sm text-gray-600">
          <p className="font-medium mb-1">Yêu cầu mật khẩu:</p>
          <ul className="text-xs space-y-1">
            <li>• Ít nhất 6 ký tự</li>
            <li>• Chứa chữ cái thường (a-z)</li>
            {/* <li>• Chứa chữ số (0-9)</li> */}
            {/* <li>• Chứa ký tự đặc biệt (@$!%*?&)</li> */}
          </ul>
        </div>
      </Modal>
    </>
  );
};

export default ChangePasswordForm;
