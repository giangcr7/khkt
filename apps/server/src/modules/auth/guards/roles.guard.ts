import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private reflector: Reflector) { }

    canActivate(context: ExecutionContext): boolean {
        // 1. Xem API này yêu cầu Role gì?
        const requiredRoles = this.reflector.getAllAndOverride<Role[]>(ROLES_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        // 2. Nếu không yêu cầu gì -> Cho qua
        if (!requiredRoles) {
            return true;
        }

        // 3. Lấy User từ request (đã có do JwtGuard chạy trước)
        const { user } = context.switchToHttp().getRequest();

        // 4. Kiểm tra User có Role phù hợp không
        const hasRole = requiredRoles.some((role) => user.role === role);

        if (!hasRole) {
            throw new ForbiddenException('Bạn không có quyền (Role) để thực hiện hành động này');
        }

        return true;
    }
}