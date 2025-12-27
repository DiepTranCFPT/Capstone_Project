import React, { useState, useEffect } from 'react';
import { Card, Form, InputNumber, Button, Spin, Empty, Divider, Alert, Statistic, Row, Col, Slider } from 'antd';
import { SaveOutlined, ReloadOutlined, PercentageOutlined } from '@ant-design/icons';
import { usePercentageConfig } from '~/hooks/usePercentageConfig';

const ProfitPercentagePage: React.FC = () => {
    const { config, loading, error, updateConfig, fetchConfig } = usePercentageConfig();
    const [form] = Form.useForm();
    const [saving, setSaving] = useState(false);

    // Separate state for sliders to avoid Form.Item conflicts
    const [verifiedSliderValue, setVerifiedSliderValue] = useState<number>(0);
    const [unverifiedSliderValue, setUnverifiedSliderValue] = useState<number>(0);

    useEffect(() => {
        if (config) {
            const teacherVerifiedPercent = config.percentTeacherVerified * 100;
            const teacherUnverifiedPercent = config.percentTeacherUnverified * 100;

            form.setFieldsValue({
                percentTeacher: teacherVerifiedPercent,
                percentTeacherUnverified: teacherUnverifiedPercent,
            });

            // Update slider states
            setVerifiedSliderValue(teacherVerifiedPercent);
            setUnverifiedSliderValue(teacherUnverifiedPercent);
        }
    }, [config, form]);

    const handleSubmit = async (values: { percentTeacher: number; percentTeacherUnverified: number }) => {
        setSaving(true);
        try {
            // Convert from display format (70) to backend format (0.7)
            await updateConfig({
                percentTeacher: values.percentTeacher / 100,
                percentTeacherUnverified: values.percentTeacherUnverified / 100,
            });
        } catch (err) {
            console.error('Failed to update config:', err);
        } finally {
            setSaving(false);
        }
    };

    const handleReset = () => {
        if (config) {
            const teacherVerifiedPercent = config.percentTeacherVerified * 100;
            const teacherUnverifiedPercent = config.percentTeacherUnverified * 100;

            form.setFieldsValue({
                percentTeacher: teacherVerifiedPercent,
                percentTeacherUnverified: teacherUnverifiedPercent,
            });

            // Reset slider states
            setVerifiedSliderValue(teacherVerifiedPercent);
            setUnverifiedSliderValue(teacherUnverifiedPercent);
        }
    };

    if (loading && !config) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Spin size="large" />
            </div>
        );
    }

    if (error && !config) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Empty description={error}>
                    <Button type="primary" onClick={fetchConfig}>
                        Retry
                    </Button>
                </Empty>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">
                    Profit Percentage Configuration
                </h1>

                <Card
                    title={
                        <div className="flex items-center gap-2">
                            <PercentageOutlined className="text-indigo-600" />
                            <span>Revenue Distribution Settings</span>
                        </div>
                    }
                    extra={
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={fetchConfig}
                            loading={loading}
                        >
                            Refresh
                        </Button>
                    }
                    className="shadow-md"
                >
                    <Alert
                        message="Important Information"
                        description="Configure the percentage distribution of revenue between verified teachers, unverified teachers, and the platform. Admin percentages are calculated automatically."
                        type="info"
                        showIcon
                        className="mb-6"
                    />

                    {/* Current Configuration Display */}
                    {config && (
                        <div className="mb-6 mt-2">
                            <h3 className="text-lg font-semibold text-gray-700 mb-4">Current Distribution</h3>

                            {/* Verified Teachers */}
                            <h4 className="text-md font-medium text-gray-600 mb-3">Verified Teachers</h4>
                            <Row gutter={16} className="mb-4">
                                <Col span={12}>
                                    <Card>
                                        <Statistic
                                            title="Teacher Gets"
                                            value={config.percentTeacherVerified * 100}
                                            suffix="%"
                                            precision={2}
                                            valueStyle={{ color: '#3f8600' }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card>
                                        <Statistic
                                            title="Platform Gets"
                                            value={config.percentAdminVerified * 100}
                                            suffix="%"
                                            precision={2}
                                            valueStyle={{ color: '#cf1322' }}
                                        />
                                    </Card>
                                </Col>
                            </Row>

                            {/* Unverified Teachers */}
                            <h4 className="text-md font-medium text-gray-600 mb-3">Unverified Teachers</h4>
                            <Row gutter={16}>
                                <Col span={12}>
                                    <Card>
                                        <Statistic
                                            title="Teacher Gets"
                                            value={config.percentTeacherUnverified * 100}
                                            suffix="%"
                                            precision={2}
                                            valueStyle={{ color: '#1677ff' }}
                                        />
                                    </Card>
                                </Col>
                                <Col span={12}>
                                    <Card>
                                        <Statistic
                                            title="Platform Gets"
                                            value={config.percentAdminUnverified * 100}
                                            suffix="%"
                                            precision={2}
                                            valueStyle={{ color: '#fa8c16' }}
                                        />
                                    </Card>
                                </Col>
                            </Row>
                        </div>
                    )}

                    <Divider />

                    {/* Edit Form */}
                    <h3 className="text-lg font-semibold text-gray-700 mb-4">Update Configuration</h3>
                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={handleSubmit}
                    >
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item
                                    label="Verified Teacher Percentage (%)"
                                    name="percentTeacher"
                                    rules={[
                                        { required: true, message: 'Please enter verified teacher percentage' },
                                        {
                                            type: 'number',
                                            min: 0,
                                            max: 100,
                                            message: 'Percentage must be between 0 and 100',
                                        },
                                    ]}
                                    extra="The percentage that verified teachers receive from their earnings"
                                >
                                    <div className="flex gap-3 items-center">
                                        <Slider
                                            className="flex-1"
                                            min={0}
                                            max={100}
                                            step={0.01}
                                            value={verifiedSliderValue}
                                            onChange={(value) => {
                                                setVerifiedSliderValue(value);
                                                form.setFieldValue('percentTeacher', value);
                                            }}
                                            tooltip={{ formatter: (value) => `${value?.toFixed(2)}%` }}
                                        />
                                        <InputNumber
                                            min={0}
                                            max={100}
                                            precision={2}
                                            value={verifiedSliderValue}
                                            onChange={(value) => {
                                                const newValue = value || 0;
                                                setVerifiedSliderValue(newValue);
                                                form.setFieldValue('percentTeacher', newValue);
                                            }}
                                            addonAfter="%"
                                            className="w-32"
                                        />
                                    </div>
                                </Form.Item>
                            </Col>

                            <Col span={12}>
                                <Form.Item
                                    label="Unverified Teacher Percentage (%)"
                                    name="percentTeacherUnverified"
                                    rules={[
                                        { required: true, message: 'Please enter unverified teacher percentage' },
                                        {
                                            type: 'number',
                                            min: 0,
                                            max: 100,
                                            message: 'Percentage must be between 0 and 100',
                                        },
                                    ]}
                                    extra="The percentage that unverified teachers receive from their earnings"
                                >
                                    <div className="flex gap-3 items-center">
                                        <Slider
                                            className="flex-1"
                                            min={0}
                                            max={100}
                                            step={0.01}
                                            value={unverifiedSliderValue}
                                            onChange={(value) => {
                                                setUnverifiedSliderValue(value);
                                                form.setFieldValue('percentTeacherUnverified', value);
                                            }}
                                            tooltip={{ formatter: (value) => `${value?.toFixed(2)}%` }}
                                        />
                                        <InputNumber
                                            min={0}
                                            max={100}
                                            precision={2}
                                            value={unverifiedSliderValue}
                                            onChange={(value) => {
                                                const newValue = value || 0;
                                                setUnverifiedSliderValue(newValue);
                                                form.setFieldValue('percentTeacherUnverified', newValue);
                                            }}
                                            addonAfter="%"
                                            className="w-32"
                                        />
                                    </div>
                                </Form.Item>
                            </Col>
                        </Row>

                        <Alert
                            message="Note"
                            description="Admin percentages (platform cut) are automatically calculated as 100% minus the teacher percentage for each category."
                            type="info"
                            showIcon
                            className="mb-4"
                        />

                        <Form.Item>
                            <div className="flex gap-3 mt-2">
                                <Button
                                    type="primary"
                                    htmlType="submit"
                                    icon={<SaveOutlined />}
                                    loading={saving}
                                    size="large"
                                >
                                    Save Configuration
                                </Button>
                                <Button
                                    onClick={handleReset}
                                    disabled={saving}
                                    size="large"
                                >
                                    Reset
                                </Button>
                            </div>
                        </Form.Item>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default ProfitPercentagePage;
