import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import StudentLayout from './layouts/StudentLayout';
import LecturerLayout from './layouts/LecturerLayout';
import AdminLayout from './layouts/AdminLayout';

// Components
import Navbar from './components/Navbar';
import ProtectedRoute from './components/Shared/ProtectedRoute';

// Public Pages
import HomePage from './pages/Home/HomePage';
import LoginPage from './pages/Auth/Login';
import PostDetail from './pages/Home/PostDetail';
import TimelinePage from './pages/Timeline/TimelinePage';
import FAQPage from './pages/FAQ/FAQPage';
import ChatWidget from './components/Shared/ChatWidget';

// Student Pages
import StudentDashboard from './pages/Student/Dashboard';
import MyProjectPage from './pages/Student/MyProject';
import NotificationsPage from './pages/Student/Notifications'; // Đảm bảo đúng đường dẫn file

// Lecturer Pages
import LecturerDashboard from './pages/Lecturer/LecturerDashboard';
import ManageProjects from './pages/Lecturer/ManageProjects';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminProjectManagement from './pages/Admin/ProjectManagement';
import ManageEvents from './pages/Admin/ManageEvents';
import ManageFAQ from './pages/Admin/ManageFAQ';
import ManageNews from './pages/Admin/ManageNews';
import ManageResources from './pages/Admin/ManageResources';
import ManageTopics from './pages/Admin/ManageTopics';
import UserManagement from './pages/Admin/UserManagement';
import RecruitmentList from './pages/Student/RecruitmentList';
import RecruitmentDetailPage from './pages/Student/RecruitmentDetailPage';
import NewsListPage from './pages/NewsListPage';
import ResourcesPage from './pages/Student/Resources';

function App() {
  return (
    <BrowserRouter>
      {/* Navbar luôn hiển thị ở trên cùng */}
      <Navbar />
<ChatWidget />
      <Routes>
        {/* ========================================================== */}
        {/* PUBLIC ROUTES: Bất kỳ ai cũng có thể truy cập */}
        {/* ========================================================== */}
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/resources" element={<ResourcesPage/>} />
        <Route path="/timeline" element={<TimelinePage />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/news" element={<NewsListPage />} />
        {/* ========================================================== */}
        {/* PROTECTED ROUTES: Phải đăng nhập & đúng quyền hạn */}
        {/* ========================================================== */}

        {/* PHÂN HỆ SINH VIÊN */}
        <Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
          <Route path="/student" element={<StudentLayout />}>
            <Route index element={<StudentDashboard />} />
            <Route path="my-project" element={<MyProjectPage />} />
            <Route path="resources" element={<ResourcesPage />} />
           <Route path="notifications" element={<NotificationsPage />} />
           <Route path="recruitment" element={<RecruitmentList />} />
           <Route path="recruitment/:id" element={<RecruitmentDetailPage />} />
          </Route>
        </Route>

        {/* PHÂN HỆ GIẢNG VIÊN */}
        <Route element={<ProtectedRoute allowedRoles={['LECTURER']} />}>
          <Route path="/lecturer" element={<LecturerLayout />}>
            <Route index element={<LecturerDashboard />} />
            <Route path="manage-projects" element={<ManageProjects />} />
          </Route>
        </Route>

        {/* PHÂN HỆ QUẢN TRỊ VIÊN (ADMIN) */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="manage-projects" element={<AdminProjectManagement />} />
            <Route path="manage-events" element={<ManageEvents />} />
            <Route path="manage-faq" element={<ManageFAQ />} />
            <Route path="manage-news" element={<ManageNews />} />
            <Route path="manage-resources" element={<ManageResources />} />
            <Route path="manage-topics" element={<ManageTopics />} />
            <Route path="user-management" element={<UserManagement />} />
          </Route>
        </Route>

        {/* Redirect nếu sai đường dẫn về trang chủ */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;