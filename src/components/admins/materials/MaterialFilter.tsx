import React, { useState, useEffect, useCallback } from "react";
import { Input, Select, Button } from "antd";
import { FilterOutlined, SearchOutlined } from "@ant-design/icons";
import type { LearningMaterial } from "~/types/learningMaterial";

interface Props {
  materials: LearningMaterial[];
  setFilteredData: (data: LearningMaterial[]) => void;
}

const MaterialFilter: React.FC<Props> = ({ materials, setFilteredData }) => {
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [authorFilter, setAuthorFilter] = useState("all");

  const uniqueTypes = [...new Set(materials.map((m) => m.typeName))];
  const uniqueSubjects = [...new Set(materials.map((m) => m.subjectName))];
  const uniqueAuthors = [...new Set(materials.map((m) => m.authorName))];

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
      const matchesAuthor =
        authorFilter === "all" || item.authorName === authorFilter;

      return (
        matchesSearch &&
        matchesStatus &&
        matchesType &&
        matchesSubject &&
        matchesAuthor
      );
    });

    setFilteredData(filtered);
  }, [
    materials,
    searchText,
    statusFilter,
    typeFilter,
    subjectFilter,
    authorFilter,
    setFilteredData,
  ]);

  useEffect(() => {
    applyFilters();
  }, [applyFilters]);

  const resetFilters = () => {
    setSearchText("");
    setStatusFilter("all");
    setTypeFilter("all");
    setSubjectFilter("all");
    setAuthorFilter("all");
    setFilteredData(materials);
  };

  return (
    <div className="flex flex-wrap gap-3 mb-4 items-center">
      <Input
        placeholder="Search materials..."
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        allowClear
        className="max-w-md"
        prefix={<SearchOutlined className="text-gray-400" />}
      />

      <FilterOutlined className="text-gray-400" />
      <Select
        value={statusFilter}
        onChange={setStatusFilter}
        className="min-w-32"
        options={[
          { label: "All statuses", value: "all" },
          { label: "Public", value: "public" },
          { label: "Private", value: "private" },
        ]}
      />

      <Select
        value={typeFilter}
        onChange={setTypeFilter}
        className="min-w-32"
        options={[
          { label: "All types", value: "all" },
          ...uniqueTypes.map((type) => ({ label: type, value: type })),
        ]}
      />

      <Select
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

      <Select
        value={authorFilter}
        onChange={setAuthorFilter}
        className="min-w-32"
        options={[
          { label: "All authors", value: "all" },
          ...uniqueAuthors.map((author) => ({
            label: author,
            value: author,
          })),
        ]}
      />

      <Button
        type="text"
        size="small"
        onClick={resetFilters}
        className="text-red-600 hover:bg-red-50 hover:text-red-700"
      >
        Clear filters
      </Button>
    </div>
  );
};

export default MaterialFilter;
