import React, { useState, useMemo } from 'react';
import { Modal, Input, Button, Typography, Divider } from 'antd';
import { toast } from '~/components/common/Toast';
import useMomoPayment from '~/hooks/useMomoPayment';
import type { ChildInfo } from '~/types/parent';
import type { CreatePaymentResponse } from '~/types/momoPayment';
import { FaWallet } from 'react-icons/fa';

const { Text, Title } = Typography;
const { TextArea } = Input;

const quickAmounts = [200_000, 500_000, 1_000_000, 2_000_000];

interface AddCreditsModalProps {
  open: boolean;
  onCancel: () => void;
  child: ChildInfo | null;
}

const AddCreditsModal: React.FC<AddCreditsModalProps> = ({ open, onCancel, child }) => {
  const { createPayment, loading, error } = useMomoPayment();
  const [amount, setAmount] = useState<number>(500_000);

  const formatAmount = (value: number) =>
    new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
      maximumFractionDigits: 0,
    }).format(value);

  const generateId = () => `${Date.now()}${Math.floor(Math.random() * 1000)}`;

  const defaultNote = useMemo(() => {
    if (child) {
      return `Top up wallet for ${child.studentName}`;
    }
    return 'Top up AP Wallet';
  }, [child]);

  const handleSubmit = async () => {
    if (!child) {
      toast.error('Student information is missing.');
      return;
    }

    if (!amount || amount < 1_000) {
      toast.error('Minimum top-up amount is 1,000 VND.');
      return;
    }

    const orderId = `APWALLET_${generateId()}`;
    const requestId = `REQ_${generateId()}`;

    const res = await createPayment({
      amount,
      orderId,
      requestId,
      orderType: 'AP_WALLET',
      orderInfo: defaultNote,
      extraData: JSON.stringify({
        studentId: child.studentId,
        studentEmail: child.email,
        channel: 'PARENT_TOPUP',
        timestamp: Date.now(),
      }),
    });

    if (!res) {
      toast.error('Unable to create top-up request, please try again.');
      return;
    }

    const successCodes = [0, 1000, '0', '1000'];
    const responseData = (res.data || {}) as CreatePaymentResponse;
    const rawResultCode = responseData.resultCode;
    const rawMessage = responseData.message || res.message;
    const payUrl = responseData.payUrl || (res as unknown as { payUrl?: string }).payUrl;

    const isSuccess =
      successCodes.includes(res.code as never) ||
      successCodes.includes(rawResultCode as never) ||
      /success/gi.test(rawMessage || '');

    if (isSuccess && payUrl) {
      toast.success('Redirecting to MoMo payment gateway...');
      window.location.assign(payUrl);
    } else {
      toast.error(res.message || 'Failed to create top-up request.');
    }
  };

  const handleCancel = () => {
    setAmount(500_000);
    onCancel();
  };

  if (!child) return null;

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={600}
      title={
        <div className="flex items-center gap-3">
          <FaWallet className="text-teal-500" />
          <Title level={4} className="mb-0">
            Add Credits for {child.studentName}
          </Title>
        </div>
      }
    >
      <div className="space-y-6 py-4">
        {/* Student Info */}
        <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
          <Text type="secondary" className="text-sm">
            Student Information
          </Text>
          <div className="mt-2">
            <Text strong>{child.studentName}</Text>
            <br />
            <Text type="secondary" className="text-xs">
              {child.email}
            </Text>
          </div>
        </div>

        {/* Amount Input */}
        <div>
          <Text strong className="block mb-2">
            Amount to top up
          </Text>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <Input
              type="number"
              min={10000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="flex-1"
              placeholder="Enter amount (VND)"
              size="large"
            />
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-lg font-bold text-slate-900 sm:min-w-[140px]">
              {formatAmount(amount || 0)}
            </div>
          </div>
        </div>

        {/* Quick Amount Buttons */}
        <div>
          <Text type="secondary" className="text-sm">
            Quick select
          </Text>
          <div className="mt-2 flex flex-wrap gap-2">
            {quickAmounts.map((value) => (
              <Button
                key={value}
                type={amount === value ? 'primary' : 'default'}
                onClick={() => setAmount(value)}
                className={
                  amount === value
                    ? 'border-teal-400 bg-teal-50 text-teal-600'
                    : 'border-slate-200 text-slate-500 hover:border-teal-200 hover:text-teal-500'
                }
              >
                {formatAmount(value)}
              </Button>
            ))}
          </div>
        </div>

        {/* Note */}
        <div>
          <Text strong className="block mb-2">
            Note (optional)
          </Text>
          <TextArea
            value={defaultNote}
            rows={3}
            placeholder={defaultNote}
            className="w-full"
            readOnly
            disabled
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        <Divider className="my-0" />

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <Button onClick={handleCancel} disabled={loading}>
            Cancel
          </Button>
          <Button type="primary" onClick={handleSubmit} loading={loading} size="large">
            Proceed to Payment
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default AddCreditsModal;

