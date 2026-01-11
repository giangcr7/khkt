import { Injectable } from '@nestjs/common';
import * as appRoot from 'app-root-path';
import { ensureDir, writeFile } from 'fs-extra';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UploadService {
    async save(file: Express.Multer.File): Promise<string> {
        // Đường dẫn tuyệt đối đến thư mục uploads ở gốc dự án
        const uploadFolder = join(appRoot.path, 'uploads');

        // Đảm bảo thư mục tồn tại, nếu chưa có sẽ tự tạo
        await ensureDir(uploadFolder);

        // Tạo tên file duy nhất để không bị ghi đè
        const fileName = `${uuidv4()}-${file.originalname}`;

        // Ghi file từ bộ nhớ (buffer) vào ổ đĩa
        await writeFile(join(uploadFolder, fileName), file.buffer);

        // Trả về đường dẫn tương đối để lưu vào Database
        return `/uploads/${fileName}`;
    }
}