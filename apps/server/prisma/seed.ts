import { PrismaClient, Role, ProjectStatus, MemberRole, ResourceType, PostType, RecruitmentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Xóa dữ liệu cũ (Theo thứ tự để tránh lỗi khóa ngoại)
  await prisma.notification.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.projectProgress.deleteMany();
  await prisma.project.deleteMany();
  await prisma.recruitment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.user.deleteMany();

  // 2. Tạo Users
  const admin = await prisma.user.create({
    data: {
      email: 'admin@school.edu.vn',
      password: hashedPassword,
      fullName: 'Quản trị viên Hệ thống',
      role: Role.ADMIN,
    },
  });

  const lecturer1 = await prisma.user.create({
    data: {
      email: 'gv.nguyenvan@school.edu.vn',
      password: hashedPassword,
      fullName: 'TS. Nguyễn Văn A',
      role: Role.LECTURER,
    },
  });

  const student1 = await prisma.user.create({
    data: {
      email: 'sv.lethib@school.edu.vn',
      password: hashedPassword,
      fullName: 'Lê Thị B',
      role: Role.STUDENT,
    },
  });

  // 3. Tạo Topics (Lĩnh vực)
  const topicIt = await prisma.topic.create({ data: { name: 'Công nghệ thông tin' } });
  const topicAi = await prisma.topic.create({ data: { name: 'Trí tuệ nhân tạo' } });
  const topicEnv = await prisma.topic.create({ data: { name: 'Môi trường & Năng lượng' } });

  // 4. Tạo Đề tài (Projects)
  const project1 = await prisma.project.create({
    data: {
      name: 'Hệ thống quản lý NCKH sinh viên ứng dụng Blockchain',
      description: 'Phát triển nền tảng minh bạch dữ liệu nghiên cứu khoa học.',
      status: ProjectStatus.IN_PROGRESS,
      topicId: topicIt.id,
      progress: 45,
      studentId: student1.id,
      mentorId: lecturer1.id,
    },
  });

  // 5. Tạo Thành viên nhóm
  await prisma.projectMember.create({
    data: {
      projectId: project1.id,
      userId: student1.id,
      role: MemberRole.LEADER,
    },
  });

  // 6. Tạo Tiến độ (Progress Logs)
  await prisma.projectProgress.createMany({
    data: [
      {
        projectId: project1.id,
        title: 'Hoàn thành báo cáo tổng quan',
        content: 'Đã tìm kiếm tài liệu và viết xong chương 1.',
        percent: 20,
      },
      {
        projectId: project1.id,
        title: 'Thiết kế cơ sở dữ liệu',
        content: 'Sơ đồ ERD và cấu trúc PostgreSQL.',
        percent: 45,
      },
    ],
  });

  // 7. Tạo Bài viết & Tin tức
  await prisma.post.createMany({
    data: [
      {
        title: 'Thông báo: Phát động cuộc thi NCKH 2026',
        content: 'Toàn bộ sinh viên đều có quyền đăng ký tham gia...',
        type: PostType.ANNOUNCEMENT,
        authorId: admin.id,
      },
      {
        title: 'Hướng dẫn viết thuyết minh đề tài chuẩn ISO',
        content: 'Bài viết chia sẻ cách trình bày nội dung nghiên cứu...',
        type: PostType.GUIDE,
        authorId: lecturer1.id,
        topicId: topicIt.id,
      },
    ],
  });

  // 8. Tạo Tài liệu (Resources)
  await prisma.resource.createMany({
    data: [
      { title: 'Mẫu thuyết minh đề tài (.docx)', fileUrl: 'https://example.com/form1.docx', type: ResourceType.TEMPLATE },
      { title: 'Video hướng dẫn tra cứu tài liệu IEEE', fileUrl: 'https://youtube.com/watch?v=123', type: ResourceType.VIDEO },
    ],
  });

  // 9. Tạo Tuyển thành viên (Recruitment)
// 9. Tạo Tuyển thành viên (Recruitment)
  await prisma.recruitment.create({
    data: {
      title: 'Tìm 2 bạn mảng IoT cho đề tài Nhà thông minh',
      content: 'Yêu cầu: Biết lập trình Arduino, ESP32.',
      skills: ['IoT', 'C++', 'Hardware'],
      authorId: student1.id, // Chỉ dùng authorId như Schema mới quy định
      status: RecruitmentStatus.OPEN,
    },
  });

  // 10. Tạo Sự kiện (Timeline)
  await prisma.event.createMany({
    data: [
      {
        title: 'Hạn chót đăng ký đề tài',
        startDate: new Date('2026-03-01'),
        isImportant: true,
      },
      {
        title: 'Hội nghị sơ kết giai đoạn 1',
        startDate: new Date('2026-06-15'),
        endDate: new Date('2026-06-17'),
        isImportant: false,
      },
    ],
  });
// 11. Tạo Thông báo mẫu cho Sinh viên
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        title: 'Đề tài đã được phê duyệt',
        content: 'Chúc mừng! Đề tài "Hệ thống quản lý NCKH..." của bạn đã được phê duyệt bởi Admin.',
        link: '/student/my-project', // Link dẫn trực tiếp đến trang đề tài
        isRead: false,
      },
      {
        userId: student1.id,
        title: 'Phản hồi mới từ giảng viên',
        content: 'TS. Nguyễn Văn A vừa để lại nhận xét cho báo cáo tuần của bạn.',
        link: '/student/progress',
        isRead: true,
      }
    ]
  });
  console.log('✅ Đã nạp dữ liệu mẫu thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });