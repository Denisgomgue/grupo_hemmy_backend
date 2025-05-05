import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserService } from 'src/user/user.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UserService,
    private jwtService: JwtService,
  ) { }

  async signIn(emailOrUsername: string, pass: string): Promise<any> {

    let user = await this.usersService.findByEmail(emailOrUsername)
    
    if (!user) {
      user = await this.usersService.findByUsername(emailOrUsername)
    }

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('User is inactive');
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    if (!bcrypt.compareSync(pass, user.password)) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.id, email: user.email, username: user.username };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async profile(id: number) {
    const user = await this.usersService.findOneWithProfileAndPermissions(id);
  
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
  
    return {
      id: user.id,
      name: user.name,
      surname: user.surname,
      email: user.email,
      username: user.username,
      phone: user.phone,
      isActive: user.isActive,
      role: {
        id: user.role?.id,
        name: user.role?.name,
        description: user.role?.description,
        allowAll: user.role?.allowAll,
        isPublic: user.role?.isPublic,
        role_has_permissions: user.role?.role_has_permissions?.map((roleHasPermission) => ({
          id: roleHasPermission.id,
          name: roleHasPermission.name,
          routeCode: roleHasPermission.routeCode,
          actions: roleHasPermission.actions,
          restrictions: roleHasPermission.restrictions,
          isSubRoute: roleHasPermission.isSubRoute,
          permission: {
            id: roleHasPermission.permission.id,
            name: roleHasPermission.permission.name,
            routeCode: roleHasPermission.permission.routeCode,
            actions: roleHasPermission.permission.actions,
            restrictions: roleHasPermission.permission.restrictions,
            isSubRoute: roleHasPermission.permission.isSubRoute,
          },
        })),
      },
    };
  }
}
