
import React from 'react';
import { Card, Button, Table, Space } from 'antd';

const ParentBillingPage: React.FC = () => {
  const tokenOptions = [
    { id: 1, amount: 10, price: 9.99 },
    { id: 2, amount: 50, price: 44.99 },
    { id: 3, amount: 100, price: 79.99 },
  ];

  const learningPackages = [
    {
      id: 1,
      name: 'Basic Math Access',
      description: 'Unlimited access to all basic math courses for 3 months.',
      price: 29.99,
    },
    {
      id: 2,
      name: 'Premium Science Pack',
      description: 'Access to all science courses, advanced labs, and 1-on-1 tutoring for 6 months.',
      price: 99.99,
    },
    {
      id: 3,
      name: 'Full Curriculum Yearly',
      description: 'Access to all subjects and features for one year.',
      price: 199.99,
    },
  ];

  const transactionHistory = [
    { id: '1', date: '2024-01-15', description: 'Purchased 50 tokens', amount: 44.99, status: 'Completed' },
    { id: '2', date: '2024-02-01', description: 'Purchased 10 tokens', amount: 9.99, status: 'Completed' },
    { id: '3', date: '2024-03-10', description: 'Used 5 tokens for quiz', amount: -5, status: 'Completed' },
    { id: '4', date: '2024-03-15', description: 'Purchased Basic Math Access', amount: 29.99, status: 'Completed' },
  ];

  const columns = [
    { title: 'Date', dataIndex: 'date', key: 'date' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Amount', dataIndex: 'amount', key: 'amount' },
    { title: 'Status', dataIndex: 'status', key: 'status' },
  ];

  const handleBuyTokens = (amount: number, price: number) => {
    console.log(`Buying ${amount} tokens for $${price}`);
    // Implement actual payment logic here
  };

  const handleBuyPackage = (packageName: string, price: number) => {
    console.log(`Buying ${packageName} for $${price}`);
    // Implement actual payment logic here
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-4">Billing</h1>
      <div className='flex flex-col gap-4'>
        <Card title="Buy Tokens" className="mb-4">
          <p className="mb-4">Choose a token package to purchase:</p>
          <Space size="large">
            {tokenOptions.map((option) => (
              <Card
                key={option.id}
                hoverable
                style={{ width: 200, textAlign: 'center' }}
                actions={[
                  <Button type="primary" onClick={() => handleBuyTokens(option.amount, option.price)}>
                    Buy Now
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={`${option.amount} Tokens`}
                  description={`$${option.price}`}
                />
              </Card>
            ))}
          </Space>
        </Card>

        <Card title="Learning Packages" className="mb-4">
          <p className="mb-4">Explore our learning packages:</p>
          <Space size="large" direction="vertical" style={{ width: '100%' }}>
            {learningPackages.map((pkg) => (
              <Card
                key={pkg.id}
                hoverable
                actions={[
                  <Button type="primary" onClick={() => handleBuyPackage(pkg.name, pkg.price)}>
                    Buy Now
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={pkg.name}
                  description={
                    <>
                      <p>{pkg.description}</p>
                      <p className="font-bold text-lg">{`$${pkg.price}`}</p>
                    </>
                  }
                />
              </Card>
            ))}
          </Space>
        </Card>

        <Card title="Transaction History">
          <Table columns={columns} dataSource={transactionHistory} rowKey="id" />
        </Card>
      </div>
    </div>
  );
};

export default ParentBillingPage;
