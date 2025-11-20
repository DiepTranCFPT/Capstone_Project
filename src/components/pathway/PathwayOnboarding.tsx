import React from "react";
import {
    Card,
    Button,
    Select,
    Form,
    Typography,
} from "antd";
import {
    RocketOutlined,
    CalendarOutlined,
    AimOutlined
} from "@ant-design/icons";
import type { FormInstance } from "antd";
import type { MajorOption } from "~/types/learningPath";

const { Title, Paragraph } = Typography;
const { Option } = Select;

interface PathwayOnboardingProps {
    majors: MajorOption[];
    isGenerating: boolean;
    onFinish: (values: { major: string; grade: number }) => void;
    form: FormInstance;
}

const PathwayOnboarding: React.FC<PathwayOnboardingProps> = ({
    majors,
    isGenerating,
    onFinish,
    form
}) => {
    return (
        <div className="min-h-screen relative overflow-hidden">
            <div className="relative max-w-2xl mx-auto py-12 px-6">
                <Card className="text-center shadow-2xl border-0 bg-white/95 backdrop-blur-sm rounded-2xl transform hover:scale-105 transition-all duration-500 animate-fade-in">
                    <div className="mb-8 relative">
                        <div className="absolute -top-8 -left-8 w-16 h-16 bg-teal-200 rounded-full opacity-70 animate-bounce"></div>
                        <div className="absolute -top-4 -right-4 w-10 h-10 bg-blue-200 rounded-full opacity-50 animate-pulse"></div>
                        <RocketOutlined className="text-7xl text-teal-500 mb-6 drop-shadow-lg animate-pulse" />
                        <Title level={2} className="text-gray-800 mb-2">🚀 Xây dựng lộ trình AP của bạn</Title>
                        <Paragraph className="text-gray-600 text-lg leading-relaxed">
                            Hãy cho chúng tôi biết mục tiêu của bạn! AI sẽ tạo một lộ trình học tập cá nhân hóa giúp bạn chinh phục các kỳ thi AP và bước vào ngôi trường mơ ước.
                        </Paragraph>
                    </div>

                    <Form
                        form={form}
                        layout="vertical"
                        onFinish={onFinish}
                        size="large"
                        className="space-y-6"
                    >
                        <Form.Item
                            name="grade"
                            label={<span className="text-base font-semibold text-gray-700">🎓 Bạn đang học lớp mấy?</span>}
                            rules={[{ required: true, message: 'Vui lòng chọn khối lớp' }]}
                        >
                            <Select
                                placeholder="Chọn khối lớp hiện tại"
                                suffixIcon={<CalendarOutlined className="text-teal-500" />}
                                className="rounded-lg"
                            >
                                <Option value={9}>
                                    <div className="flex items-center gap-2">
                                        <span>🌟</span>
                                        <span>Lớp 9 - Khởi đầu hành trình</span>
                                    </div>
                                </Option>
                                <Option value={10}>
                                    <div className="flex items-center gap-2">
                                        <span>🌟</span>
                                        <span>Lớp 10 - Vận động viên nổi bật</span>
                                    </div>
                                </Option>
                                <Option value={11}>
                                    <div className="flex items-center gap-2">
                                        <span>🏆</span>
                                        <span>Lớp 11 - Chiến binh tinh anh</span>
                                    </div>
                                </Option>
                                <Option value={12}>
                                    <div className="flex items-center gap-2">
                                        <span>🏆</span>
                                        <span>Lớp 12 - Champion tương lai</span>
                                    </div>
                                </Option>
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="major"
                            label={<span className="text-base font-semibold text-gray-700">🎯 Ngành học mục tiêu tại Đại học</span>}
                            rules={[{ required: true, message: 'Vui lòng chọn ngành mục tiêu' }]}
                        >
                            <Select
                                placeholder="Chọn ngành học mong muốn"
                                suffixIcon={<AimOutlined className="text-teal-500" />}
                                className="rounded-lg"
                            >
                                {majors.map(m => (
                                    <Option key={m.value} value={m.value}>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{m.label}</span>
                                            <span className="text-xs text-gray-500 italic">{m.description}</span>
                                        </div>
                                    </Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isGenerating}
                            block
                            className="bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 hover:from-teal-600 hover:via-cyan-600 hover:to-blue-600 h-14 text-lg font-bold rounded-full shadow-lg transform hover:scale-105 transition-all duration-300 border-0 mt-8"
                        >
                            {isGenerating ? (
                                <span>⚡ Đang phân tích và tạo lộ trình...</span>
                            ) : (
                                <span>✨ Tạo lộ trình ngay - Bắt đầu cuộc phiêu lưu!</span>
                            )}
                        </Button>
                    </Form>
                </Card>
            </div>
        </div>
    );
};

export default PathwayOnboarding;
