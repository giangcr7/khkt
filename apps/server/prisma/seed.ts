import { PrismaClient, Role, ResourceType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Đang bắt đầu khởi tạo dữ liệu mẫu (Seeding)...');

    // 1. Tạo mật khẩu chung (123456)
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt);

    // 2. Tạo danh sách Lĩnh vực nghiên cứu (Topic)
    console.log('   - Đang tạo danh sách Lĩnh vực...');
    const topics = [
        { name: 'Công nghệ thông tin' },
        { name: 'Kinh tế - Quản trị kinh doanh' },
        { name: 'Ngôn ngữ học & Văn hóa' },
        { name: 'Môi trường & Năng lượng tái tạo' },
        { name: 'Y sinh & Công nghệ thực phẩm' }
    ];

    for (const t of topics) {
        await prisma.topic.upsert({
            where: { name: t.name },
            update: {},
            create: t,
        });
    }

    // 3. Tạo các tài khoản người dùng mẫu
    console.log('   - Đang tạo người dùng mẫu...');
    const users = [
        {
            email: 'admin@school.edu.vn',
            fullName: 'Quản Trị Viên',
            role: Role.ADMIN,
        },
        {
            email: 'gv.nguyenvan@school.edu.vn',
            fullName: 'Thầy Nguyễn Văn Giảng',
            role: Role.LECTURER,
        },
        {
            email: 'gv.tranle@school.edu.vn',
            fullName: 'Cô Trần Lê Hướng Dẫn',
            role: Role.LECTURER,
        },
        {
            email: 'sv.nguyena@school.edu.vn',
            fullName: 'Sinh Viên Nguyễn Văn A',
            role: Role.STUDENT,
        },
        {
            email: 'sv.lethib@school.edu.vn',
            fullName: 'Sinh Viên Lê Thị B',
            role: Role.STUDENT,
        }
    ];

    for (const u of users) {
        await prisma.user.upsert({
            where: { email: u.email },
            update: {},
            create: {
                ...u,
                password: password,
                isActive: true
            },
        });
    }

    // 4. Tạo một vài Tài liệu mẫu (Resources)
    console.log('   - Đang tạo tài liệu mẫu...');
    const resources = [
        {
            title: 'Mẫu đề cương nghiên cứu khoa học',
            description: 'Sử dụng mẫu này để viết thuyết minh đề tài cấp trường',
            fileUrl: 'https://example.com/template_nckh.docx',
            type: ResourceType.TEMPLATE
        },
        {
            title: 'Hướng dẫn trình bày báo cáo (Video)',
            description: 'Video hướng dẫn cách sử dụng Latex hoặc Word để làm báo cáo chuyên nghiệp',
            fileUrl: 'https://youtube.com/watch?v=example',
            type: ResourceType.VIDEO
        }
    ];

    for (const r of resources) {
        await prisma.resource.create({
            data: r
        });
    }

    console.log('✅ Seeding thành công!');
    console.log('   - Tài khoản Admin: admin@school.edu.vn / 123456');
    console.log('   - Tài khoản GV: gv.nguyenvan@school.edu.vn / 123456');
    console.log('   - Tài khoản SV: sv.nguyena@school.edu.vn / 123456');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });