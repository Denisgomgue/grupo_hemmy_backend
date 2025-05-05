export class CreateUserDto {
    name?: string;
    surname?: string;
    email: string;
    password: string;
    documentType?: string;
    documentNumber?: string;
    username: string;
    phone?: string;
    roleId?: number;
    isActive?: boolean;
}
