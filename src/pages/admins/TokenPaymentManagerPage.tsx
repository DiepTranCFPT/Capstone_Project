import React, { useState } from "react";
import { Card, Typography, Tabs, Form, message } from "antd";
import type { TokenData } from "~/types/token";
import { tokens } from "~/data/tokens";
import TokenPackagesTab from "~/components/admins/tokens/TokenPackagesTab";
import WithdrawRequestsTab from "~/components/admins/tokens/WithdrawRequestsTab";
import TokenPackageModal from "~/components/admins/tokens/TokenPackageModal";

const { Title } = Typography;
const { TabPane } = Tabs;

const TokenPaymentManagerPage: React.FC = () => {
  const [tokenData, setTokenData] = useState(tokens);
  const [isTokenModalVisible, setIsTokenModalVisible] = useState(false);
  const [editingToken, setEditingToken] = useState<TokenData | null>(null);
  const [form] = Form.useForm();

  const handleAddToken = () => {
    setEditingToken(null);
    form.resetFields();
    setIsTokenModalVisible(true);
  };

  const handleEditToken = (record: TokenData) => {
    setEditingToken(record);
    form.setFieldsValue(record);
    setIsTokenModalVisible(true);
  };

  const handleTokenModalOk = () => {
    form.validateFields().then(values => {
      if (editingToken) {
        // Update existing
        setTokenData(prev => prev.map(token =>
          token.id === editingToken.id ? { ...token, ...values } : token
        ));
        message.success('Token package updated successfully');
      } else {
        // Add new
        const newToken: TokenData = {
          ...values,
          id: `TK-${Date.now()}`,
          status: 'Active',
        };
        setTokenData(prev => [...prev, newToken]);
        message.success('Token package added successfully');
      }
      setIsTokenModalVisible(false);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="shadow-sm border-0">
        <Title level={2} className="mb-4 text-gray-900">
          Token & Payment Management
        </Title>

        <Tabs defaultActiveKey="1">
          <TabPane tab="Token Packages" key="1">
            <TokenPackagesTab
              tokenData={tokenData}
              setTokenData={setTokenData}
              onAddToken={handleAddToken}
              onEditToken={handleEditToken}
            />
          </TabPane>

          <TabPane tab="Withdraw Requests" key="2">
            <WithdrawRequestsTab />
          </TabPane>
        </Tabs>

        <TokenPackageModal
          open={isTokenModalVisible}
          editingToken={editingToken}
          form={form}
          onOk={handleTokenModalOk}
          onCancel={() => setIsTokenModalVisible(false)}
        />
      </Card>
    </div>
  );
};

export default TokenPaymentManagerPage;

