import { useEffect, useCallback } from 'react';

/**
 * Hook để hiển thị cảnh báo khi người dùng cố gắng reload/trang trong lúc thi
 */
export const useExamUnloadWarning = (isExamActive: boolean = true) => {
  const handleBeforeUnload = useCallback((event: BeforeUnloadEvent) => {
    if (isExamActive) {
      // Hiển thị cảnh báo mặc định của browser
      event.preventDefault();
      // Một số browser yêu cầu set returnValue
      event.returnValue = 'Bạn có chắc chắn muốn tải lại trang? Tiến độ bài thi sẽ được lưu tự động.';
      return 'Bạn có chắc chắn muốn tải lại trang? Tiến độ bài thi sẽ được lưu tự động.';
    }
  }, [isExamActive]);

  useEffect(() => {
    if (isExamActive) {
      // Thêm event listener cho beforeunload
      window.addEventListener('beforeunload', handleBeforeUnload);

      // Cleanup function
      return () => {
        window.removeEventListener('beforeunload', handleBeforeUnload);
      };
    }
  }, [isExamActive, handleBeforeUnload]);

  return {
    isWarningActive: isExamActive
  };
};
