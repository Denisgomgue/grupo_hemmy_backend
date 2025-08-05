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
    try {
      const { password, roleId, ...data } = createUserDto;

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = this.usersRepository.create({
        ...data,
        password: hashedPassword,
      });
      if (roleId) {
        const role = await this.roleRepository.findOne({ where: { id: roleId } });
        if (!role) throw new Error('Role not found');
        user.role = role;
      }

      return await this.usersRepository.save(user);
    } catch (error) {
      console.error('Error creating user:', error);
      throw error;
    }
  }

  async findAll() {
    try {
      return await this.usersRepository.find({
        relations: [ 'role' ],
      });
    } catch (error) {
      console.error('Error finding users:', error);
      throw error;
    }
  }

  async findOne(id: number) {
    try {
      return await this.usersRepository.findOne({
        where: { id },
        relations: [ 'role' ],
      });
    } catch (error) {
      console.error('Error finding user:', error);
      throw error;
    }
  }

  async findOneWithProfileAndPermissions(id: number) {
    try {
      return await this.usersRepository.findOne({
        where: { id },
        relations: [
          'role',
          'role.role_has_permissions',
          'role.role_has_permissions.permission',
        ],
      });
    } catch (error) {
      console.error('Error finding user with permissions:', error);
      throw error;
    }
  }

  async findByEmail(email: string) {
    try {
      return await this.usersRepository.findOne({
        where: { email },
        relations: [ 'role' ],
      });
    } catch (error) {
      console.error('Error finding user by email:', error);
      throw error;
    }
  }

  async findByUsername(username: string) {
    try {
      return await this.usersRepository.findOne({
        where: { username },
        relations: [ 'role' ],
      });
    } catch (error) {
      console.error('Error finding user by username:', error);
      throw error;
    }
  }

  async findByEmailAndUpdate(email: string, name: string) {
    try {
      return await this.usersRepository.findOne({
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
    } catch (error) {
      console.error('Error finding and updating user by email:', error);
      throw error;
    }
  }

  async findOrCreate(email: string, name: string) {
    try {
      return await this.usersRepository.findOne({
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
    } catch (error) {
      console.error('Error finding or creating user:', error);
      throw error;
    }
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    try {
      const user = await this.usersRepository.findOne({
        where: { id },
        relations: [ 'role' ],
      });
      if (!user) {
        throw new Error(`User with id ${id} not found`);
      }

      Object.assign(user, updateUserDto);

      return await this.usersRepository.save(user);
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  async assignProfile(userId: number, roleId: number) {
    try {
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      const role = await this.roleRepository.findOne({ where: { id: roleId } });
      if (!user || !role) throw new Error('User or Role not found');

      user.role = role;
      return await this.usersRepository.save(user);
    } catch (error) {
      console.error('Error assigning profile:', error);
      throw error;
    }
  }

  async remove(id: number) {
    try {
      return await this.usersRepository.delete(id);
    } catch (error) {
      console.error('Error removing user:', error);
      throw error;
    }
  }

  async changePassword(userId: number, currentPassword: string, newPassword: string) {
    try {
      const user = await this.usersRepository.findOne({ where: { id: userId } });
      if (!user) throw new Error('User not found');

      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) throw new Error('Current password is incorrect');

      const hashedNewPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedNewPassword;
      await this.usersRepository.save(user);
      return { message: 'Password updated successfully' };
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  }

  async getSummary() {
    try {
      const users = await this.findAll();

      const summary = {
        total: users.length,
        active: users.filter(user => user.isActive).length,
        inactive: users.filter(user => !user.isActive).length,
        withRole: users.filter(user => user.role).length,
        withoutRole: users.filter(user => !user.role).length,
        verified: users.filter(user => user.email && user.name).length,
        unverified: users.filter(user => !user.email || !user.name).length,
      };

      return summary;
    } catch (error) {
      console.error('Error in getSummary:', error);
      throw error;
    }
  }
}
