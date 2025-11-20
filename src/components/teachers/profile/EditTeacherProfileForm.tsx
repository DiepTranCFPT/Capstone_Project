import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, InputNumber, message, DatePicker, Card } from 'antd';
import {
  UserOutlined,
  BookOutlined,
  GlobalOutlined,
  PlusOutlined,
  DeleteOutlined
} from '@ant-design/icons';
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;

interface EditTeacherProfileFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

const EditTeacherProfileForm: React.FC<EditTeacherProfileFormProps> = ({ onSuccess, onCancel }) => {
  const [form] = Form.useForm();
  const [qualifications, setQualifications] = useState<string[]>(['']);
  const [loading, setLoading] = useState(false);

  // Available subjects for teaching
  const subjectOptions = [
    "Mathematics", "Physics", "Chemistry", "Biology",
    "English", "History", "Computer Science", "Art",
    "Music", "Programming", "Design", "Language",
    "Economics", "Psychology", "Calculus", "Statistics"
  ];

  // // Preferred location options
  // const locationOptions = [
  //   { label: "Online/Virtual", value: "Online/Virtual" },
  //   { label: "In-person", value: "In-person" },
  //   { label: "Both", value: "Both" }
  // ];

  // Load current profile data (mock for now)
  useEffect(() => {
    // This would normally load from API
    const mockProfileData = {
      firstName: 'John',
      lastName: 'Smith',
      dob: dayjs('1985-05-15'),
      teachingSubjects: ['Mathematics', 'Physics'],
      yearsOfExperience: 8,
      hourlyRate: 50,
      preferredLocation: 'Online/Virtual',
      bio: 'Experienced AP and SAT math tutor with 8 years of experience.',
      linkedInProfile: 'https://linkedin.com/in/johnsmith-teacher',
      portfolio: 'https://johnsmith-teaching.com',
      teachingPhilosophy: 'Every student has the potential to excel when provided with the right tools and support.'
    };

    form.setFieldsValue(mockProfileData);
    setQualifications(['Bachelor of Education', 'Master of Teaching']);
  }, [form]);

  // Handle qualifications dynamically
  const addQualification = () => {
    setQualifications([...qualifications, '']);
  };

  const removeQualification = (index: number) => {
    if (qualifications.length > 1) {
      const newQuals = qualifications.filter((_, i) => i !== index);
      setQualifications(newQuals);
    }
  };

  const updateQualification = (index: number, value: string) => {
    const newQuals = [...qualifications];
    newQuals[index] = value;
    setQualifications(newQuals);
  };

  const validateUrl = (_: unknown, value: string) => {
    if (!value || value === '') return Promise.resolve();
    const urlPattern = /^https?:\/\/.+/;
    if (!urlPattern.test(value)) {
      return Promise.reject('Please enter a valid URL (https://...)');
    }
    return Promise.resolve();
  };

  const handleSubmit = async (values: Record<string, unknown> & { dob: dayjs.Dayjs }) => {
    setLoading(true);
    try {
      const submitData = {
        ...values,
        qualifications: qualifications.filter(q => q.trim() !== ''),
        dob: values.dob.format('YYYY-MM-DD')
      };

      // Here you would submit to API
      console.log('Submitting teacher profile:', submitData);

      message.success("Teacher profile updated successfully!");
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error updating teacher profile:", error);
      message.error("Failed to update profile. Please try again.");
    } finally {
      setLoading(false);
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
                Personal Information
              </div>
            }
            className="shadow-sm"
          >
            <div className="space-y-4">
              <Form.Item
                label="First Name *"
                name="firstName"
                rules={[
                  { required: true, message: 'Please enter your first name!' },
                  { min: 2, max: 50, message: 'First name must be 2-50 characters' }
                ]}
              >
                <Input placeholder="Enter first name" />
              </Form.Item>

              <Form.Item
                label="Last Name *"
                name="lastName"
                rules={[
                  { required: true, message: 'Please enter your last name!' },
                  { min: 2, max: 50, message: 'Last name must be 2-50 characters' }
                ]}
              >
                <Input placeholder="Enter last name" />
              </Form.Item>

              <Form.Item
                label="Date of Birth *"
                name="dob"
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

              {/* <Form.Item
                label="Preferred Location *"
                name="preferredLocation"
                rules={[{ required: true, message: 'Please select your preferred location!' }]}
              >
                <Select placeholder="Select preferred location">
                  {locationOptions.map(option => (
                    <Option key={option.value} value={option.value}>
                      {option.label}
                    </Option>
                  ))}
                </Select>
              </Form.Item> */}
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
                label="Subjects You Teach *"
                name="teachingSubjects"
                rules={[
                  { required: true, message: 'Please select at least one subject!' },
                  { type: 'array', min: 1, message: 'Please select at least one subject!' }
                ]}
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
                label="Years of Experience *"
                name="yearsOfExperience"
                rules={[
                  { required: true, message: 'Please enter your years of experience!' },
                  { type: 'number', min: 0, max: 50, message: 'Experience must be 0-50 years' }
                ]}
              >
                <InputNumber
                  placeholder="Enter years of experience"
                  min={0}
                  max={50}
                  className="w-full"
                />
              </Form.Item>

              <Form.Item
                label="Hourly Rate (USD) *"
                name="hourlyRate"
                rules={[
                  { required: true, message: 'Please enter your hourly rate!' },
                  { type: 'number', message: 'Please enter a valid number!' }
                ]}
              >
                <InputNumber
                  placeholder="Enter hourly rate"
                  min={10}
                  max={200}
                  formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                  // parser={value => Number((value as string)?.replace(/\$\s?|(,*)/g, ''))}
                  className="w-full"
                />
              </Form.Item>
            </div>
          </Card>
        </div>

        {/* Qualifications Section */}
        <Card
          title={
            <div className="flex items-center gap-2">
              <BookOutlined className="text-purple-500" />
              Educational Qualifications
            </div>
          }
          className="shadow-sm"
        >
          <div className="space-y-3">
            {qualifications.map((qualification, index) => (
              <div key={index} className="flex gap-2 items-center">
                <Input
                  placeholder={`Qualification ${index + 1}`}
                  value={qualification}
                  onChange={(e) => updateQualification(index, e.target.value)}
                  className="flex-1"
                />
                {qualifications.length > 1 && (
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => removeQualification(index)}
                    size="small"
                  />
                )}
              </div>
            ))}
            <Button
              type="dashed"
              onClick={addQualification}
              className="w-full mt-2"
              icon={<PlusOutlined />}
            >
              Add Qualification
            </Button>
          </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bio Section */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <UserOutlined className="text-indigo-500" />
                Personal Bio
              </div>
            }
            className="shadow-sm"
          >
            <Form.Item
              label="Biography *"
              name="bio"
              rules={[
                { required: true, message: 'Please enter your biography!' },
                { min: 50, max: 500, message: 'Bio must be 50-500 characters' }
              ]}
            >
              <TextArea
                placeholder="Tell students about yourself, your experience, and what makes you a great tutor..."
                rows={6}
                showCount
                maxLength={500}
              />
            </Form.Item>

            <Form.Item
              label="Teaching Philosophy"
              name="teachingPhilosophy"
              rules={[
                { min: 50, max: 1000, message: 'Teaching philosophy must be 50-1000 characters' }
              ]}
            >
              <TextArea
                placeholder="Share your teaching philosophy and approach to tutoring..."
                rows={4}
                showCount
                maxLength={1000}
              />
            </Form.Item>
          </Card>

          {/* Online Presence Section */}
          <Card
            title={
              <div className="flex items-center gap-2">
                <GlobalOutlined className="text-teal-500" />
                Online Presence (Optional)
              </div>
            }
            className="shadow-sm"
          >
            <div className="space-y-4">
              <Form.Item
                label="LinkedIn Profile"
                name="linkedInProfile"
                rules={[{ validator: validateUrl }]}
              >
                <Input
                  placeholder="https://linkedin.com/in/yourprofile"
                  prefix={<GlobalOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <Form.Item
                label="Portfolio Website"
                name="portfolio"
                rules={[{ validator: validateUrl }]}
              >
                <Input
                  placeholder="https://yourportfolio.com"
                  prefix={<GlobalOutlined className="text-gray-400" />}
                />
              </Form.Item>

              <div className="text-sm text-gray-500 mt-4 p-3 bg-gray-50 rounded">
                <p className="font-medium mb-1">💡 Pro Tip:</p>
                <p>Add links to your professional profiles to build trust with students and showcase your expertise.</p>
              </div>
            </div>
          </Card>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-3 pt-6 border-t">
          <Button onClick={onCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" htmlType="submit" loading={loading}>
            Update Teacher Profile
          </Button>
        </div>
      </Form>
    </div>
  );
};

export default EditTeacherProfileForm;
