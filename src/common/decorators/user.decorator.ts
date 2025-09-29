import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { UserRole } from "src/entities/user.entity";

export interface UserDecorator {
  userId: number;
  email: string;
  role: UserRole;
}

export const GetUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as UserDecorator;
});