import React from "react";
import { Form, Input, Button } from "antd";
import { useParent } from "~/hooks/useParent";
import { useAuth } from "~/hooks/useAuth";

interface EditParentProfileFormProps {
    onSuccess?: () => void;
    onCancel?: () => void;
}

const EditParentProfileForm: React.FC<EditParentProfileFormProps> = ({ onSuccess, onCancel }) => {
    const { user } = useAuth();
    const { updateParentProfile, loading } = useParent();
    const [form] = Form.useForm();

    // Initialize form with current parent profile data
    React.useEffect(() => {
        if (user?.parentProfile) {
            form.setFieldsValue({
                occupation: user.parentProfile.occupation || "",
            });
        }
    }, [user, form]);

    const handleSubmit = async (values: { occupation: string }) => {
        try {
            const success = await updateParentProfile(values);
            if (success && onSuccess) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error updating parent profile:", error);
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
                label="Occupation"
                name="occupation"
                rules={[
                    { required: true, message: "Please enter occupation!" },
                    { max: 100, message: "Occupation cannot exceed 100 characters!" },
                ]}
            >
                <Input placeholder="Enter occupation" />
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

export default EditParentProfileForm;
