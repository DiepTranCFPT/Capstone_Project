import React from "react";
import { Card, Typography, Tabs } from "antd";
import WithdrawRequestsTab from "~/components/admins/tokens/WithdrawRequestsTab";

const { Title } = Typography;
const { TabPane } = Tabs;

const TokenPaymentManagerPage: React.FC = () => {


  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="shadow-sm border-0">
        <Title level={2} className="mb-4 text-gray-900">
          Withdraw Requests
        </Title>

        <Tabs defaultActiveKey="1">       
          <TabPane tab="Withdraw Requests" key="1">
            <WithdrawRequestsTab />
          </TabPane>
        </Tabs>

      </Card>
    </div>
  );
};

export default TokenPaymentManagerPage;

