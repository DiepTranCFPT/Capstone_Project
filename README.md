AP-LMS (Advanced Placement Learning Management System)

AP-LMS là nền tảng quản lý học tập trực tuyến toàn diện, được thiết kế chuyên biệt để hỗ trợ học sinh ôn luyện các chứng chỉ Advanced Placement (AP). Hệ thống kết nối Học sinh, Giáo viên, Phụ huynh học tập trong một môi trường giáo dục tích hợp, hiện đại và thông minh.

# 🌟 Tính năng nổi bật

# 1. Phân quyền người dùng (Role-Based Access)

Hệ thống hỗ trợ 4 vai trò người dùng riêng biệt:

Học sinh (Student): Tham gia khóa học, làm bài thi, xem lộ trình học tập, tương tác với AI Tutor.

Giáo viên (Teacher): Quản lý lớp học, tạo ngân hàng câu hỏi, tạo đề thi, chấm điểm tự luận.

Phụ huynh (Parent): Liên kết tài khoản với con, theo dõi tiến độ học tập và thanh toán học phí.

Quản trị viên (Admin): Quản lý người dùng, duyệt hồ sơ giáo viên, quản lý nội dung hệ thống.

# 2. Hệ thống Thi & Kiểm tra (Testing & Proctoring)

Đa dạng định dạng: Hỗ trợ câu hỏi Trắc nghiệm (MCQ) và Tự luận (FRQ).

Chế độ thi: - Single Exam: Bài thi đơn lẻ theo môn.

Combo Exam: Bài thi tổ hợp nhiều môn.

Practice Mode: Luyện tập dạng Flashcard hoặc Quiz nhanh.

Giám sát thi (Proctoring): - Tự động phát hiện chuyển tab/cửa sổ.

Yêu cầu chế độ toàn màn hình (Fullscreen).

Chặn sao chép/dán (Copy/Paste).

Tự động nộp bài nếu vi phạm quá số lần quy định.

Lưu trữ thông minh: Cơ chế Auto-save và đồng bộ hóa dữ liệu liên tục, đảm bảo không mất bài làm khi rớt mạng.

# 3. Học tập & Tài liệu

Lộ trình học tập (Learning Pathway): Gợi ý lộ trình dựa trên khối lớp và ngành học mục tiêu (CS, Business, Pre-Med, etc.).

Tài liệu học tập: Hỗ trợ video bài giảng (YouTube/Upload) và file PDF.

AI Support: Chatbot hỗ trợ giải đáp thắc mắc và AI gợi ý chấm điểm cho giáo viên.

# 4. Tài chính & Cộng đồng

Ví điện tử (Wallet): Tích hợp cổng thanh toán MoMo, quản lý số dư Token để mua khóa học/đề thi.

Cộng đồng (Community): Diễn đàn thảo luận, nhóm học tập.

Gamification: Bảng xếp hạng (Leaderboard), Thách đấu Quiz (Quiz Battle).

# 🛠️ Công nghệ sử dụng

Dự án được xây dựng trên nền tảng công nghệ hiện đại, tối ưu hóa hiệu năng và trải nghiệm người dùng:

Core Framework

React 18: Thư viện UI chính.

Vite: Build tool tốc độ cao.

TypeScript: Ngôn ngữ lập trình chính, đảm bảo type-safety.

UI & Styling

Ant Design: Hệ thống Design System cho các component phức tạp (Table, Modal, Form).

Tailwind CSS: Utility-first CSS framework giúp tùy biến giao diện nhanh chóng.

Framer Motion: Thư viện Animation mượt mà.

Icons: React Icons, Lucide React.

State Management & Logic

React Context API: Quản lý trạng thái toàn cục (Auth, QuestionBank).

Custom Hooks: Tái sử dụng logic (useAuth, useExamAttempt, useExamProctoring, ...).

Axios: Client HTTP với Interceptors xử lý Token/Refresh Token tự động.

Recharts: Vẽ biểu đồ thống kê trực quan.

Formik + Yup: Quản lý Form và Validate dữ liệu.

React Katex: Hiển thị công thức toán học.

# 🚀 Hướng dẫn cài đặt và chạy dự án

# 1. Yêu cầu tiên quyết

Đảm bảo máy tính của bạn đã cài đặt:

Node.js (Phiên bản v18 trở lên được khuyến nghị)

Trình quản lý gói npm hoặc yarn.

# 2. Cài đặt Dependencies

Mở terminal tại thư mục gốc của dự án và chạy lệnh:

Sử dụng npm
npm install

Hoặc sử dụng yarn
yarn install


# 3. Cấu hình biến môi trường

Tạo file .env tại thư mục gốc của dự án và điền các thông tin cấu hình

VITE_API_URL=your_api_url
VITE_GOOGLE_CLIENT_ID=your_google_client_id
VITE_GOOGLE_REDIRECT_URI=your_google_redirect_uri
VITE_AUTH_URI=your_auth_uri


# 4. Chạy dự án (Development)

Để khởi chạy ứng dụng ở môi trường development:

npm run dev


# 5. Build dự án (Production)

Để đóng gói ứng dụng cho môi trường production:

npm run build


Kết quả build sẽ nằm trong thư mục dist.



Fork dự án.

Tạo branch tính năng mới (git checkout -b feature/TenTinhNang).

Commit thay đổi (git commit -m 'Thêm tính năng XYZ').

Push lên branch (git push origin feature/TenTinhNang).

Tạo Pull Request.
