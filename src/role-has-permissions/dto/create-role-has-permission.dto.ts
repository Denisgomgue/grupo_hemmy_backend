import { IsString, IsArray, IsBoolean, IsOptional, IsNumber } from 'class-validator';

export class CreateRoleHasPermissionDto {
    @IsNumber()
    roleId: number;

    @IsNumber()
    permissionId: number;

    @IsString()
    name: string;

    @IsString()
    routeCode: string;

    @IsArray()
    @IsOptional()
    actions?: string[];

    @IsArray()
    @IsOptional()
    restrictions?: string[];

    @IsBoolean()
    @IsOptional()
    isSubRoute?: boolean;
}
