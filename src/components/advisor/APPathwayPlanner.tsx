import React, { useState } from 'react';
import { Select, Button, Card, List, Tag, Empty } from 'antd';
import { BulbOutlined, SaveOutlined } from '@ant-design/icons';
import { mockAssignedStudents, majorToAPMap } from '~/data/advisor';
import type { APRecommendation } from '~/types/advisor';
import { toast } from '../common/Toast';

const { Option } = Select;

const APPathwayPlanner: React.FC = () => {
    const [selectedStudent, setSelectedStudent] = useState<string | null>(null);
    const [selectedMajor, setSelectedMajor] = useState<string | null>(null);
    const [recommendations, setRecommendations] = useState<APRecommendation[]>([]);
    const [loading, setLoading] = useState(false);

    const handleGetRecommendations = () => {
        if (!selectedStudent || !selectedMajor) {
            toast.warning('Vui lòng chọn học sinh và mục tiêu ngành học.');
            return;
        }
        setLoading(true);
        setTimeout(() => {
            const recommendedSubjects = majorToAPMap[selectedMajor] || [];
            setRecommendations(recommendedSubjects);
            setLoading(false);
        }, 500);
    };

    const handleSavePathway = () => {
        if (recommendations.length === 0) {
            toast.error('Không có lộ trình nào để lưu.');
            return;
        }
        // In a real app, this would save the pathway to the student's profile via an API call
        console.log(`Saving pathway for student ${selectedStudent} with major ${selectedMajor}`, recommendations);
        toast.success(`Đã lưu lộ trình học tập cho học sinh!`);
    };

    return (
        <Card title="Công cụ Định hướng Môn AP" variant="borderless" className="shadow-sm">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Select
                    placeholder="1. Chọn học sinh"
                    onChange={value => setSelectedStudent(value)}
                    allowClear
                >
                    {mockAssignedStudents.map(student => (
                        <Option key={student.id} value={student.id}>{student.name}</Option>
                    ))}
                </Select>
                <Select
                    placeholder="2. Chọn mục tiêu ngành học"
                    onChange={value => setSelectedMajor(value)}
                    disabled={!selectedStudent}
                    allowClear
                >
                    {Object.keys(majorToAPMap).map(major => (
                        <Option key={major} value={major}>{major}</Option>
                    ))}
                </Select>
                <Button
                    type="primary"
                    icon={<BulbOutlined />}
                    onClick={handleGetRecommendations}
                    disabled={!selectedMajor}
                    loading={loading}
                >
                    3. Lấy Gợi Ý
                </Button>
            </div>

            <h3 className="text-lg font-semibold mb-4 text-gray-700">Các môn AP được đề xuất:</h3>

            {recommendations.length > 0 ? (
                <List
                    itemLayout="vertical"
                    dataSource={recommendations}
                    renderItem={item => (
                        <List.Item
                            key={item.subject}
                            extra={<Tag color="blue">{item.category}</Tag>}
                        >
                            <List.Item.Meta
                                title={<span className="font-semibold">{item.subject}</span>}
                                description={item.reason}
                            />
                        </List.Item>
                    )}
                />
            ) : (
                <Empty description="Chưa có gợi ý nào. Vui lòng chọn mục tiêu và nhấn 'Lấy Gợi Ý'." />
            )}

            {recommendations.length > 0 && (
                <div className="text-right mt-6">
                    <Button
                        type="primary"
                        icon={<SaveOutlined />}
                        onClick={handleSavePathway}
                        className="bg-green-600 hover:bg-green-700 border-green-600"
                    >
                        Lưu Lộ Trình
                    </Button>
                </div>
            )}
        </Card>
    );
};

export default APPathwayPlanner;

