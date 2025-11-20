import React from 'react';
import { Form, Input, Button } from 'antd';
import { toast } from '~/components/common/Toast';

interface TeacherChangePasswordFormProps {
  onSuccess?: () => void;
}

const TeacherChangePasswordForm: React.FC<TeacherChangePasswordFormProps> = ({ onSuccess }) => {
  const [form] = Form.useForm();

  const handleSubmit = async () => {
    try {
      toast.info("Change password form - Coming soon!");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSubmit}
    >
      <Form.Item
        label="Current Password"
        name="currentPassword"
        rules={[{ required: true, message: 'Please enter current password!' }]}
      >
        <Input.Password placeholder="Enter current password" />
      </Form.Item>

      <Form.Item
        label="New Password"
        name="newPassword"
        rules={[{ required: true, message: 'Please enter new password!' }]}
      >
        <Input.Password placeholder="Enter new password" />
      </Form.Item>

      <Form.Item
        label="Confirm New Password"
        name="confirmPassword"
        rules={[{ required: true, message: 'Please confirm new password!' }]}
      >
        <Input.Password placeholder="Confirm new password" />
      </Form.Item>

      <Form.Item>
        <div className="flex gap-2 justify-end">
          <Button type="primary" htmlType="submit">Change Password</Button>
        </div>
      </Form.Item>
    </Form>
  );
};

export default TeacherChangePasswordForm;
