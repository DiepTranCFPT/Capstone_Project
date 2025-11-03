import React, { useState, useMemo } from "react";
import {
  Button,
  Table,
  Tag,
  Input,
  Select,
  Space,
  Modal,
  DatePicker,
} from "antd";
import {
  DeleteOutlined,
  EditOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import type { QuestionBankItem, NewQuestion } from "~/types/question";
import type { ColumnsType } from "antd/es/table";
import AddQuestionModal from "~/components/teachers/exam/AddQuestionModal";
import { toast } from "~/components/common/Toast";
import { useQuestionBank } from "~/hooks/useQuestionBank";

const { Option } = Select;

const QuestionBankPage: React.FC = () => {
  // Lấy teacherId (giáo viên hiện tại)
  const teacherId = localStorage.getItem("teacherId") || undefined;

  //  Hook quản lý dữ liệu câu hỏi
  const {
    questions: questionBank,
    loading,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    fetchQuestions,
  } = useQuestionBank(teacherId);

  //  Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<QuestionBankItem | null>(null);

  //  Filter states
  const [searchText, setSearchText] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedSubject, setSelectedSubject] =
    useState<string>("All Subjects");
  const [selectedTopic, setSelectedTopic] = useState<string>("All Topics");
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  //  Đóng modal
  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingQuestion(null);
  };

  //  Mở modal edit
  const handleEdit = (question: QuestionBankItem) => {
    setEditingQuestion(question);
    setIsModalOpen(true);
  };

  //  Xóa câu hỏi
  const handleDelete = (id: string) => {
    Modal.confirm({
      title: "Delete Question",
      content: "Are you sure you want to delete this question?",
      onOk() {
        deleteQuestion(id);
        toast.success("Question deleted successfully!");
      },
    });
  };

  //  Lưu hoặc cập nhật câu hỏi
  const handleSaveNewQuestion = async (newQuestion: NewQuestion) => {
    try {
      if (editingQuestion) {
        // Pass NewQuestion directly - useQuestionBank will transform it to API format
        await updateQuestion(editingQuestion.id, newQuestion);
        toast.success("Question updated successfully!");
        setEditingQuestion(null);
      } else {
        await createQuestion(newQuestion);
        toast.success("Question added successfully!");
      }
      // Only fetch and close modal on success
      await fetchQuestions();
      setIsModalOpen(false);
    } catch (err) {
      console.error("Save question error", err);
      // Don't close modal on error so user can fix and retry
      // Error message is already shown by useQuestionBank hook
    }
  };

  // 🧼 Reset bộ lọc
  const clearFilters = () => {
    setSearchText("");
    setSelectedDifficulty("all");
    setSelectedType("all");
    setSelectedSubject("All Subjects");
    setSelectedTopic("All Topics");
    setDateRange(null);
  };

  // 🔍 Lọc dữ liệu hiển thị
  const filteredData = useMemo(() => {
    return (questionBank || [])
      .filter((q) => {
        if (
          searchText &&
          !q.text.toLowerCase().includes(searchText.toLowerCase())
        )
          return false;
        if (selectedSubject !== "All Subjects" && q.subject !== selectedSubject)
          return false;
        if (selectedDifficulty !== "all" && q.difficulty !== selectedDifficulty)
          return false;
        if (selectedType !== "all" && q.type !== selectedType) return false;
        if (dateRange) {
          const created = new Date(q.createdAt);
          if (
            created < dateRange[0].toDate() ||
            created > dateRange[1].toDate()
          )
            return false;
        }
        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }, [
    questionBank,
    searchText,
    selectedSubject,
    selectedDifficulty,
    selectedType,
    dateRange,
  ]);

  // 🧾 Cấu hình cột bảng
  const columns: ColumnsType<QuestionBankItem> = [
    {
      title: "Question",
      dataIndex: "text",
      key: "text",
      render: (text) => (text ? text.substring(0, 50) + "..." : ""),
    },
    {
      title: "Type",
      dataIndex: "type",
      key: "type",
      render: (type: string) => (
        <Tag color={type === "mcq" ? "blue" : "green"}>
          {type?.toUpperCase()}
        </Tag>
      ),
    },
    { title: "Subject", dataIndex: "subject", key: "subject" },
    {
      title: "Difficulty",
      dataIndex: "difficulty",
      key: "difficulty",
      render: (difficulty: string) => {
        const color =
          difficulty === "easy"
            ? "cyan"
            : difficulty === "medium"
            ? "orange"
            : "red";
        return <Tag color={color}>{difficulty}</Tag>;
      },
    },
    { title: "Created At", dataIndex: "createdAt", key: "createdAt" },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="small">
          <Button type="link" onClick={() => handleEdit(record)}>
            <EditOutlined />
          </Button>
          <Button
            type="link"
            danger
            onClick={() => handleDelete(record.id)}
          >
            <DeleteOutlined />
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Question Bank</h1>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={() => setIsModalOpen(true)}
          style={{ backgroundColor: "#3CBCB2", border: "none" }}
        >
          Add Question
        </Button>
      </div>

      {/* Filter Section */}
      <div className="bg-white p-4 rounded-lg shadow-sm mb-6 flex gap-4 flex-wrap">
        <Input
          placeholder="Search questions"
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
        />
        <Select
          value={selectedSubject}
          onChange={setSelectedSubject}
          className="w-48"
        >
          <Option value="All Subjects">All Subjects</Option>
          <Option value="Biology">Biology</Option>
          <Option value="Mathematics">Mathematics</Option>
          <Option value="Physics">Physics</Option>
          <Option value="History">History</Option>
        </Select>
        <Select
          value={selectedTopic}
          onChange={setSelectedTopic}
          className="w-48"
        >
          <Option value="All Topics">All Topics</Option>
          <Option value="Custom Question">Custom Question</Option>
          <Option value="Cell Structure">Cell Structure</Option>
          <Option value="Mechanics">Mechanics</Option>
          <Option value="Algebra">Algebra</Option>
          <Option value="20th Century History">
            20th Century History
          </Option>
        </Select>
        <Select
          value={selectedDifficulty}
          onChange={setSelectedDifficulty}
          className="w-48"
        >
          <Option value="all">All Difficulties</Option>
          <Option value="easy">Easy</Option>
          <Option value="medium">Medium</Option>
          <Option value="hard">Hard</Option>
        </Select>
        <Select
          value={selectedType}
          onChange={setSelectedType}
          className="w-48"
        >
          <Option value="all">All Types</Option>
          <Option value="mcq">MCQ</Option>
          <Option value="frq">FRQ</Option>
        </Select>
        <DatePicker.RangePicker
          value={dateRange}
          onChange={(dates) => setDateRange(dates as [Dayjs, Dayjs] | null)}
        />
        <Button onClick={clearFilters}>Clear Filters</Button>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        dataSource={filteredData}
        rowKey="id"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      {/* Add/Edit Modal */}
      <AddQuestionModal
        open={isModalOpen}
        onCancel={handleCloseModal}
        onSubmit={handleSaveNewQuestion}
        editingQuestion={editingQuestion}
      />
    </div>
  );
};

export default QuestionBankPage;
