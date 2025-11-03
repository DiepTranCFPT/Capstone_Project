import React, { useEffect, useState } from "react";
import { Card, Typography, Button, message } from "antd";
import { ReloadOutlined } from "@ant-design/icons";
import { useLearningMaterialsAdmin } from "~/hooks/useLearningMaterialsAdmin";
import type { LearningMaterial } from "~/types/learningMaterial";
import MaterialFilter from "~/components/admins/materials/MaterialFilter";
import MaterialTable from "~/components/admins/materials/MaterialTable";


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
  } = useLearningMaterialsAdmin();

  const [filteredData, setFilteredData] = useState<LearningMaterial[]>([]);

  useEffect(() => {
    fetchMaterials();
  }, [fetchMaterials]);

  useEffect(() => {
    setFilteredData(materials);
  }, [materials]);

  const handleDelete = async (id: string) => {
    try {
      await deleteMaterial(id);
      message.success("Material deleted successfully!");
    } catch {
      message.error("Failed to delete material!");
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
          <Button
            icon={<ReloadOutlined />}
            onClick={fetchMaterials}
            className="bg-blue-600 hover:bg-blue-700 text-white border-0 shadow-sm"
          >
            Reload
          </Button>
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
      </Card>
    </div>
  );
};

export default MaterialManagerPage;
