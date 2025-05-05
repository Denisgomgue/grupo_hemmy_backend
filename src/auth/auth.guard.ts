import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { JwtService } from "@nestjs/jwt";
import { jwtConstants } from "./constants";
import { IS_PUBLIC_KEY } from "./decoratos/public.decorator";
import { IS_COOKIE_AUTH_BASED } from "./decoratos/cookie-auth.decorator";
import { UserService } from "src/user/user.service";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private reflector: Reflector,
    private usersService: UserService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const isCookieAuthBased = this.reflector.getAllAndOverride<boolean>(IS_COOKIE_AUTH_BASED, [
      context.getHandler(),
      context.getClass(),
    ]);

    const request = context.switchToHttp().getRequest();

    // Si es autenticación basada en cookies, buscar el token en la cookie
    const token = isCookieAuthBased
      ? this.extractTokenFromCookie(request, 'laiux_erp_auth') || this.extractTokenFromHeader(request)
      : this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('No se encontró un token válido');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: jwtConstants.secret,
      });

      const user = await this.usersService.findOne(payload.sub);

      if (!user) {
        throw new UnauthorizedException('Usuario no encontrado');
      }

      // Asignar el payload al objeto `request`
      request['user'] = payload;
    } catch {
      throw new UnauthorizedException('Token inválido o expirado');
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    //@ts-ignore
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: any, cookieName: string): string | undefined {
    const cookies = request.cookies;
    return cookies?.[cookieName];
  }
}
