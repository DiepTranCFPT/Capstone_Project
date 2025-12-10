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
                goal: user.studentProfile.goal || "",
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
                label="School name"
                name="schoolName"
                rules={[
                    { required: true, message: "Please enter school name!" },
                    { max: 100, message: "School name cannot exceed 100 characters!" },
                ]}
            >
                <Input placeholder="Enter school name" />
            </Form.Item>

            <Form.Item
                label="Parent phone"
                name="parentPhone"
                rules={[
                    { required: true, message: "Please enter parent phone!" },
                    { pattern: /^[0-9]{10,11}$/, message: "Invalid phone number (10-11 digits)!" },
                ]}
            >
                <Input placeholder="Enter parent phone" />
            </Form.Item>

            <Form.Item
                label="Emergency contact"
                name="emergencyContact"
                rules={[
                    { required: true, message: "Please enter emergency contact!" },
                    { pattern: /^[0-9]{10,11}$/, message: "Invalid phone number (10-11 digits)!" },
                ]}
            >
                <Input placeholder="Enter emergency contact" />
            </Form.Item>
            <Form.Item
                label="Goal"
                name="goal"
                rules={[
                    { required: true, message: "Please enter goal!" },
                    { max: 100, message: "Goal cannot exceed 100 characters!" },
                ]}
            >
                <Input placeholder="Enter goal" />
            </Form.Item>

            <Form.Item className="mb-0">
                <div className="flex gap-2 justify-end">
                    <Button onClick={handleCancel} disabled={loading}>
                        Cancel
                    </Button>
                    <Button type="primary" htmlType="submit" loading={loading}>
                        Update
                    </Button>
                </div>
            </Form.Item>
        </Form>
    );
};

export default EditStudentProfileForm;
