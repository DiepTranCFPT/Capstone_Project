import React, { useState, useEffect } from 'react';
import { Calendar, Card, Button, Modal, TimePicker, message, List, Tag, Space } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';

interface TimeSlot {
    startTime: string; // HH:mm format
    endTime: string;   // HH:mm format
    isBooked: boolean;
}

interface AvailabilitySlot {
    id: string;
    date: string; // YYYY-MM-DD
    timeSlots: TimeSlot[];
}

const TeacherAvailabilityPage: React.FC = () => {
    const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);
    const [availability, setAvailability] = useState<AvailabilitySlot[]>([]);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [selectedSlots, setSelectedSlots] = useState<AvailabilitySlot | null>(null);
    const [editingSlots, setEditingSlots] = useState<TimeSlot[]>([]);

    useEffect(() => {
        // Mock data - in real app, this would fetch from API
        const mockAvailability = [
            {
                id: '1',
                date: '2025-11-25',
                timeSlots: [
                    { startTime: '10:00', endTime: '11:00', isBooked: false },
                    { startTime: '14:00', endTime: '15:00', isBooked: true },
                    { startTime: '16:00', endTime: '17:00', isBooked: false },
                ]
            },
            {
                id: '2',
                date: '2025-11-26',
                timeSlots: [
                    { startTime: '09:00', endTime: '10:00', isBooked: false },
                    { startTime: '13:00', endTime: '14:00', isBooked: false },
                ]
            }
        ];
        setAvailability(mockAvailability);
    }, []);

    const onDateSelect = (date: Dayjs) => {
        setSelectedDate(date);
        const dateStr = date.format('YYYY-MM-DD');
        const existingSlots = availability.find(slot => slot.date === dateStr);
        if (existingSlots) {
            setSelectedSlots(existingSlots);
            setEditingSlots([...existingSlots.timeSlots]);
        } else {
            setSelectedSlots(null);
            setEditingSlots([]);
        }
        setIsModalVisible(true);
    };

    const handleSaveAvailability = () => {
        const dateStr = selectedDate?.format('YYYY-MM-DD');
        if (!dateStr) return;

        const updatedAvailability = availability.filter(slot => slot.date !== dateStr);
        if (editingSlots.length > 0) {
            updatedAvailability.push({
                id: selectedSlots?.id || Date.now().toString(),
                date: dateStr,
                timeSlots: editingSlots
            });
        }

        setAvailability(updatedAvailability);
        message.success('Availability updated successfully!');
        setIsModalVisible(false);
    };

    const addTimeSlot = () => {
        setEditingSlots([...editingSlots, { startTime: '09:00', endTime: '10:00', isBooked: false }]);
    };

    const updateTimeSlot = (index: number, field: 'startTime' | 'endTime', value: string) => {
        const updatedSlots = [...editingSlots];
        updatedSlots[index][field] = value;
        setEditingSlots(updatedSlots);
    };

    const removeTimeSlot = (index: number) => {
        setEditingSlots(editingSlots.filter((_, i) => i !== index));
    };

    const dateCellRender = (date: Dayjs) => {
        const dateStr = date.format('YYYY-MM-DD');
        const daySlots = availability.find(slot => slot.date === dateStr);
        if (daySlots && daySlots.timeSlots.length > 0) {
            const availableCount = daySlots.timeSlots.filter(slot => !slot.isBooked).length;
            return (
                <div className="text-center">
                    <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {availableCount} available
                    </div>
                </div>
            );
        }
        return null;
    };

    return (
        <div className="container mx-auto p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl font-bold">Manage Availability</h1>
                    <Button
                        type="primary"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            setSelectedDate(dayjs());
                            setSelectedSlots(null);
                            setEditingSlots([]);
                            setIsModalVisible(true);
                        }}
                    >
                        Add Availability
                    </Button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Calendar */}
                    <div className="lg:col-span-2">
                        <Card title="Calendar">
                            <Calendar
                                dateCellRender={dateCellRender}
                                onSelect={onDateSelect}
                                className="w-full"
                            />
                        </Card>
                    </div>

                    {/* Quick Stats */}
                    <div className="space-y-4">
                        <Card title="This Week">
                            <div className="space-y-2">
                                {Array.from({ length: 7 }, (_, i) => {
                                    const date = dayjs().add(i, 'day');
                                    const dateStr = date.format('YYYY-MM-DD');
                                    const daySlots = availability.find(slot => slot.date === dateStr);
                                    const available = daySlots ? daySlots.timeSlots.filter(s => !s.isBooked).length : 0;

                                    return (
                                        <div key={i} className="flex justify-between items-center">
                                            <span className="text-sm capitalize">
                                                {date.format('ddd')} ({available})
                                            </span>
                                            {available > 0 && (
                                                <Tag color="green">{available} slots</Tag>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </Card>

                        <Card title="Quick Actions">
                            <Space direction="vertical" className="w-full">
                                <Button block type="default">
                                    Copy previous week schedule
                                </Button>
                                <Button block type="default">
                                    Set recurring weekly availability
                                </Button>
                            </Space>
                        </Card>
                    </div>
                </div>

                {/* Time Slot Modal */}
                <Modal
                    title={`Manage Availability for ${selectedDate?.format('MMMM D, YYYY')}`}
                    open={isModalVisible}
                    onOk={handleSaveAvailability}
                    onCancel={() => setIsModalVisible(false)}
                    width={600}
                >
                    <div className="py-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-semibold">Time Slots</h3>
                            <Button icon={<PlusOutlined />} onClick={addTimeSlot}>
                                Add Slot
                            </Button>
                        </div>

                        <List
                            dataSource={editingSlots}
                            renderItem={(slot, index) => (
                                <List.Item
                                    actions={[
                                        <Button
                                            key="delete"
                                            icon={<DeleteOutlined />}
                                            danger
                                            onClick={() => removeTimeSlot(index)}
                                        />
                                    ]}
                                >
                                    <div className="flex items-center space-x-3">
                                        <TimePicker
                                            value={dayjs(`1970-01-01 ${slot.startTime}`, 'YYYY-MM-DD HH:mm')}
                                            format="HH:mm"
                                            onChange={(time) => updateTimeSlot(index, 'startTime', time ? time.format('HH:mm') : '')}
                                        />
                                        <span className="mx-2">-</span>
                                        <TimePicker
                                            value={dayjs(`1970-01-01 ${slot.endTime}`, 'YYYY-MM-DD HH:mm')}
                                            format="HH:mm"
                                            onChange={(time) => updateTimeSlot(index, 'endTime', time ? time.format('HH:mm') : '')}
                                        />
                                        {slot.isBooked && <Tag color="red">Booked</Tag>}
                                    </div>
                                </List.Item>
                            )}
                        />

                        {editingSlots.length === 0 && (
                            <div className="text-center text-gray-500 py-8">
                                No time slots scheduled for this day. Click "Add Slot" to create availability.
                            </div>
                        )}
                    </div>
                </Modal>
            </div>
        </div>
    );
};

export default TeacherAvailabilityPage;
