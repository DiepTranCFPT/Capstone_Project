import React, { useEffect, useState } from "react";
import { Card, Typography, Button, message, Modal, Form, Input, Switch, Select } from "antd";
import { ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import { useLearningMaterialsAdmin } from "~/hooks/useLearningMaterialsAdmin";
import type { LearningMaterial } from "~/types/learningMaterial";
import MaterialFilter from "~/components/admins/materials/MaterialFilter";
import MaterialTable from "~/components/admins/materials/MaterialTable";
import MaterialTypeService, { type MaterialType } from "~/services/materialTypeService";
import SubjectService from "~/services/subjectService";
import type { Subject } from "~/types/subject";


const { Title } = Typography;

const MaterialManagerPage: React.FC = () => {
  const {
    materials,
    loading,
    total,
    pageNo,
    setPageNo,
    pageSize,
    setPageSize,
    applyServerSearch,
    fetchMaterials,
    deleteMaterial,
    createMaterial,
  } = useLearningMaterialsAdmin();

  const [filteredData, setFilteredData] = useState<LearningMaterial[]>([]);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [form] = Form.useForm();
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  useEffect(() => {
    setFilteredData(materials);
  }, [materials]);

  const fetchMaterialTypes = async () => {
    try {
      setLoadingTypes(true);
      const response = await MaterialTypeService.getAll();
      if (response.data.data) {
        setMaterialTypes(response.data.data || []);
      }
    } catch {
      message.error("Failed to load material types");
    } finally {
      setLoadingTypes(false);
    }
  };

  const fetchSubjects = async () => {
    try {
      setLoadingSubjects(true);
      const response = await SubjectService.getAll({ pageSize: 1000 });
      if (response.data.data) {
        setSubjects(response.data.data?.items || []);
      }
    } catch {
      message.error("Failed to load subjects");
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    if (isAddOpen) {
      fetchMaterialTypes();
      fetchSubjects();
    }
  }, [isAddOpen]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterial(id);
      message.success("Material deleted successfully!");
    } catch {
      message.error("Failed to delete material!");
    }
  };

  const openAddModal = () => {
    form.resetFields();
    form.setFieldsValue({ isPublic: true });
    setIsAddOpen(true);
  };

  const handleCreate = async () => {
    try {
      const values = await form.validateFields();
      setCreating(true);
      await createMaterial(values);
      setIsAddOpen(false);
    } catch {
      // validation or create error already handled
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Card className="shadow-sm border-0">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <Title level={2} className="text-gray-900 mb-1">
              Learning Materials Management
            </Title>
            <p className="text-gray-600 text-sm">
              Manage and filter all learning materials in the system.
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchMaterials}
              className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm"
            >
              Reload
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={openAddModal}
              className="bg-green-600 hover:bg-green-700 border-0 shadow-sm"
              style={{ backgroundColor: "#3CBCB2", border: "none" }}
            >
              Add Material
            </Button>
          </div>
        </div>

        <MaterialFilter 
          materials={materials} 
          setFilteredData={setFilteredData} 
          onSearchKeyword={applyServerSearch}
        />

        <MaterialTable
          loading={loading}
          data={filteredData}
          total={total}
          pageNo={pageNo}
          pageSize={pageSize}
          setPageNo={setPageNo}
          setPageSize={setPageSize}
          onDelete={handleDelete}
        />

        <Modal
          title="Add Material"
          open={isAddOpen}
          onOk={handleCreate}
          confirmLoading={creating}
          onCancel={() => setIsAddOpen(false)}
          okText="Create"
          cancelText="Cancel"
        >
          <Form
            form={form}
            layout="vertical"
            initialValues={{ isPublic: true }}
          >
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: "Please enter title" }]}
            >
              <Input placeholder="Enter title" />
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[{ required: true, message: "Please enter description" }]}
            >
              <Input.TextArea placeholder="Enter description" rows={3} />
            </Form.Item>

            <Form.Item
              label="Content URL"
              name="contentUrl"
              rules={[
                { required: true, message: "Please enter content URL" },
                { type: "url", message: "Please enter a valid URL" },
              ]}
            >
              <Input placeholder="https://..." />
            </Form.Item>

            <Form.Item
              label="Material Type"
              name="typeId"
              rules={[{ required: true, message: "Please select material type" }]}
            >
              <Select
                placeholder="Select material type"
                loading={loadingTypes}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {materialTypes.map((type) => (
                  <Select.Option key={type.id} value={type.id} label={type.name}>
                    {type.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              label="Subject"
              name="subjectId"
              rules={[{ required: true, message: "Please select subject" }]}
            >
              <Select
                placeholder="Select subject"
                loading={loadingSubjects}
                showSearch
                optionFilterProp="label"
                filterOption={(input, option) =>
                  String(option?.label ?? "").toLowerCase().includes(input.toLowerCase())
                }
              >
                {subjects.map((subject) => (
                  <Select.Option key={subject.id} value={subject.id} label={subject.name}>
                    {subject.name}
                  </Select.Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item label="Public" name="isPublic" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Form>
        </Modal>
      </Card>
    </div>
  );
};

export default MaterialManagerPage;
