import React, { useState, useEffect, useCallback } from "react";
import { Input, Select, Button } from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import type { LearningMaterial } from "~/types/learningMaterial";

interface Props {
  materials: LearningMaterial[];
  setFilteredData: (data: LearningMaterial[]) => void;
  onSearchKeyword?: (keyword: string) => void;
}

const MaterialFilter: React.FC<Props> = ({ materials, setFilteredData, onSearchKeyword }) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");


  const uniqueTypes = [...new Set(materials.map((m) => m.typeName))];
  const uniqueSubjects = [...new Set(materials.map((m) => m.subjectName))];


  // Bọc applyFilters trong useCallback để tránh warning
  const applyFilters = useCallback(() => {
    const filtered = materials.filter((item) => {
      const matchesSearch =
        item.title.toLowerCase().includes(searchText.toLowerCase()) ||
        item.typeName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.subjectName.toLowerCase().includes(searchText.toLowerCase()) ||
        item.authorName.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "public" && item.isPublic) ||
        (statusFilter === "private" && !item.isPublic);

      const matchesType = typeFilter === "all" || item.typeName === typeFilter;
      const matchesSubject =
        subjectFilter === "all" || item.subjectName === subjectFilter;
      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesSubject
      );
    });

    setFilteredData(filtered);
  }, [
    materials,
    searchText,
    statusFilter,
    typeFilter,
    subjectFilter,
    setFilteredData,
  ]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  // Gọi server search nếu prop được truyền vào (debounce 300ms)
  useEffect(() => {
    if (!onSearchKeyword) return;
    const handle = setTimeout(() => onSearchKeyword(searchText.trim()), 300);
    return () => clearTimeout(handle);
  }, [searchText, onSearchKeyword]);

  const resetFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSubjectFilter("all");

    setFilteredData(materials);
    onSearchKeyword?.("");
  };

  return (
    <div className="flex flex-wrap gap-3 mb-4 items-center">
      {/* Search input */}
      <Input
        placeholder="Search materials..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        onPressEnter={() => onSearchKeyword?.(searchText.trim())}
        allowClear
        className="max-w-md"
        prefix={<SearchOutlined className="text-gray-400" />}
      />

      {/* Filter icon and label */}
      <div className="flex items-center gap-2">
        <FilterOutlined className="text-gray-400" />
        <span className="text-sm text-gray-600">Filter by:</span>
      </div>

      {/* Filter by status */}
      <Select
        placeholder="Status"
        value={statusFilter}
        onChange={setStatusFilter}
        className="min-w-32"
        options={[
          { label: "All statuses", value: "all" },
          { label: "Public", value: "public" },
          { label: "Private", value: "private" },
        ]}
      />

      {/* Filter by material type */}
      <Select
        placeholder="Type"
        value={typeFilter}
        onChange={setTypeFilter}
        className="min-w-32"
        options={[
          { label: "All types", value: "all" },
          ...uniqueTypes.map((type) => ({ label: type, value: type })),
        ]}
      />

      {/* Filter by subject */}
      <Select
        placeholder="Subject"
        value={subjectFilter}
        onChange={setSubjectFilter}
        className="min-w-32"
        options={[
          { label: "All subjects", value: "all" },
          ...uniqueSubjects.map((subject) => ({
            label: subject,
            value: subject,
          })),
        ]}
      />



      {/* Reset filters button */}
      {(statusFilter !== "all" ||
        typeFilter !== "all" ||
        subjectFilter !== "all" ||
        searchText) && (
        <Button
          type="text"
          size="small"
          onClick={resetFilters}
          className="text-red-600 hover:bg-red-50 hover:text-red-700"
        >
          Clear filters
        </Button>
      )}

      {/* Thông tin số lượng hiển thị
      <div className="ml-auto text-sm text-gray-500">
        Hiển thị {materials.length} / {total} tài liệu
      </div> */}
    </div>
  );
};

export default MaterialFilter;

