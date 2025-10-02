import React from 'react';
import { Card } from 'antd';
import LinkStudentForm from '~/components/parents/LinkStudentForm';

const LinkStudentPage: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Link Student</h1>
      <Card>
        <LinkStudentForm />
      </Card>
    </div>
  );
};

export default LinkStudentPage;