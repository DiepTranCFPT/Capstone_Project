import React, { useState } from "react";
import { Table, Button, Input, Space, Tag, Tooltip, Typography, Card } from "antd";
import { EyeOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { certificates, rankings } from "~/data/certificatesRankingData";
import type { Certificate, Ranking } from "~/types/certificatesRankingTypes";


const { Title } = Typography;

const CertificatesRanking: React.FC = () => {
  const [searchText, setSearchText] = useState("");

  // Lọc dữ liệu theo search
  const filteredCertificates = certificates.filter(
    (c) =>
      c.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
      c.course.toLowerCase().includes(searchText.toLowerCase()) ||
      c.title.toLowerCase().includes(searchText.toLowerCase())
  );

  const filteredRankings = rankings.filter(
    (r) =>
      r.studentName.toLowerCase().includes(searchText.toLowerCase()) ||
      r.subject.toLowerCase().includes(searchText.toLowerCase())
  );

  const certificateColumns: ColumnsType<Certificate> = [
    {
      title: "Certificate ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Course/Subject",
      dataIndex: "course",
      key: "course",
    },
    {
      title: "Certificate Title",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "Issue Date",
      dataIndex: "issueDate",
      key: "issueDate",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status: string) => (
        <Tag color={status === "Active" ? "green" : "red"}>{status}</Tag>
      ),
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Space>
          <Tooltip title="View">
            <Button type="primary" icon={<EyeOutlined />} onClick={() => console.log("View:", record)} />
          </Tooltip>
          <Tooltip title="Delete">
            <Button danger icon={<DeleteOutlined />} onClick={() => console.log("Delete:", record)} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rankingColumns: ColumnsType<Ranking> = [
    {
      title: "Rank",
      dataIndex: "rank",
      key: "rank",
      render: (rank: number) =>
        rank === 1 ? "🥇 1" : rank === 2 ? "🥈 2" : `#${rank}`,
    },
    {
      title: "Student Name",
      dataIndex: "studentName",
      key: "studentName",
    },
    {
      title: "Subject/Mock Test",
      dataIndex: "subject",
      key: "subject",
    },
    {
      title: "Score (%)",
      dataIndex: "score",
      key: "score",
    },
    {
      title: "Time Taken",
      dataIndex: "timeTaken",
      key: "timeTaken",
    },
    {
      title: "Attempt Date",
      dataIndex: "attemptDate",
      key: "attemptDate",
    },
    {
      title: "Actions",
      key: "actions",
      render: (_, record) => (
        <Button
          type="primary"
          icon={<EyeOutlined />}
          onClick={() => console.log("View Ranking:", record)}
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="shadow-sm border-0">
        <div className="mb-4">
          <Title level={2}>Certificates & Ranking</Title>
          <Input.Search
            placeholder="Search certificates or rankings..."
            allowClear
            enterButton={<SearchOutlined />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="max-w-md"
          />
        </div>

        {/* Certificate Table */}
        <div className="mb-6">
          <h3 className="font-semibold mb-2">Certificate Table</h3>
          <Table
            columns={certificateColumns}
            dataSource={filteredCertificates}
            rowKey="id"
            pagination={{ pageSize: 5 }}
          />
        </div>

        {/* Ranking Table */}
        <div>
          <h3 className="font-semibold mb-2">Ranking Table</h3>
          <Table
            columns={rankingColumns}
            dataSource={filteredRankings}
            rowKey="rank"
            pagination={{ pageSize: 5 }}
          />
        </div>
      </Card>
    </div>
  );
};

export default CertificatesRanking;
