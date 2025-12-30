import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Đang bắt đầu khởi tạo dữ liệu mẫu (Seeding)...');

    // 1. Tạo mật khẩu chung cho tất cả (đỡ phải nhớ nhiều)
    const salt = await bcrypt.genSalt(10);
    const password = await bcrypt.hash('123456', salt); // Pass là 123456

    // 2. Tạo Admin
    const admin = await prisma.user.upsert({
        where: { email: 'admin@school.edu.vn' },
        update: {}, // Nếu có rồi thì thôi không làm gì
        create: {
            email: 'admin@school.edu.vn',
            fullName: 'Quản Trị Viên',
            password: password,
            role: Role.ADMIN, // Quyền Admin
        },
    });

    // 3. Tạo Giảng viên
    const lecturer = await prisma.user.upsert({
        where: { email: 'gv@school.edu.vn' },
        update: {},
        create: {
            email: 'gv@school.edu.vn',
            fullName: 'Thầy Nguyễn Văn Giảng',
            password: password,
            role: Role.LECTURER, // Quyền Giảng viên
        },
    });

    // 4. Tạo Sinh viên
    const student = await prisma.user.upsert({
        where: { email: 'sv@school.edu.vn' },
        update: {},
        create: {
            email: 'sv@school.edu.vn',
            fullName: 'Em Sinh Viên A',
            password: password,
            role: Role.STUDENT, // Quyền Sinh viên
        },
    });

    console.log({ admin, lecturer, student });
    console.log('✅ Seeding thành công!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });