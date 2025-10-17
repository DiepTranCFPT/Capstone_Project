import React from 'react';
import { Card, Form, Select, DatePicker, Button, message } from 'antd';
import { FilePdfOutlined, SendOutlined } from '@ant-design/icons';
import { mockAssignedStudents } from '../../data/advisor';

const { Option } = Select;
const { RangePicker } = DatePicker;

const ReportingPage: React.FC = () => {

    const onFinish = (values: unknown) => {
        console.log('Generating report for:', values);
        message.success('Báo cáo đã được tạo và gửi thành công!');
    };

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Tạo và gửi báo cáo</h1>
            <Card title="Tạo báo cáo">
                <Form
                    name="report-form"
                    onFinish={onFinish}
                    layout="vertical"
                >
                    <Form.Item
                        name="studentId"
                        label="Chọn sinh viên"
                        rules={[{ required: true, message: 'Vui lòng chọn một sinh viên!' }]}
                    >
                        <Select placeholder="Chọn một sinh viên">
                            {mockAssignedStudents.map(student => (
                                <Option key={student.id} value={student.id}>{student.name}</Option>
                            ))}
                        </Select>
                    </Form.Item>

                    <Form.Item
                        name="dateRange"
                        label="Chọn khoảng thời gian"
                        rules={[{ required: true, message: 'Vui lòng chọn khoảng thời gian!' }]}
                    >
                        <RangePicker style={{ width: '100%' }} />
                    </Form.Item>

                    <Form.Item>
                        <Button type="primary" htmlType="submit" icon={<FilePdfOutlined />}>
                            Tạo báo cáo
                        </Button>
                        <Button type="default" htmlType="submit" icon={<SendOutlined />} style={{ marginLeft: '10px' }}>
                            Tạo và gửi
                        </Button>
                    </Form.Item>
                </Form>
            </Card>
        </div>
    );
};

export default ReportingPage;

