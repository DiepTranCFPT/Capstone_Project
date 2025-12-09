import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Table, Button, Tag, Typography, Space} from 'antd';
import { ArrowLeftOutlined, TrophyOutlined, FileTextOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { useParent } from '~/hooks/useParent';
import { useParentDashboardStats } from '~/hooks/useParentDashboardStats';
import type { ChildExamHistoryItem } from '~/types/parent';
import ChildDetailStats from '~/components/parents/ChildDetailStats';
import dayjs from 'dayjs';
import Loading from '~/components/common/Loading';

const { Text } = Typography;

const StudentDetailPage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const {
    examHistory,
    historyPageInfo,
    loadingHistory,
    fetchChildren,
    fetchChildExamHistory
  } = useParent();

  // Fetch detailed stats for charts
  const { stats: childStats, loading: statsLoading } = useParentDashboardStats(studentId || null);

  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  useEffect(() => {
    fetchChildren();
  }, [fetchChildren]);

  useEffect(() => {
    if (studentId) {
      fetchChildExamHistory(studentId, currentPage, pageSize);
    }
  }, [studentId, currentPage, fetchChildExamHistory]);


  const columns: ColumnsType<ChildExamHistoryItem> = [
    {
      title: 'Exam',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text code>{title}</Text>,
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      render: (score: number) => (
        <Tag color={score >= 80 ? 'green' : score >= 50 ? 'orange' : 'red'}>
          {score.toFixed(1)}
        </Tag>
      ),
      sorter: (a, b) => a.score - b.score,
    },
    {
      title: 'Rating',
      dataIndex: 'rating',
      key: 'rating',
      render: (rating: number) => (
        <Space>
          <TrophyOutlined style={{ color: '#faad14' }} />
          <Text>{rating}/5</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'COMPLETED' ? 'success' : 'processing'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Start Time',
      dataIndex: 'startTime',
      key: 'startTime',
      render: (time: string) => dayjs(time).format('DD/MM/YYYY HH:mm'),
      sorter: (a, b) => dayjs(a.startTime).unix() - dayjs(b.startTime).unix(),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (time: string) => time ? dayjs(time).format('DD/MM/YYYY HH:mm') : 'N/A',
    },
  ];

  if (!studentId && !loadingHistory) {
    return (
      <div className="p-6">
        <Card>
          <div className="text-center py-8">
            <Text type="danger">Student not found</Text>
            <div className="mt-4">
              <Button type="primary" onClick={() => navigate('/parent/dashboard')}>
                Back
              </Button>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => navigate('/parent/dashboard')}
        className="mb-4"
      >
        Back
      </Button>
  
      {/* Topic Performance Charts */}
      <div className="mb-6">
        <ChildDetailStats
          stats={childStats}
          loading={statsLoading}
        />
      </div>

      <Card title="Exam history" extra={<FileTextOutlined />}>
        {loadingHistory ? (
          <Loading />
        ) : (
          <Table
            columns={columns}
            dataSource={examHistory}
            rowKey="attemptId"
            pagination={{
              current: currentPage + 1,
              pageSize: pageSize,
              total: historyPageInfo?.totalElements || 0,
              onChange: (page) => setCurrentPage(page - 1),
              showSizeChanger: false,
              showTotal: (total) => `Total ${total} exams`,
            }}
            locale={{
              emptyText: 'No exam history',
            }}
          />
        )}
      </Card>
    </div>
  );
};

export default StudentDetailPage;
