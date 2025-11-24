import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Card, DatePicker, Divider, Alert } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import { useAuth } from '~/hooks/useAuth';
// import { useNavigate } from 'react-router-dom';
import TeacherProfileService from '~/services/teacherProfileService';
import type { TeacherProfilePayload } from '~/types/teacherProfile';
import dayjs from 'dayjs';
import { toast } from '~/components/common/Toast';

const { TextArea } = Input;

const TeacherTutorProfilePage: React.FC = () => {
    const { user, updateAuthFromStorage } = useAuth();
    // const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);

    // Kiểm tra xem user đã có profile chưa
    const hasProfile = !!user?.teacherProfile;

    useEffect(() => {
        if (user?.teacherProfile) {
            // Fill form nếu đã có dữ liệu
            const profile = user.teacherProfile;
            form.setFieldsValue({
                dateOfBirth: profile.dateOfBirth ? dayjs(profile.dateOfBirth) : null,
                qualification: profile.qualification,
                specialization: profile.specialization,
                experience: profile.experience,
                biography: profile.biography,
                certificateUrls: profile.certificateUrls || []
            });
        } else if (user?.dob) {
            // Nếu chưa có profile nhưng user gốc có ngày sinh, điền sẵn
            form.setFieldValue('dateOfBirth', dayjs(user.dob));
        }
    }, [user, form]);

    const onFinish = async (values: TeacherProfilePayload) => {
        setLoading(true);
        try {
            const payload: TeacherProfilePayload = {
                dateOfBirth: values.dateOfBirth || '',
                qualification: values.qualification,
                specialization: values.specialization,
                experience: values.experience,
                biography: values.biography,
                certificateUrls: values.certificateUrls || []
            };

            if (hasProfile) {
                await TeacherProfileService.updateMyProfile(user.id, payload);
                toast.success('Cập nhật hồ sơ giáo viên thành công!');
            } else {
                await TeacherProfileService.createProfile(payload);
                toast.success('Tạo hồ sơ giáo viên thành công!');
            }

            // Refresh user data để cập nhật state mới (có teacherProfile)
            updateAuthFromStorage();

            // Nếu tạo mới thành công, có thể redirect hoặc reload
            if (!hasProfile) {
                // navigate('/teacher/dashboard');
                window.location.reload();
            }

        } catch (error) {
            toast.error('Có lỗi xảy ra. Vui lòng thử lại.');
            console.error('Error saving tutor profile:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold text-gray-800">
                        {hasProfile ? 'Quản lý Hồ sơ Giáo viên' : 'Tạo Hồ sơ Giáo viên'}
                    </h1>
                </div>

                {!hasProfile && (
                    <Alert
                        message="Bạn chưa có hồ sơ giảng dạy"
                        description="Vui lòng hoàn tất thông tin dưới đây để bắt đầu giảng dạy và được xác thực."
                        type="info"
                        showIcon
                        className="mb-6"
                    />
                )}

                <div className="grid grid-cols-1 gap-6">
                    <Card className="shadow-sm">
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFinish}
                            initialValues={{
                                certificateUrls: ['']
                            }}
                        >
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <Form.Item
                                    label="Ngày sinh"
                                    name="dateOfBirth"
                                    rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}
                                >
                                    <DatePicker style={{ width: '100%' }} format="YYYY-MM-DD" />
                                </Form.Item>

                                <Form.Item
                                    label="Chuyên môn (Specialization)"
                                    name="specialization"
                                    rules={[{ required: true, message: 'Vui lòng nhập chuyên môn chính' }]}
                                    help="Ví dụ: Toán học, Tiếng Anh, Lập trình ReactJS"
                                >
                                    <Input placeholder="Nhập chuyên môn của bạn" />
                                </Form.Item>
                            </div>

                            <Form.Item
                                label="Trình độ học vấn (Qualification)"
                                name="qualification"
                                rules={[{ required: true, message: 'Vui lòng nhập trình độ học vấn' }]}
                            >
                                <Input placeholder="Ví dụ: Cử nhân Sư phạm Toán, Thạc sĩ Khoa học máy tính..." />
                            </Form.Item>

                            <Form.Item
                                label="Kinh nghiệm (Experience)"
                                name="experience"
                                rules={[{ required: true, message: 'Vui lòng mô tả kinh nghiệm' }]}
                            >
                                <Input placeholder="Ví dụ: 5 năm giảng dạy tại trường THPT..." />
                            </Form.Item>

                            <Form.Item
                                label="Tiểu sử & Giới thiệu (Biography)"
                                name="biography"
                                rules={[
                                    { required: true, message: 'Vui lòng viết đôi dòng giới thiệu bản thân' },
                                    { min: 50, message: 'Tiểu sử nên dài ít nhất 50 ký tự' }
                                ]}
                            >
                                <TextArea
                                    rows={5}
                                    placeholder="Giới thiệu về phong cách giảng dạy, thành tích, và những gì học sinh có thể mong đợi..."
                                    showCount
                                    maxLength={1000}
                                />
                            </Form.Item>

                            <Divider orientation="left">Chứng chỉ & Bằng cấp</Divider>

                            <Form.List name="certificateUrls">
                                {(fields, { add, remove }) => (
                                    <>
                                        {fields.map((field, index) => (
                                            <Form.Item
                                                {...field}
                                                label={index === 0 ? "Link chứng chỉ" : ""}
                                                required={false}
                                                key={field.key}
                                            >
                                                <div className="flex gap-2">
                                                    <Form.Item
                                                        {...field}
                                                        validateTrigger={['onChange', 'onBlur']}
                                                        rules={[
                                                            { required: true, whitespace: true, message: "Vui lòng nhập URL chứng chỉ hoặc xóa dòng này." },
                                                            { type: 'url', message: 'Vui lòng nhập đúng định dạng URL' }
                                                        ]}
                                                        noStyle
                                                    >
                                                        <Input placeholder="https://drive.google.com/..." />
                                                    </Form.Item>
                                                    {fields.length > 0 ? (
                                                        <Button
                                                            type="text"
                                                            danger
                                                            className="dynamic-delete-button"
                                                            onClick={() => remove(field.name)}
                                                            icon={<MinusCircleOutlined />}
                                                        />
                                                    ) : null}
                                                </div>
                                            </Form.Item>
                                        ))}
                                        <Form.Item>
                                            <Button
                                                type="dashed"
                                                onClick={() => add()}
                                                style={{ width: '100%' }}
                                                icon={<PlusOutlined />}
                                            >
                                                Thêm link chứng chỉ
                                            </Button>
                                        </Form.Item>
                                    </>
                                )}
                            </Form.List>

                            <Form.Item className="mt-6">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    loading={loading}
                                    className="w-full h-10 font-semibold bg-teal-600 hover:bg-teal-700"
                                >
                                    {loading ? 'Đang xử lý...' : hasProfile ? 'Cập nhật Hồ sơ' : 'Tạo Hồ sơ Mới'}
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