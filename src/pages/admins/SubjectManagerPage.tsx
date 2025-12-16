import React, { useState } from 'react';
import { Tabs } from 'antd';
import { BookOutlined, TagsOutlined } from '@ant-design/icons';
import SubjectManager from '~/components/admins/subjects/SubjectManager';
import QuestionTopicManager from '~/components/admins/subjects/QuestionTopicManager';

const SubjectManagerPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState('subjects');

  const items = [
    {
      key: 'subjects',
      label: (
        <span className="flex items-center gap-2">
          <BookOutlined />
          Subjects
        </span>
      ),
      children: <SubjectManager />,
    },
    {
      key: 'topics',
      label: (
        <span className="flex items-center gap-2">
          <TagsOutlined />
          Question Topics
        </span>
      ),
      children: <QuestionTopicManager />,
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={items}
        className="px-4 pt-4"
        size="large"
        tabBarStyle={{
          marginBottom: 0,
          paddingLeft: 16,
          background: 'white',
          borderBottom: '1px solid #e5e7eb',
        }}
      />
    </div>
  );
};

export default SubjectManagerPage;
