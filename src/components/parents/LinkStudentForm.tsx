import React from 'react';
import { Form, Input, Button } from 'antd';

const LinkStudentForm: React.FC = () => {
  const onFinish = (values: any) => {
    console.log('Success:', values);
  };

  const onFinishFailed = (errorInfo: any) => {
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