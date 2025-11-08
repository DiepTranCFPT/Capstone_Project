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
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import type { Dayjs } from "dayjs";
import type { QuestionBankItem, NewQuestion } from "~/types/question";
import type { ColumnsType } from "antd/es/table";
import AddQuestionModal from "~/components/teachers/exam/AddQuestionModal";
import { toast } from "~/components/common/Toast";
import { useQuestionBank } from "~/hooks/useQuestionBank";
import { useAuth } from "~/hooks/useAuth";

const { Option } = Select;

const QuestionBankPage: React.FC = () => {
  // Lấy teacherId (giáo viên hiện tại) từ auth
  const { user } = useAuth();
  const teacherId = user?.id;
  //  Hook quản lý dữ liệu câu hỏi
  const {
    questions: questionBank,
    loading,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    fetchQuestions,
    fetchByUserId,
    getQuestionById,
  } = useQuestionBank(teacherId);

  const difficultyOptions = useMemo(
    () => [
      { value: "easy", label: "Easy" },
      { value: "medium", label: "Medium" },
      { value: "hard", label: "Hard" },
    ],
    []
  );

  const topicOptions = useMemo(() => {
    const result = new Set<string>();
    (questionBank || []).forEach((question) => {
      if (question.topic) {
        result.add(question.topic);
      }
    });
    return Array.from(result);
  }, [questionBank]);

  //  Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] =
    useState<QuestionBankItem | null>(null);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);

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
  // Note: Fetches full question details to ensure we have all data including expectedAnswer and options
  // Once backend returns full answer data, this will work automatically
  const handleEdit = async (question: QuestionBankItem) => {
    try {
      // Fetch full question details to ensure we have all data including expectedAnswer and options
      const fullQuestion = await getQuestionById(question.id);
      
      if (fullQuestion) {
        // Merge data, prioritizing fullQuestion but keeping question data as fallback
        const normalizedQuestion: QuestionBankItem = {
          id: fullQuestion.id || question.id,
          text: fullQuestion.text || question.text,
          subject: fullQuestion.subject || question.subject,
          topic: fullQuestion.topic || question.topic,
          difficulty: fullQuestion.difficulty || question.difficulty,
          type: fullQuestion.type || question.type,
          createdBy: fullQuestion.createdBy || question.createdBy,
          createdAt: fullQuestion.createdAt || question.createdAt,
          options: fullQuestion.options || question.options,
          expectedAnswer: fullQuestion.expectedAnswer || question.expectedAnswer || "",
          tags: fullQuestion.tags || question.tags,
        };
        setEditingQuestion(normalizedQuestion);
        setIsModalOpen(true);
      } else {
        // Fallback to question from list if getById fails
        setEditingQuestion(question);
        setIsModalOpen(true);
      }
    } catch (error) {
      console.error("Error fetching question details:", error);
      // Fallback to question from list
      setEditingQuestion(question);
      setIsModalOpen(true);
    }
  };

  //  Xóa câu hỏi
  const handleDelete = (id: string) => {
    setQuestionToDelete(id);
    setDeleteConfirmVisible(true);
  };

  const confirmDelete = () => {
    if (questionToDelete) {
      deleteQuestion(questionToDelete);
      toast.success("Question deleted successfully!");
      setDeleteConfirmVisible(false);
      setQuestionToDelete(null);
    }
  };

  const cancelDelete = () => {
    setDeleteConfirmVisible(false);
    setQuestionToDelete(null);
  };

  //  Lưu hoặc cập nhật câu hỏi
  const handleSaveNewQuestion = async (newQuestion: NewQuestion) => {
    try {
      console.log("[QuestionBankPage] Saving question:", newQuestion);
      console.log("[QuestionBankPage] Editing question:", editingQuestion);
      
      if (editingQuestion) {
        // Pass NewQuestion directly - useQuestionBank will transform it to API format
        console.log("[QuestionBankPage] Updating question with ID:", editingQuestion.id);
        await updateQuestion(editingQuestion.id, newQuestion);
        toast.success("Question updated successfully!");
        setEditingQuestion(null);
      } else {
        console.log("[QuestionBankPage] Creating new question");
        await createQuestion(newQuestion);
        toast.success("Question added successfully!");
      }
      // Only fetch and close modal on success
      // Use fetchByUserId if teacherId exists, otherwise fetch all
      if (teacherId) {
        await fetchByUserId(teacherId);
      } else {
        await fetchQuestions();
      }
      setIsModalOpen(false);
    } catch (err) {
      console.error("[QuestionBankPage] Save question error:", err);
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
    const normalizedSearch = searchText.trim().toLowerCase();

    return (questionBank || [])
      .filter((q) => {
        const questionText = (q.text || "").toLowerCase();
        if (normalizedSearch && !questionText.includes(normalizedSearch)) {
          return false;
        }

        const subject = q.subject || "";
        if (selectedSubject !== "All Subjects" && subject !== selectedSubject) {
          return false;
        }

        const difficulty = q.difficulty || "";
        if (
          selectedDifficulty !== "all" &&
          difficulty.toLowerCase() !== selectedDifficulty.toLowerCase()
        ) {
          return false;
        }

        const topic = (q.topic || "").trim();
        if (selectedTopic !== "All Topics" && topic !== selectedTopic) {
          return false;
        }

        const type = q.type || "";
        if (selectedType !== "all" && type !== selectedType) {
          return false;
        }

        if (dateRange) {
          const createdAt = q.createdAt ? new Date(q.createdAt) : null;
          if (!createdAt || Number.isNaN(createdAt.getTime())) {
            return false;
          }

          if (
            createdAt < dateRange[0].toDate() ||
            createdAt > dateRange[1].toDate()
          ) {
            return false;
          }
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
  }, [
    questionBank,
    searchText,
    selectedSubject,
    selectedDifficulty,
    selectedTopic,
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
      title: "Topic",
      dataIndex: "topic",
      key: "topic",
      render: (topic: string | undefined) => topic || "-",
    },
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
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              console.log("Delete button clicked for id:", record.id);
              handleDelete(record.id);
            }}
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
          {topicOptions.map((topic) => (
            <Option key={topic} value={topic}>
              {topic}
            </Option>
          ))}
        </Select>
        <Select
          value={selectedDifficulty}
          onChange={setSelectedDifficulty}
          className="w-48"
        >
          <Option value="all">All Difficulties</Option>
          {difficultyOptions.map((option) => (
            <Option key={option.value} value={option.value}>
              {option.label}
            </Option>
          ))}
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

      {/* Delete Confirmation Modal */}
      <Modal
        open={deleteConfirmVisible}
        onCancel={cancelDelete}
        onOk={confirmDelete}
        title={
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined style={{ color: "#ff4d4f", fontSize: "20px" }} />
            <span>Delete Question</span>
          </div>
        }
        okText="Delete"
        okType="danger"
        cancelText="Cancel"
        centered
      >
        <p>Are you sure you want to delete this question? This action cannot be undone.</p>
      </Modal>
    </div>
  );
};

export default QuestionBankPage;
