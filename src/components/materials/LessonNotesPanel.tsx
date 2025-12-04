import { useEffect, useState } from "react";
import { Modal, message } from "antd";
import useNotes from "~/hooks/useNotes";
import type { Lesson } from "~/types/lesson";
import type { Note } from "~/types/note";

interface LessonNotesPanelProps {
  lesson: Lesson | null;
  userId?: string | null;
  isActive: boolean;
}

const LessonNotesPanel: React.FC<LessonNotesPanelProps> = ({
  lesson,
  userId,
  isActive,
}) => {
  const {
    loading: notesLoading,
    error: notesError,
    notes,
    fetchNotesByLessonAndUser,
    createNote,
    updateNote,
    deleteNote,
  } = useNotes();

  const [noteContent, setNoteContent] = useState("");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState("");
  const [noteSubmitting, setNoteSubmitting] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Fetch notes only when tab is active
  useEffect(() => {
    if (!isActive) {
      setNoteContent("");
      setEditingNoteId(null);
      setEditingValue("");
      return;
    }

    if (lesson?.id && userId) {
      fetchNotesByLessonAndUser(lesson.id, userId);
    }
  }, [isActive, lesson?.id, userId, fetchNotesByLessonAndUser]);

  // Sync textarea value with existing note (BE allows max 1 note per lesson/user)
  useEffect(() => {
    if (!isActive) return;
    if (editingNoteId) return;
    if (notes.length === 0) return;

    const first = notes[0];
    setNoteContent(String(first.description ?? ""));
  }, [isActive, notes, editingNoteId]);

  const handleSaveNote = async () => {
    if (!lesson?.id || !userId) {
      message.error("Không xác định được bài học hoặc người dùng.");
      return;
    }

    const trimmed = noteContent.trim();
    if (!trimmed) {
      message.warning("Nội dung ghi chú không được để trống.");
      return;
    }

    setNoteSubmitting(true);

    const existing = notes[0];
    if (existing) {
      const updated = await updateNote(existing.id, { description: trimmed });
      if (updated) {
        message.success("Đã cập nhật ghi chú.");
      }
      setNoteSubmitting(false);
      return;
    }

    const created = await createNote({
      description: trimmed,
      lessonId: lesson.id,
      userId,
    });

    if (created) {
      message.success("Đã lưu ghi chú.");
      setNoteContent("");
    }
    setNoteSubmitting(false);
  };

  const handleStartEdit = (note: Note) => {
    setEditingNoteId(note.id);
    setEditingValue(String(note.description ?? ""));
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditingValue("");
  };

  const handleUpdateNote = async () => {
    if (!editingNoteId) return;
    const trimmed = editingValue.trim();
    if (!trimmed) {
      message.warning("Nội dung ghi chú không được để trống.");
      return;
    }
    setNoteSubmitting(true);
    const result = await updateNote(editingNoteId, { description: trimmed });
    if (result) {
      message.success("Đã cập nhật ghi chú.");
      handleCancelEdit();
    }
    setNoteSubmitting(false);
  };

  const handleDeleteNote = (note: Note) => {
    setNoteToDelete(note);
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;
    setDeleteLoading(true);
    const success = await deleteNote(noteToDelete.id);
    if (success) {
      message.success("Đã xoá ghi chú.");
      if (notes.length <= 1) {
        setNoteContent("");
      }
    }
    setDeleteLoading(false);
    setNoteToDelete(null);
  };

  const cancelDeleteNote = () => {
    if (deleteLoading) return;
    setNoteToDelete(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Ghi chú cho bài học này
        </label>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Tóm tắt ý chính, điều bạn tâm đắc hoặc câu hỏi muốn ghi nhớ..."
          className="w-full min-h-[140px] p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y bg-gray-50"
        />
        {notesError && (
          <p className="mt-1 text-xs text-red-500">
            {notesError}
          </p>
        )}
        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {noteContent.trim().length > 0
              ? `${noteContent.trim().length} ký tự`
              : "Viết vài dòng để lần sau xem lại nhanh hơn."}
          </p>
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={notesLoading || noteSubmitting}
            className="px-4 py-2 bg-blue-600 text-white text-xs md:text-sm rounded-full shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {noteSubmitting ? "Đang lưu..." : "Lưu ghi chú"}
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">
          Ghi chú đã lưu
        </h4>
        {notesLoading && notes.length === 0 ? (
          <p className="text-sm text-gray-500">Đang tải ghi chú...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-gray-500">
            Chưa có ghi chú nào. Hãy bắt đầu bằng việc ghi lại vài ý quan trọng ở trên.
          </p>
        ) : (
          <div className="space-y-3 max-h-72 overflow-y-auto pr-1">
            {notes.map((note) => {
              const isEditing = editingNoteId === note.id;
              return (
                <div
                  key={note.id}
                  className="rounded-lg border border-gray-100 bg-white/60 px-3 py-2"
                >
                  {isEditing ? (
                    <div className="space-y-2">
                      <textarea
                        value={editingValue}
                        onChange={(e) => setEditingValue(e.target.value)}
                        className="w-full min-h-[100px] border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center justify-end gap-2 text-xs">
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="px-3 py-1 rounded-full border border-gray-300 text-gray-600 hover:bg-gray-100"
                          disabled={noteSubmitting}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={handleUpdateNote}
                          disabled={noteSubmitting}
                          className="px-3 py-1 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
                        >
                          {noteSubmitting ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm text-gray-800 whitespace-pre-line">
                        {String(note.description ?? "")}
                      </p>
                      <div className="mt-2 flex items-center justify-between text-[11px] text-gray-400">
                        {note.createdAt && (
                          <span>{new Date(note.createdAt).toLocaleString()}</span>
                        )}
                        <div className="flex items-center gap-3 text-xs">
                          <button
                            type="button"
                            onClick={() => handleStartEdit(note)}
                            className="text-blue-600 hover:underline"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteNote(note)}
                            className="text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Modal
        open={!!noteToDelete}
        onCancel={cancelDeleteNote}
        onOk={confirmDeleteNote}
        okText="Xoá"
        cancelText="Huỷ"
        okButtonProps={{ danger: true, loading: deleteLoading }}
        cancelButtonProps={{ disabled: deleteLoading }}
        destroyOnClose
        centered
        title="Xoá ghi chú"
      >
        <p>Bạn có chắc chắn muốn xoá ghi chú này không?</p>
        {noteToDelete && (
          <p className="mt-2 rounded bg-gray-50 px-3 py-2 text-sm text-gray-600">
            {noteToDelete.description}
          </p>
        )}
      </Modal>
    </div>
  );
};

export default LessonNotesPanel;

