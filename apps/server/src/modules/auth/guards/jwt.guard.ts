// src/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    constructor(private reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        // 1. Kiểm tra xem route này có gắn nhãn @Public không
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // 2. Nếu có Public -> Cho phép truy cập ngay (return true)
        if (isPublic) {
            return true;
        }

        // 3. Nếu không -> Gọi logic kiểm tra Token mặc định của Passport
        return super.canActivate(context);
    }
}