# Kế Hoạch Triển Khai Tính Năng Chấm Điểm Thủ Công & Yêu Cầu Phúc Khảo

## Tổng Quan
Dự án này triển khai 2 luồng chính:
- **Học sinh**: Yêu cầu chấm lại bài thi kèm lý do
- **Giáo viên**: Quản lý danh sách yêu cầu và giao diện chấm điểm riêng cho câu tự luận (FRQ)

## Giai Đoạn 1: Phía Học Sinh - Yêu cầu chấm lại

### Bước 1.1: Cập nhật src/pages/exam/TestResultPage.tsx
**Mục tiêu**: Thêm nút "Yêu cầu chấm lại" và Modal nhập lý do

**Công việc cần làm:**
- Thêm state quản lý Modal: `isReviewModalOpen`, `reviewReason`
- Sử dụng hook `requestReview` từ `useExamAttempt`
- Thêm nút bấm ở cạnh nút "Retake" trong `ResultSummary` component
- Tạo Modal với TextArea để nhập lý do và Button gửi

## Giai Đoạn 2: Phía Giáo Viên - Quản lý và Chấm điểm

### Bước 2.1: Tạo trang danh sách yêu cầu (src/pages/teachers/TeacherReviewQueuePage.tsx)
**Mục tiêu**: Hiển thị danh sách yêu cầu phúc khảo

**Công việc cần làm:**
- Tạo file mới `src/pages/teachers/TeacherReviewQueuePage.tsx`
- Sử dụng Ant Design Table với các cột:
  - Học sinh (Student)
  - Tên bài thi (Exam name)
  - Thời gian nộp (Submission time)
  - Điểm hiện tại (Current score)
  - Lý do (Reason) - nếu API cung cấp
  - Hành động (Actions): Nút "Chấm ngay"
- Nút "Chấm ngay" điều hướng sang `GradeSubmissionPage` với query param `?mode=review`

### Bước 2.2: Cập nhật Sidebar (src/layout/teachers/TeacherSidebar.tsx)
**Công việc cần làm:**
- Thêm mục mới "Review Queue" vào menu giáo viên

### Bước 2.3: Cập nhật Routing (src/App.tsx)
**Công việc cần làm:**
- Đăng ký route mới: `/teacher/review-queue` -> `TeacherReviewQueuePage`

### Bước 2.4: Nâng cấp trang Chấm điểm (src/pages/teachers/GradeSubmissionPage.tsx)
**Mục tiêu**: Hỗ trợ chế độ lọc chỉ câu tự luận và sử dụng dữ liệu thực tế

**Công việc cần làm:**
- Đọc `attemptId` từ URL params và `mode` từ query params (sử dụng `useSearchParams`)
- Sử dụng `fetchAttemptResult` từ `useExamAttempt` để lấy chi tiết bài làm
- Lọc danh sách câu hỏi: Nếu `mode === 'review'`, chỉ hiển thị câu hỏi có `type === 'frq'`
- Tạo state để lưu điểm và feedback cho từng câu hỏi (mảng `ManualGradeItem[]`)
- Nút "Finish Grading" gọi hàm `gradeAttempt` với payload chứa danh sách điểm mới

## API và Hook Đã Có Sẵn
Từ việc xem code, các thành phần sau đã được implement:

- Hook `useExamAttempt.requestReview`
- Hook `useTeacherReviewQueue`
- Hook `useExamAttempt.gradeAttempt`
- Hook `useExamAttempt.fetchAttemptResult`
- Types: `RequestReviewPayload`, `ManualGradePayload`, `ReviewQueueItem`

## Luồng Dữ Liệu Người Dùng

**Học sinh:**
1. Vào Lịch sử thi -> Chọn bài thi -> Xem chi tiết -> Thấy điểm FRQ thấp
2. Bấm "Yêu cầu chấm lại" -> Nhập lý do
3. Gửi yêu cầu (gọi API requestReview)

**Giáo viên:**
1. Vào Sidebar -> Chọn "Review Queue"
2. Thấy danh sách bài thi yêu cầu chấm lại
3. Bấm "Chấm ngay" -> Chuyển sang trang chấm, chỉ hiện FRQ
4. Đọc câu trả lời, nhập điểm (0-điểm tối đa), nhập nhận xét
