import { PrismaClient, Role, ProjectStatus, MemberRole, ResourceType, PostType, RecruitmentStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('123456', 10);

  // 1. Dọn dẹp dữ liệu cũ (Xóa theo thứ tự để tránh lỗi khóa ngoại)
  await prisma.notification.deleteMany();
  await prisma.projectProgress.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.recruitmentComment.deleteMany();
  await prisma.application.deleteMany();
  await prisma.recruitment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.topic.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.event.deleteMany();
  await prisma.faq.deleteMany();
  await prisma.message.deleteMany();
  await prisma.chatRoom.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.user.deleteMany();

  // 2. Tạo Users mẫu
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

  // 6. Tạo Bài viết & Tin tức (Đã sửa PostType.GUIDE -> PostType.NEWS)
  await prisma.post.createMany({
    data: [
      {
        title: 'Thông báo: Phát động cuộc thi NCKH 2026',
        content: 'Toàn bộ sinh viên đều có quyền đăng ký tham gia cuộc thi cấp trường...',
        type: PostType.ANNOUNCEMENT,
        authorId: admin.id,
      },
      {
        title: 'Hướng dẫn viết thuyết minh đề tài chuẩn ISO',
        content: 'Bài viết chia sẻ chi tiết cách trình bày nội dung nghiên cứu khoa học...',
        type: PostType.NEWS, // Đổi từ GUIDE sang NEWS
        authorId: lecturer1.id,
        topicId: topicIt.id,
      },
    ],
  });

  // 7. Tạo Tài liệu (Resources)
  await prisma.resource.createMany({
    data: [
      { 
        title: 'Mẫu thuyết minh đề tài (.docx)', 
        description: 'Tài liệu hướng dẫn trình bày đề tài NCKH theo chuẩn của Bộ.',
        fileUrl: 'https://res.cloudinary.com/demo/image/upload/sample_file.docx', 
        type: ResourceType.TEMPLATE 
      },
      { 
        title: 'Video hướng dẫn tra cứu tài liệu IEEE', 
        description: 'Các bước để khai thác thư viện số IEEE Xplore hiệu quả.',
        fileUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 
        type: ResourceType.VIDEO 
      },
    ],
  });

  // 8. Tạo Tuyển thành viên (Recruitment)
  await prisma.recruitment.create({
    data: {
      title: 'Tìm 2 bạn mảng IoT cho đề tài Nhà thông minh',
      content: 'Yêu cầu: Biết lập trình cơ bản Arduino, đam mê thiết kế mạch.',
      skills: ['IoT', 'C++', 'Hardware'],
      authorId: student1.id,
      status: RecruitmentStatus.OPEN,
    },
  });

  // 9. Tạo Sự kiện (Timeline)
  await prisma.event.createMany({
    data: [
      {
        title: 'Hạn chót đăng ký đề tài',
        description: 'Sinh viên hoàn thành nộp bản mềm qua hệ thống.',
        startDate: new Date('2026-03-01T00:00:00Z'),
        isImportant: true,
      },
      {
        title: 'Hội nghị sơ kết giai đoạn 1',
        description: 'Báo cáo tiến độ sau 3 tháng triển khai.',
        startDate: new Date('2026-06-15T08:00:00Z'),
        endDate: new Date('2026-06-17T17:00:00Z'),
        isImportant: false,
      },
    ],
  });

  // 10. Tạo FAQ (Hỏi đáp)
  await prisma.faq.createMany({
    data: [
      {
        question: 'NCKH sinh viên có được tính điểm rèn luyện không?',
        answer: 'Có, tùy theo cấp bậc giải thưởng mà sinh viên được cộng từ 5-15 điểm rèn luyện.',
      },
      {
        question: 'Giảng viên ngoài trường có được hướng dẫn không?',
        answer: 'Giảng viên hướng dẫn chính phải là cán bộ thuộc trường, giảng viên ngoài trường có thể làm hướng dẫn phụ.',
      }
    ]
  });

  // 11. Tạo Thông báo mẫu cho Sinh viên
  await prisma.notification.createMany({
    data: [
      {
        userId: student1.id,
        title: 'Đề tài đã được phê duyệt',
        content: 'Chúc mừng! Đề tài Blockchain của bạn đã được phê duyệt.',
        link: '/student/my-project',
        isRead: false,
      },
    ]
  });

  console.log('✅ Đã nạp dữ liệu mẫu sạch sẽ và thành công!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });