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
       Enter the student's email and connection code to link their account.
       The student needs to provide their connection code from their personal page.
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
          label="Student Email"
          name="studentEmail"
          rules={[
            { required: true, message: 'Please enter the student email!' },
            { type: 'email', message: 'Email is invalid!' }
          ]}
        >
          <Input placeholder="student@example.com" />
        </Form.Item>

        <Form.Item
          label="Connection Code"
          name="connectionCode"
          rules={[{ required: true, message: 'Please enter the connection code!' }]}
        >
          <Input placeholder="ABC123" />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={loading}>
            Link Account
          </Button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default LinkStudentForm;
