import React from 'react';
import { Form, Input, Button } from 'antd';
import type { FormProps } from 'antd';
import { useParent } from '~/hooks/useParent';

interface LinkStudentFormValues {
  studentEmail: string;
  connectionCode: string;
}

const LinkStudentForm: React.FC = () => {
  const { linkStudent, loading } = useParent();
  const [form] = Form.useForm();

  const onFinish: FormProps<LinkStudentFormValues>['onFinish'] = async (values) => {
    try {
      const success = await linkStudent(values.studentEmail, values.connectionCode);
      if (success) {
        form.resetFields();
      }
    } catch (error) {
      console.error('Error linking student:', error);
    }
  };

  const onFinishFailed: FormProps<LinkStudentFormValues>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <div>
      <p className="mb-4 text-gray-600">
        Nhập email của học sinh và mã kết nối để liên kết tài khoản.
        Học sinh cần cung cấp mã kết nối từ trang cá nhân của họ.
      </p>
      <Form
        form={form}
        name="linkStudent"
        layout="vertical"
        onFinish={onFinish}
        onFinishFailed={onFinishFailed}
        autoComplete="off"
      >
        <Form.Item
          label="Email học sinh"
          name="studentEmail"
          rules={[
            { required: true, message: 'Vui lòng nhập email của học sinh!' },
            { type: 'email', message: 'Email không hợp lệ!' }
          ]}
        >
          <Input placeholder="student@example.com" />
        </Form.Item>

        <Form.Item
          label="Mã kết nối"
          name="connectionCode"
          rules={[{ required: true, message: 'Vui lòng nhập mã kết nối!' }]}
        >
          <Input placeholder="ABC123" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Liên kết tài khoản
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LinkStudentForm;
