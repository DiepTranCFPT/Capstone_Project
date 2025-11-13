import React, { useCallback, useEffect, useState } from "react";
import { Card, Typography, Button, message } from "antd";
import { ReloadOutlined, PlusOutlined } from "@ant-design/icons";
import useLearningMaterialsAdmin from "~/hooks/useLearningMaterialsAdmin";
import type { LearningMaterial, LearningMaterialQuery } from "~/types/learningMaterial";
import type { Lesson } from "~/types/lesson";
import MaterialFilter from "~/components/admins/materials/MaterialFilter";
import MaterialTable from "~/components/admins/materials/MaterialTable";
import MaterialTypeService, { type MaterialType } from "~/services/materialTypeService";
import SubjectService from "~/services/subjectService";
import type { Subject } from "~/types/subject";
import LessonService from "~/services/LessonService";
import LessonModal, { type LessonFormValues } from "~/components/teachers/Lesson/lessonModal";
import MaterialModal from "~/components/teachers/material/MaterialModal";
import EditModal, { type EditMaterialFormValues } from "~/components/teachers/material/EditModal";


const { Title } = Typography;

const normalizeApiList = <T,>(source: unknown): T[] => {
  if (Array.isArray(source)) {
    return source as T[];
  }
  if (!source || typeof source !== "object") {
    return [];
  }

  const obj = source as Record<string, unknown>;
  const candidateKeys: Array<keyof Record<string, unknown>> = ["data", "items", "content"];

  for (const key of candidateKeys) {
    const value = obj[key];
    if (Array.isArray(value)) {
      return value as T[];
    }
    if (value && typeof value === "object") {
      const nested = normalizeApiList<T>(value);
      if (nested.length > 0) {
        return nested;
      }
    }
  }

  return [];
};

