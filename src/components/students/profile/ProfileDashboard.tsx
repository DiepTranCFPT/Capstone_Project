import React from "react";
import { Card, Progress, Table, Tag } from "antd";
import type { ColumnsType } from "antd/es/table";
import { mockProfile } from "~/data/profileData";
import type { Subject, TestResult, UserProfile } from "~/types/profile";


const ProfileDashboard: React.FC = () => {
  const profile: UserProfile = mockProfile;

  const columns: ColumnsType<TestResult> = [
    { title: "Môn học", dataIndex: "subject", key: "subject" },
    { title: "Điểm số", dataIndex: "score", key: "score" },
    { title: "Ngày thi", dataIndex: "date", key: "date" },
  ];

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Thông tin cơ bản */}
      <Card title="Thông tin học sinh" bordered>
        <p><strong>Họ tên:</strong> {profile.name}</p>
        <p><strong>Trình độ hiện tại:</strong> {profile.currentLevel}</p>
        <p><strong>Mục tiêu nghề nghiệp:</strong> {profile.careerGoal}</p>
      </Card>

      {/* Tiến độ học tập */}
      <Card title="Tiến độ học tập">
        {profile.subjects.map((subject: Subject) => (
          <div key={subject.name} className="mb-4">
            <p className="mb-1 font-medium">{subject.name}</p>
            <Progress percent={subject.progress} status="active" />
            <div className="flex gap-2 mt-1">
              <Tag color="green">Mạnh: {subject.strength}</Tag>
              <Tag color="red">Yếu: {subject.weakness}</Tag>
            </div>
          </div>
        ))}
      </Card>

      {/* Kết quả luyện thi */}
      <Card title="Kết quả luyện thi" className="md:col-span-2">
        <Table
          dataSource={profile.testResults}
          columns={columns}
          rowKey={(record) => record.subject + record.date}
          pagination={false}
        />
      </Card>
    </div>
  );
};

export default ProfileDashboard;
