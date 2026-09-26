import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthenticatedUserPayload } from '../domain/auth-response.dto';

export const CurrentUser = createParamDecorator(
  (data: keyof AuthenticatedUserPayload | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user as AuthenticatedUserPayload;

    return data ? user?.[data] : user;
  },
);
