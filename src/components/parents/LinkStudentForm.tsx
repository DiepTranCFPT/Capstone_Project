import React from 'react';
import { Form, Input, Button } from 'antd';
import type { FormProps } from 'antd';

interface LinkStudentFormValues {
  studentCode: string;
}

const LinkStudentForm: React.FC = () => {
  const onFinish: FormProps<LinkStudentFormValues>['onFinish'] = (values) => {
    console.log('Success:', values);
  };

  const onFinishFailed: FormProps<LinkStudentFormValues>['onFinishFailed'] = (errorInfo) => {
    console.log('Failed:', errorInfo);
  };

  return (
    <Form
      name="basic"
      initialValues={{ remember: true }}
      onFinish={onFinish}
      onFinishFailed={onFinishFailed}
      autoComplete="off"
    >
      <Form.Item
        label="Student Code"
        name="studentCode"
        rules={[{ required: true, message: 'Please input your student code!' }]}
      >
        <Input />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          Link Account
        </Button>
      </Form.Item>
    </Form>
  );
};

export default LinkStudentForm;
