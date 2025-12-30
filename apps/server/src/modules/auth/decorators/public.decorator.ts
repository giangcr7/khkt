import { SetMetadata } from '@nestjs/common';

// Key này dùng để đánh dấu, bạn có thể đặt là 'isPublic' hoặc bất cứ chuỗi nào
export const IS_PUBLIC_KEY = 'isPublic';

export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);