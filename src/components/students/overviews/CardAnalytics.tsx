import { Button, Card, Col, List, Row, Statistic } from "antd";
import type React from "react";
import { Link } from "react-router-dom";
import { completedTests } from "~/data/mockTest";
import {
    LineChartOutlined,
    CheckCircleOutlined,
    RightOutlined
} from '@ant-design/icons';

const CardAnalytics: React.FC = () => {
    return (
        <Card className="bg-white rounded-2xl shadow-lg border-0 hover:shadow-xl transition-all duration-300 mb-8">
            <Row justify="space-between" align="middle" className="mb-4">
                <Col>
                    <div className="flex items-center gap-3">
                        <div className="p-3 bg-purple-100 rounded-xl">
                            <LineChartOutlined className="text-xl text-purple-600" />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">Test Analytics</h3>
                            <p className="text-sm text-gray-500">Your performance on full tests</p>
                        </div>
                    </div>
                </Col>
                <Col>
                    <Link to="/student/test-reports">
                        <Button type="text" className="text-blue-600 hover:bg-blue-50">
                            View All Reports <RightOutlined className="ml-2" />
                        </Button>
                    </Link>
                </Col>
            </Row>

            <List
                itemLayout="horizontal"
                dataSource={completedTests}
                renderItem={item => (
                    <List.Item>
                        <List.Item.Meta
                            avatar={<CheckCircleOutlined className="text-green-500 text-xl" />}
                            title={<a href="#">{item.title}</a>}
                            description={`Completed on ${item.date}`}
                        />
                        <Row gutter={16} style={{ width: '50%' }}>
                            <Col span={8}>
                                <Statistic title="Score" value={item.score} suffix="%" />
                            </Col>
                            <Col span={8}>
                                <Statistic title="AP Score" value={item.apScore} suffix="/ 5" />
                            </Col>
                            <Col span={8}>
                                <Statistic title="Progress" value={item.progress} suffix="%" />
                            </Col>
                        </Row>
                    </List.Item>
                )}
            />
        </Card>
    )
};

export default CardAnalytics;