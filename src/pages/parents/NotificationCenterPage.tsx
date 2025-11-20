import React, { useState, useMemo } from 'react';
import { Card, Row, Col, Select, Button, Badge, Empty, Spin, Tabs } from 'antd';
import {
  BellFilled,
  DeleteOutlined,
  FilterOutlined,
  CheckOutlined
} from '@ant-design/icons';
import { useNotifications } from '~/hooks/useNotifications';
import type { Notification } from '~/types/notification';

const { TabPane } = Tabs;
const { Option } = Select;

const NotificationCenterPage: React.FC = () => {
  const {
    notifications,
    stats,
    loading,
    markAsRead,
    markAllAsRead,
    dismissNotification
  } = useNotifications();

  const [activeTab, setActiveTab] = useState('all');
  const [filterType, setFilterType] = useState<string>('');
  const [filterPriority, setFilterPriority] = useState<string>('');

  // Filter notifications based on current filters
  const filteredNotifications = useMemo(() => {
    let filtered = notifications;

    // Filter by tab (all, unread, high priority)
    switch (activeTab) {
      case 'unread':
        filtered = filtered.filter(n => !n.isRead);
        break;
      case 'high':
        filtered = filtered.filter(n => n.priority === 'high');
        break;
      default:
        break;
    }

    // Additional filters
    if (filterType) {
      filtered = filtered.filter(n => n.type === filterType);
    }
    if (filterPriority) {
      filtered = filtered.filter(n => n.priority === filterPriority);
    }

    return filtered;
  }, [notifications, activeTab, filterType, filterPriority]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return '#ff4d4f';
      case 'medium': return '#fa8c16';
      case 'low': return '#52c41a';
      default: return '#d9d9d9';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'exam_deadline': return 'Đến hạn thi';
      case 'low_score': return 'Điểm thấp';
      case 'performance_alert': return 'Cảnh báo hiệu suất';
      case 'new_assignment': return 'Bài tập mới';
      case 'system_message': return 'Thông báo hệ thống';
      default: return type;
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) {
      return `${diffDays} ngày trước`;
    } else if (diffHours > 0) {
      return `${diffHours} giờ trước`;
    } else {
      return 'Vừa mới';
    }
  };

  const NotificationCard: React.FC<{ notification: Notification }> = ({ notification }) => (
    <Card
      size="small"
      className={`mb-2 transition-all duration-200 ${!notification.isRead ? 'border-l-4 border-blue-500 bg-blue-50' : 'bg-white'
        }`}
      actions={[
        !notification.isRead && (
          <Button
            type="text"
            size="small"
            icon={<CheckOutlined />}
            onClick={() => markAsRead(notification.id)}
          >
            Đã đọc
          </Button>
        ),
        <Button
          type="text"
          size="small"
          danger
          icon={<DeleteOutlined />}
          onClick={() => dismissNotification(notification.id)}
        >
          Xóa
        </Button>
      ].filter(Boolean)}
    >
      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0">
          {getPriorityIcon(notification.priority)}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center space-x-2">
              <span className="text-sm font-medium text-gray-900">
                {notification.title}
              </span>
              <Badge
                count={getTypeLabel(notification.type)}
                style={{
                  backgroundColor: getPriorityColor(notification.priority),
                  color: 'white',
                  fontSize: '10px'
                }}
              />
            </div>
            <span className="text-xs text-gray-500">
              {formatTimeAgo(notification.createdAt)}
            </span>
          </div>
          <p className="text-sm text-gray-700 mb-2">{notification.message}</p>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>{notification.studentName}</span>
            {notification.deadline && (
              <span className="text-red-500">
                Deadline: {new Date(notification.deadline).toLocaleString('vi-VN')}
              </span>
            )}
            {notification.score && (
              <span className="text-red-500">Điểm: {notification.score}/100</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  );

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <BellFilled className="text-2xl text-blue-600" />
          <h1 className="text-2xl font-bold text-gray-900">Trung tâm Thông báo</h1>
        </div>
        {stats.unread > 0 && (
          <Button type="primary" onClick={markAllAsRead}>
            Đánh dấu tất cả đã đọc
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <Row gutter={16} className="mb-6">
        <Col span={8}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-sm text-gray-600">Tổng số thông báo</div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.unread}</div>
              <div className="text-sm text-gray-600">Chưa đọc</div>
            </div>
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.highPriority}</div>
              <div className="text-sm text-gray-600">Ưu tiên cao</div>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Filters */}
      <Card className="mb-6">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center space-x-2">
            <FilterOutlined />
            <span className="text-sm font-medium">Lọc:</span>
          </div>

          <Select
            placeholder="Chọn loại thông báo"
            style={{ width: 200 }}
            value={filterType || undefined}
            onChange={setFilterType}
            allowClear
          >
            <Option value="exam_deadline">Đến hạn thi</Option>
            <Option value="low_score">Điểm thấp</Option>
            <Option value="performance_alert">Cảnh báo hiệu suất</Option>
            <Option value="new_assignment">Bài tập mới</Option>
            <Option value="system_message">Thông báo hệ thống</Option>
          </Select>

          <Select
            placeholder="Chọn độ ưu tiên"
            style={{ width: 150 }}
            value={filterPriority || undefined}
            onChange={setFilterPriority}
            allowClear
          >
            <Option value="high">Cao</Option>
            <Option value="medium">Trung bình</Option>
            <Option value="low">Thấp</Option>
          </Select>

          <Button
            type="text"
            onClick={() => {
              setFilterType('');
              setFilterPriority('');
            }}
            disabled={!filterType && !filterPriority}
          >
            Xóa bộ lọc
          </Button>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs activeKey={activeTab} onChange={setActiveTab} className="mb-4">
        <TabPane
          tab={
            <span>
              Tất cả
              {stats.total > 0 && (
                <Badge count={stats.total} style={{ marginLeft: 8 }} />
              )}
            </span>
          }
          key="all"
        />
        <TabPane
          tab={
            <span>
              Chưa đọc
              {stats.unread > 0 && (
                <Badge count={stats.unread} style={{ marginLeft: 8, backgroundColor: '#1890ff' }} />
              )}
            </span>
          }
          key="unread"
        />
        <TabPane
          tab={
            <span>
              Ưu tiên cao
              {stats.highPriority > 0 && (
                <Badge count={stats.highPriority} style={{ marginLeft: 8, backgroundColor: '#ff4d4f' }} />
              )}
            </span>
          }
          key="high"
        />
      </Tabs>

      {/* Notifications List */}
      {filteredNotifications.length > 0 ? (
        <div className="space-y-2">
          {filteredNotifications.map(notification => (
            <div className='flex flex-col gap-2'>
              <NotificationCard
                key={notification.id}
                notification={notification}
              />
            </div>
          ))}
        </div>
      ) : (
        <Card>
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              activeTab === 'unread'
                ? 'Không có thông báo chưa đọc'
                : activeTab === 'high'
                  ? 'Không có thông báo ưu tiên cao'
                  : 'Không có thông báo nào'
            }
          />
        </Card>
      )}
    </div>
  );
};

export default NotificationCenterPage;
