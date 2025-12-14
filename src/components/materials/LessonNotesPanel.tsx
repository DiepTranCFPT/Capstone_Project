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

  const handleSaveNote = async () => {
    if (!lesson?.id || !userId) {
      message.error("Unable to identify lesson or user.");
      return;
    }

    const trimmed = noteContent.trim();
    if (!trimmed) {
      message.warning("Note content cannot be empty.");
      return;
    }

    setNoteSubmitting(true);

    if (editingNoteId) {
      const updated = await updateNote(editingNoteId, { description: trimmed });
      if (updated) {
        message.success("Note updated.");
        handleCancelEdit();
        await fetchNotesByLessonAndUser(lesson.id, userId);
      }
    } else {
      const created = await createNote({
        description: trimmed,
        lessonId: lesson.id,
        userId,
      });

      if (created) {
        message.success("Note saved.");
        setNoteContent("");
        await fetchNotesByLessonAndUser(lesson.id, userId);
      }
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
      message.warning("Note content cannot be empty.");
      return;
    }
    setNoteSubmitting(true);
    const result = await updateNote(editingNoteId, { description: trimmed });
    if (result) {
      message.success("Note updated.");
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
      message.success("Note deleted.");
    }
    setDeleteLoading(false);
    setNoteToDelete(null);
  };

  const cancelDeleteNote = () => {
    setNoteToDelete(null);
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <label className="block text-sm font-semibold text-gray-800 mb-2">
          Notes for this lesson
        </label>
        <textarea
          value={noteContent}
          onChange={(e) => setNoteContent(e.target.value)}
          placeholder="Summarize main ideas, things you like, or questions you want to remember..."
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
              ? `${noteContent.trim().length} characters`
              : "Write a few lines to review faster next time."}
          </p>
          <button
            type="button"
            onClick={handleSaveNote}
            disabled={notesLoading || noteSubmitting}
            className="px-4 py-2 bg-blue-600 text-white text-xs md:text-sm rounded-full shadow-sm hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {noteSubmitting ? "Saving..." : "Save note"}
          </button>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200">
        <h4 className="text-sm font-semibold text-gray-800 mb-2">
          Saved notes
        </h4>
        {notesLoading && notes.length === 0 ? (
          <p className="text-sm text-gray-500">Loading notes...</p>
        ) : notes.length === 0 ? (
          <p className="text-sm text-gray-500">
            No notes yet. Start by writing down some important ideas above.
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
        okText="Delete"
        cancelText="Cancel"
        okButtonProps={{ danger: true, loading: deleteLoading }}
        cancelButtonProps={{ disabled: deleteLoading }}
        destroyOnClose
        centered
        title="Delete note"
      >
        <p>Are you sure you want to delete this note?</p>
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

