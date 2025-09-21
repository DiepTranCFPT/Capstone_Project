import React, { useState } from 'react';
import { Modal, Input, Button, Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { RcFile, UploadFile } from 'antd/es/upload/interface';
import type { UploadProps } from 'antd';

const { TextArea } = Input;

interface CreateThreadModalProps {
    visible: boolean;
    onClose: () => void;
    onSubmit: (values: { content: string, tags: string, image?: UploadFile }) => void;
};

const getBase64 = (file: RcFile): Promise<string> =>
    new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = (error) => reject(error);
    });

const CreateThreadModal: React.FC<CreateThreadModalProps> = ({ visible, onClose, onSubmit }) => {
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
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

    const handleChange: UploadProps['onChange'] = ({ fileList: newFileList }) =>
        setFileList(newFileList);

    const handleSubmit = () => {
        if (!content.trim()) {
            message.error("Please enter some content for your thread.");
            return;
        }
        onSubmit({ content, tags, image: fileList.length > 0 ? fileList[0] : undefined });
        // Reset form
        setContent('');
        setTags('');
        setFileList([]);
        onClose();
    };

    const uploadButton = (
        <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>Upload</div>
        </div>
    );


    return (
        <>
            <Modal
                title="Create a New Thread"
                open={visible}
                onCancel={onClose}
                footer={[
                    <Button key="back" onClick={onClose}>
                        Cancel
                    </Button>,
                    <Button key="submit" type="primary" onClick={handleSubmit} className="bg-teal-500 hover:bg-teal-600">
                        Post Thread
                    </Button>,
                ]}
            >
                <div className="flex flex-col gap-4">
                    <TextArea
                        rows={5}
                        placeholder="What's on your mind?"
                        value={content}
                        onChange={e => setContent(e.target.value)}
                    />
                    <Input
                        placeholder="Add tags, separated by commas (e.g., english,ielts,tips)"
                        value={tags}
                        onChange={e => setTags(e.target.value)}
                    />
                    <Upload
                        listType="picture-card" // Thay đổi kiểu hiển thị để có preview thumbnail
                        fileList={fileList}
                        onPreview={handlePreview}
                        onChange={handleChange}
                        beforeUpload={() => false} // Ngăn chặn việc tự động upload
                        maxCount={1}
                        accept="image/*"
                    >
                        {fileList.length >= 1 ? null : uploadButton}
                    </Upload>
                </div>
            </Modal>
            <Modal open={previewOpen} title={previewTitle} footer={null} onCancel={handleCancelPreview}>
                <img alt="example" style={{ width: '100%' }} src={previewImage} />
            </Modal>
        </>
    );
};

export default CreateThreadModal;