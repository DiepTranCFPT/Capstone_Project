import React, { useState } from 'react';
import { Modal, Input, Button, Upload, message, Radio } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import type { UploadProps } from 'antd';

const { TextArea } = Input;

interface CreateGroupModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (values: { name: string, description: string, tags: string, privacy: 'public' | 'private', avatar?: UploadFile }) => void;
};

// Helper function to get base64 for image preview
const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ visible, onClose, onSubmit }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [privacy, setPrivacy] = useState<'public' | 'private'>('public');
    const [fileList, setFileList] = useState<UploadFile[]>([]);
    const [previewOpen, setPreviewOpen] = useState(false);
    const [previewImage, setPreviewImage] = useState('');
    const [previewTitle, setPreviewTitle] = useState('');

    const handleCancelPreview = () => setPreviewOpen(false);

    const handlePreview = async (file: UploadFile) => {
        if (!file.url && !file.preview) {
            file.preview = await getBase64(file.originFileObj as RcFile);
        }
        setPreviewImage(file.url || (file.preview as string));
        setPreviewOpen(true);
        setPreviewTitle(file.name || file.url!.substring(file.url!.lastIndexOf('/') + 1));
    };

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) => setFileList(newFileList);

    const handleSubmit = () => {
        if (!name.trim() || !description.trim()) {
            message.error("Tên nhóm và mô tả là bắt buộc.");
            return;
        }
        onSubmit({
            name,
            description,
            tags,
            privacy,
            avatar: fileList.length > 0 ? fileList[0] : undefined
        });
        // Reset form
        setName('');
        setDescription('');
        setTags('');
        setPrivacy('public');
        setFileList([]);
        onClose();
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Tải lên Avatar</div>
        </div>
    );

    return (
        <>
            <Modal
                title="Tạo Nhóm học tập mới"
                open={visible}
                onCancel={onClose}
                footer={[
                    <Button key="back" onClick={onClose}>
                        Hủy
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSubmit} className="bg-teal-500 hover:bg-teal-600">
                        Tạo Nhóm
                    </Button>,
                ]}
            >
                <div className="flex flex-col gap-4 py-4">
                    <Input
                        placeholder="Tên nhóm (ví dụ: Cùng nhau chinh phục IELTS)"
                        value={name}
                        onChange={e => setName(e.target.value)}
                    />
                    <TextArea
                        rows={4}
                        placeholder="Nhóm này dùng để làm gì?"
                        value={description}
                        onChange={e => setDescription(e.target.value)}
                    />
                    <Input
                        placeholder="Thêm tags, cách nhau bởi dấu phẩy (ví dụ: english,ielts,tips)"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                    />
                    <div>
                        <label className="font-semibold text-gray-700 mr-4">Chế độ:</label>
                        <Radio.Group onChange={e => setPrivacy(e.target.value)} value={privacy}>
                            <Radio value="public">Công khai</Radio>
                            <Radio value="private">Riêng tư</Radio>
                        </Radio.Group>
                    </div>
                    <Upload
                        listType="picture-card"
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}
                        beforeUpload={() => false}
                        maxCount={1}
                        accept="image/*"
                    >
                        {fileList.length >= 1 ? null : uploadButton}
                    </Upload>
                </div>
            </Modal>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancelPreview}>
                <img alt="preview" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default CreateGroupModal;