const MaterialManagerPage: React.FC = () => {
  const {
    materials,
    pageInfo,
    loading,
    error,
    fetchAll,
    remove,
    create,
    update,
  } = useLearningMaterialsAdmin();

  const [filteredData, setFilteredData] = useState<LearningMaterial[]>([]);
  const [pageNo, setPageNo] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [serverKeyword, setServerKeyword] = useState("");
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [materialTypes, setMaterialTypes] = useState<MaterialType[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loadingTypes, setLoadingTypes] = useState(false);
  const [loadingSubjects, setLoadingSubjects] = useState(false);
  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [addingLesson, setAddingLesson] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<LearningMaterial | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<LearningMaterial | null>(null);
  const [updating, setUpdating] = useState(false);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [loadingLessons, setLoadingLessons] = useState(false);
  useEffect(() => {
    if (error) {
      message.error(error);
    }
  }, [error]);

  const normalizeLessons = useCallback((source: unknown): Lesson[] => {
    if (Array.isArray(source)) {
      return source as Lesson[];
    }
    if (!source || typeof source !== "object") {
      return [];
    }
    const obj = source as Record<string, unknown>;
    if (Array.isArray(obj.items)) {
      return obj.items as Lesson[];
    }
    if (Array.isArray(obj.data)) {
      return obj.data as Lesson[];
    }
    if (Array.isArray(obj.content)) {
      return obj.content as Lesson[];
    }
    return [];
  }, []);

  const reloadMaterials = useCallback(
    async (override?: LearningMaterialQuery) => {
      const finalQuery: LearningMaterialQuery = {
        pageNo,
        pageSize,
        keyword: serverKeyword.trim() || undefined,
        ...override,
      };
      await fetchAll(finalQuery);
    },
    [fetchAll, pageNo, pageSize, serverKeyword],
  );

  useEffect(() => {
    reloadMaterials();
  }, [reloadMaterials]);

  useEffect(() => {
    setFilteredData(materials);
  }, [materials]);

  const fetchMaterialTypes = async () => {
    try {
      setLoadingTypes(true);
      const response = await MaterialTypeService.getAll({ pageSize: 1000 });
      const list = normalizeApiList<MaterialType>(response.data);
      setMaterialTypes(list);
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
      const list = normalizeApiList<Subject>(response.data);
      setSubjects(list);
    } catch {
      message.error("Failed to load subjects");
    } finally {
      setLoadingSubjects(false);
    }
  };

  useEffect(() => {
    if (isAddOpen || isEditOpen) {
      fetchMaterialTypes();
      fetchSubjects();
    }
  }, [isAddOpen, isEditOpen]);

  const handleDelete = async (id: string) => {
    try {
      await remove(id);
      await reloadMaterials();
      message.success("Material deleted successfully!");
    } catch {
      message.error("Failed to delete material!");
    }
  };

  const fetchLessonsByMaterial = useCallback(
    async (materialId: string) => {
      try {
        setLoadingLessons(true);
        const res = await LessonService.getByLearningMaterial(materialId);
        setLessons(normalizeLessons(res.data.data));
      } catch (error) {
        console.error("Failed to fetch lessons:", error);
        message.error("Failed to load lessons for this material.");
        setLessons([]);
      } finally {
        setLoadingLessons(false);
      }
    },
    [normalizeLessons],
  );

  const handleAddLesson = useCallback(
    (material: LearningMaterial) => {
      setSelectedMaterial(material);
      void fetchLessonsByMaterial(material.id);
      setIsLessonModalOpen(true);
    },
    [fetchLessonsByMaterial],
  );

  const handleCloseLessonModal = useCallback(() => {
    setIsLessonModalOpen(false);
    setSelectedMaterial(null);
    setLessons([]);
  }, []);

  const handleCreateLesson = useCallback(
    async (values: LessonFormValues) => {
      if (!selectedMaterial) {
        message.error("Learning material not found.");
        return;
      }

      try {
        setAddingLesson(true);
        await LessonService.create({
          ...values,
          learningMaterialId: selectedMaterial.id,
        });
        message.success("Lesson created successfully!");
        const refreshed = await LessonService.getByLearningMaterial(selectedMaterial.id);
        setLessons(normalizeLessons(refreshed.data.data));
      } catch (error: unknown) {
        message.error("Failed to create lesson!");
        console.error("Create lesson error:", error);
      } finally {
        setAddingLesson(false);
      }
    },
    [normalizeLessons, selectedMaterial],
  );

  const applyServerSearch = useCallback(
    (keyword: string) => {
      const normalizedKeyword = keyword.trim();
      setPageNo(0);
      setServerKeyword(normalizedKeyword);
    },
    [],
  );

  const openAddModal = () => {
    setIsAddOpen(true);
  };

  const handleEdit = useCallback((material: LearningMaterial) => {
    setEditingMaterial(material);
    setIsEditOpen(true);
  }, []);

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
              onClick={() => {
                void reloadMaterials();
              }}
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
          total={pageInfo?.totalElements ?? pageInfo?.totalElement ?? materials.length}
          pageNo={pageNo}
          pageSize={pageSize}
          setPageNo={setPageNo}
          setPageSize={setPageSize}
          onDelete={handleDelete}
          onAddLesson={handleAddLesson}
          onEdit={handleEdit}
        />

        <MaterialModal
          open={isAddOpen}
          loading={creating}
          materialTypes={materialTypes}
          subjects={subjects}
          loadingTypes={loadingTypes}
          loadingSubjects={loadingSubjects}
          onCancel={() => setIsAddOpen(false)}
          onSubmit={async (values) => {
            try {
              setCreating(true);
              await create(values);
              message.success("Material created successfully!");
              await reloadMaterials({ pageNo: 0 });
              setPageNo(0);
              setIsAddOpen(false);
            } catch {
              message.error("Failed to create material!");
            } finally {
              setCreating(false);
            }
          }}
        />

        <LessonModal
          open={isLessonModalOpen}
          material={selectedMaterial}
          loadingLessons={loadingLessons}
          lessons={lessons}
          onCancel={handleCloseLessonModal}
          onCreateLesson={handleCreateLesson}
          creating={addingLesson}
        />

        <EditModal
          open={isEditOpen}
          loading={updating}
          material={editingMaterial}
          materialTypes={materialTypes}
          subjects={subjects}
          loadingTypes={loadingTypes}
          loadingSubjects={loadingSubjects}
          onCancel={() => {
            setIsEditOpen(false);
            setEditingMaterial(null);
          }}
          onSubmit={async (values: EditMaterialFormValues) => {
            if (!editingMaterial) {
              message.error("Material not found.");
              return;
            }

            try {
              setUpdating(true);
              await update(editingMaterial.id, values);
              message.success("Material updated successfully!");
              await reloadMaterials();
              setIsEditOpen(false);
              setEditingMaterial(null);
            } catch {
              message.error("Failed to update material!");
            } finally {
              setUpdating(false);
            }
          }}
        />
      </Card>
    </div>
  );
};

export default MaterialManagerPage;
