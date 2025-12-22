import { useLocation } from 'react-router-dom';

/**
 * Hook to determine the base path for flashcard routes
 * Returns '/teacher/flashcards' if in teacher layout, otherwise '/flashcards'
 */
export const useFlashcardBasePath = () => {
    const location = useLocation();

    // Check if we're in teacher layout
    const isTeacherLayout = location.pathname.startsWith('/teacher');

    return isTeacherLayout ? '/teacher/flashcards' : '/flashcards';
};

export default useFlashcardBasePath;
