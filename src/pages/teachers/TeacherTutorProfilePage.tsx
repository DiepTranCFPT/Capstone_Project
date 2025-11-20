import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Card, Switch, message, Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { useAuth } from '~/hooks/useAuth';

const { TextArea } = Input;
const { Option } = Select;

interface TutorProfileForm {
    subjects: string[];
    bio: string;
    hourlyRate: number;
    isActive: boolean;
}

const subjectOptions = [
    'Mathematics',
    'Physics',
    'Chemistry',
    'Biology',
    'English',
    'History',
    'Geography',
    'Computer Science',
    'Economics',
    'Psychology',
    'SAT',
    'ACT',
    'AP Calculus',
    'AP Physics',
    'AP Chemistry',
    'AP Biology',
    'TOEFL',
    'IELTS'
];

const TeacherTutorProfilePage: React.FC = () => {
    const { user } = useAuth();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [initialLoading, setInitialLoading] = useState(true);

    useEffect(() => {
        // Mock loading of existing tutor profile
        // In real app, this would fetch from API
        const mockProfile = {
            subjects: ['Mathematics', 'Physics'],
            bio: 'Experienced teacher with a passion for helping students excel in STEM subjects.',
            hourlyRate: 50,
            isActive: true
        };

        setTimeout(() => {
            form.setFieldsValue(mockProfile);
            setInitialLoading(false);
        }, 1000);
    }, [form]);

    const onFinish = async (values: TutorProfileForm) => {
        setLoading(true);
        try {
            // Mock API call to save tutor profile
            console.log('Saving tutor profile:', values);
            await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API delay
            message.success('Tutor profile updated successfully!');
        } catch (error) {
            message.error('Failed to update profile. Please try again.');
            console.error('Error updating tutor profile:', error);
        } finally {
            setLoading(false);
        }
    };

    if (initialLoading) {
        return <div className="flex justify-center items-center h-64">Loading...</div>;
    }

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Tutor Profile Management</h1>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Profile Card */}
                    <Card className="md:col-span-1 flex flex-col items-center">
                        <Avatar
                            size={120}
                            src={user?.imgUrl}
                            icon={<UserOutlined />}
                            className="mb-4"
                        />
                        <h2 className="text-xl font-semibold">{user?.firstName} {user?.lastName}</h2>
                        <p className="text-gray-600 text-center mt-2">
                            Set up your profile to start accepting tutoring requests
                        </p>
                    </Card>

                    {/* Settings Form */}
                    <Card className="md:col-span-2">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            initialValues={{
                                subjects: [],
                                bio: '',
                                hourlyRate: 50,
                                isActive: false
                            }}
                        >
                            <Form.Item
                                label="Teaching Subjects"
                                name="subjects"
                                rules={[{ required: true, message: 'Please select at least one subject' }]}
                            >
                                <Select
                                    mode="multiple"
                                    placeholder="Select subjects you teach"
                                    style={{ width: '100%' }}
                                >
                                    {subjectOptions.map(subject => (
                                        <Option key={subject} value={subject}>
                                            {subject}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                label="Bio"
                                name="bio"
                                rules={[
                                    { required: true, message: 'Please write a brief bio' },
                                    { min: 50, message: 'Bio must be at least 50 characters' }
                                ]}
                            >
                                <TextArea
                                    rows={4}
                                    placeholder="Describe your experience, teaching style, and what makes you a great tutor..."
                                    maxLength={500}
                                    showCount
                                />
                            </Form.Item>

                            <Form.Item
                                label="Hourly Rate (USD)"
                                name="hourlyRate"
                                rules={[
                                    { required: true, message: 'Please set your hourly rate' },
                                    { type: 'number', min: 20, message: 'Rate must be at least $20/hour' }
                                ]}
                            >
                                <Input
                                    type="number"
                                    prefix="$"
                                    min={20}
                                    step={5}
                                />
                            </Form.Item>

                            <Form.Item
                                label="Profile Status"
                                name="isActive"
                                valuePropName="checked"
                            >
                                <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
                            </Form.Item>

                            <Form.Item>
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full"
                                >
                                    {loading ? 'Updating...' : 'Update Profile'}
                                </Button>
                            </Form.Item>
                        </Form>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default TeacherTutorProfilePage;