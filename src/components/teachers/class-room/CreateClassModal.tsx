import React from 'react';
import { Modal, Form, Input } from 'antd';

interface CreateClassModalProps {
    visible: boolean;
    onCreate: (values: { name: string; subject: string }) => void;
    onCancel: () => void;
}

const CreateClassModal: React.FC<CreateClassModalProps> = ({ visible, onCreate, onCancel }) => {
    const [form] = Form.useForm();

    return (
        <Modal
            visible={visible}
            title="Create a new class"
            okText="Create"
            cancelText="Cancel"
            onCancel={onCancel}
            onOk={() => {
                form
                    .validateFields()
                    .then(values => {
                        form.resetFields();
                        onCreate(values);
                    })
                    .catch(info => {
                        console.log('Validate Failed:', info);
                    });
            }}
        >
            <Form
                form={form}
                layout="vertical"
                name="form_in_modal"
            >
                <Form.Item
                    name="name"
                    label="Class Name"
                    rules={[{ required: true, message: 'Please input the name of the class!' }]}
                >
                    <Input />
                </Form.Item>
                <Form.Item
                    name="subject"
                    label="Subject"
                    rules={[{ required: true, message: 'Please input the subject!' }]}
                >
                    <Input />
                </Form.Item>
            </Form>
        </Modal>
    );
};

export default CreateClassModal;
