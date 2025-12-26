import React, { useEffect } from 'react';
import { Form, Input, Button, message, Card, DatePicker } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';
import { useTeacherProfile } from '~/hooks/useTeacherProfile';
import type { User } from '~/types/auth';
import type { TeacherProfilePayload } from '~/types/teacherProfile';

interface TeacherProfileFormValues {
  dateOfBirth: dayjs.Dayjs;
  qualification: string;
  specialization: string;
  experience: string;
  biography: string;
  certificateUrls: string[];
}

const { TextArea } = Input;

interface EditTeacherProfileFormProps {
  currentUser: User;
  mode: 'create' | 'update';
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditTeacherProfileForm: React.FC<EditTeacherProfileFormProps> = ({ currentUser, mode, onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const { updateProfile, createProfile, loading } = useTeacherProfile();

  // Load current profile data if updating
  useEffect(() => {
    if (mode === 'update' && currentUser && currentUser.teacherProfile) {
      const { teacherProfile } = currentUser;
      const profileForForm = {
        dateOfBirth: teacherProfile.dateOfBirth ? dayjs(teacherProfile.dateOfBirth) : undefined,
        qualification: teacherProfile.qualification,
        specialization: teacherProfile.specialization,
        experience: teacherProfile.experience,
        biography: teacherProfile.biography,
        certificateUrls: teacherProfile.certificateUrls || [],
      };
      form.setFieldsValue(profileForForm);
    } else if (mode === 'create') {
      form.resetFields();
    }
  }, [currentUser, mode, form]);

  const handleSubmit = async (values: TeacherProfileFormValues) => {
    const payload: TeacherProfilePayload = {
      dateOfBirth: values.dateOfBirth ? values.dateOfBirth.format('YYYY-MM-DD') : (currentUser.dob ? (typeof currentUser.dob === 'string' ? currentUser.dob : currentUser.dob) : '2000-01-01'),
      qualification: values.qualification,
      specialization: values.specialization,
      experience: values.experience,
      biography: values.biography,
      certificateUrls: values.certificateUrls,
    };

    try {
      let result;
      if (mode === 'create') {
        result = await createProfile(payload);
      } else {
        if (!currentUser.teacherProfile) {
          message.error("No teacher profile found to update.");
          return;
        }
        result = await updateProfile(currentUser.teacherProfile.id, payload);
      }
      if (result) {
        message.success(mode === 'create' ? 'Profile created successfully!' : 'Profile updated successfully!');
        if (onSuccess) onSuccess();
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
        disabled={loading}
        className="space-y-6"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information Section */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-blue-500" />
                Basic Information
              </div>
            }
            className="shadow-sm"
          >
            <div className="space-y-4">
              <Form.Item
                label="Date of Birth *"
                name="dateOfBirth"
                rules={[{ required: true, message: 'Please select your date of birth!' }]}
              >
                <DatePicker
                  placeholder="Select date of birth"
                  format="DD/MM/YYYY"
                  className="w-full"
                  disabledDate={(current) => {
                    const hundredYearsAgo = dayjs().subtract(100, 'years');
                    const eighteenYearsAgo = dayjs().subtract(18, 'years');
                    return current && (current > eighteenYearsAgo || current < hundredYearsAgo);
                  }}
                />
              </Form.Item>
            </div>
          </Card>

          {/* Teaching Information Section */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <BookOutlined className="text-green-500" />
                Teaching Information
              </div>
            }
            className="shadow-sm"
          >
            <div className="space-y-4">
              <Form.Item
                label="Qualification *"
                name="qualification"
                rules={[
                  { required: true, message: 'Please enter your qualification!' },
                  { min: 2, max: 200, message: 'Qualification must be 2-200 characters' }
                ]}
              >
                <Input placeholder="e.g. Bachelor of Science in Mathematics" />
              </Form.Item>

              <Form.Item
                label="Specialization *"
                name="specialization"
                rules={[
                  { required: true, message: 'Please enter your specialization!' },
                  { min: 2, max: 200, message: 'Specialization must be 2-200 characters' }
                ]}
              >
                <Input placeholder="e.g. Mathematics, Physics, Calculus" />
              </Form.Item>

              <Form.Item
                label="Experience *"
                name="experience"
                rules={[
                  { required: true, message: 'Please enter your experience!' },
                  { min: 2, max: 100, message: 'Experience must be 2-100 characters' }
                ]}
              >
                <Input placeholder="e.g. 5 years teaching AP Calculus" />
              </Form.Item>
            </div>
          </Card>
        </div>

        <div className='flex flex-col gap-6'>
          {/* Biography Section */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-indigo-500" />
                Biography
              </div>
            }
            className="shadow-sm"
          >
            <Form.Item
              label="Biography *"
              name="biography"
              rules={[
                { required: true, message: 'Please enter your biography!' },
                { min: 50, max: 1000, message: 'Biography must be 50-1000 characters' }
              ]}
            >
              <TextArea
                placeholder="Tell students about yourself, your teaching experience, and what makes you a great tutor..."
                rows={6}
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Card>

          {/* Certificates Section */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <BookOutlined className="text-purple-500" />
                Certificates
              </div>
            }
            className="shadow-sm"
          >
            <Form.List name="certificateUrls">
              {(fields, { add, remove }) => (
                <>
                  {fields.map((field, index) => (
                    <Form.Item
                      {...field}
                      label={index === 0 ? "Certificate URLs" : ""}
                      key={field.key}
                      rules={[
                        { type: 'url', message: 'Please enter a valid URL!' },
                        { required: true, message: 'Please enter the certificate URL!' }
                      ]}
                    >
                      <Input
                        placeholder="https://example.com/certificate.pdf"
                        addonAfter={
                          <Button type="text" onClick={() => remove(field.name)} icon={<DeleteOutlined />} />
                        }
                      />
                    </Form.Item>
                  ))}
                  <Form.Item>
                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                      Add Certificate URL
                    </Button>
                  </Form.Item>
                </>
              )}
            </Form.List>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            {mode === 'create' ? 'Create Teacher Profile' : 'Update Teacher Profile'}
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditTeacherProfileForm;
