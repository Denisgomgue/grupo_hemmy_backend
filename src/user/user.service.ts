import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Role } from 'src/role/entities/role.entity';

@Injectable()
export class UserService {

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
  ) { }

  async create(createUserDto: CreateUserDto) {
    const { password, roleId, ...data } = createUserDto;

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.usersRepository.create({
      ...data,
      password: hashedPassword,
    });
    if (roleId) {
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!role) throw new Error('Profile not found');
      user.role = role;
    }

    return this.usersRepository.save(user);
  }

  findAll() {
    return this.usersRepository.find();
  }

  findOne(id: number) {
    return this.usersRepository.findOne({
      where: { id },
    });
  }

  async findOneWithProfileAndPermissions(id: number) {
    return this.usersRepository.findOne({
      where: { id },
      relations: [
        'role',
        'role.role_has_permissions',
        'role.role_has_permissions.permission',
      ],
    });
  }

  findByEmail(email: string) {
    return this.usersRepository.findOne({
      where: { email },
    });
  }

  findByUsername(username: string) {
    return this.usersRepository.findOne({
      where: { username },
    });
  }

  async findByEmailAndUpdate(email: string, name: string) {
    return this.usersRepository.findOne({
      where: { email },
    }).then(async (user) => {
      if (user) {
        if (!user.name) {
          await this.usersRepository.update(user.id, { name });
          return user;
        } else {
          return user;
        }
      }
      return null
    });
  }

  async findOrCreate(email: string, name: string) {
    return this.usersRepository.findOne({
      where: { email },
    }).then(async (user) => {
      if (user) {
        if (!user.name) {
          await this.usersRepository.update(user.id, { name });
          return user;
        } else {
          return user;
        }
      };
      return this.usersRepository.save({ email, name });
    });
  }
  
  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new Error(`User with id ${id} not found`);
    }

    Object.assign(user, updateUserDto);

    return this.usersRepository.save(user);
  }

  async assignProfile(userId: number, roleId: number) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    const role = await this.roleRepository.findOne({ where: { id: roleId } });
    if (!user || !role) throw new Error('User or Profile not found');

    user.role = role;
    return this.usersRepository.save(user);
  }

  remove(id: number) {
    return this.usersRepository.delete(id);
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new Error('User not found');

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) throw new Error('Current password is incorrect');

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    await this.usersRepository.save(user);
    return { message: 'Password updated successfully' };
  }
}
