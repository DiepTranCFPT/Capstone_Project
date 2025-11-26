import React from "react";
import { Form, Input, Button } from "antd";
import { useStudent } from "~/hooks/useStudent";
import { useAuth } from "~/hooks/useAuth";
import type { UpdateStudentProfileRequest } from "~/types/user";

interface EditStudentProfileFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const EditStudentProfileForm: React.FC<EditStudentProfileFormProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuth();
    const { updateStudentProfile, loading } = useStudent();
    const [form] = Form.useForm();

    // Initialize form with current student profile data
    React.useEffect(() => {
        if (user?.studentProfile) {
            form.setFieldsValue({
                schoolName: user.studentProfile.schoolName || "",
                parentPhone: user.studentProfile.parentPhone || "",
                emergencyContact: user.studentProfile.emergencyContact || "",
            });
        }
    }, [user, form]);

    const handleSubmit = async (values: UpdateStudentProfileRequest) => {
        try {
            await updateStudentProfile(values);
            if (onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error updating student profile:", error);
        }
    };

    const handleCancel = () => {
        form.resetFields();
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <Form
            form={form}
            layout="vertical"
            onFinish={handleSubmit}
            disabled={loading}
        >
            <Form.Item
                label="Trường học"
                name="schoolName"
                rules={[
                    { required: true, message: "Vui lòng nhập tên trường học!" },
                    { max: 100, message: "Tên trường không được vượt quá 100 ký tự!" },
                ]}
            >
                <Input placeholder="Nhập tên trường học" />
            </Form.Item>

            <Form.Item
                label="Số điện thoại phụ huynh"
                name="parentPhone"
                rules={[
                    { required: true, message: "Vui lòng nhập số điện thoại phụ huynh!" },
                    { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ (10-11 chữ số)!" },
                ]}
            >
                <Input placeholder="Nhập số điện thoại phụ huynh" />
            </Form.Item>

            <Form.Item
                label="Liên hệ khẩn cấp"
                name="emergencyContact"
                rules={[
                    { required: true, message: "Vui lòng nhập liên hệ khẩn cấp!" },
                    { pattern: /^[0-9]{10,11}$/, message: "Số điện thoại không hợp lệ (10-11 chữ số)!" },
                ]}
            >
                <Input placeholder="Nhập liên hệ khẩn cấp" />
            </Form.Item>

            <Form.Item className="mb-0">
                <div className="flex gap-2 justify-end">
                    <Button onClick={handleCancel} disabled={loading}>
                        Hủy
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Cập nhật
                    </Button>
                </div>
            </Form.Item>
        </Form>
    );
};

export default EditStudentProfileForm;
