export class CreatePermissionDto {
    name: string;
    routeCode: string;
    actions?: string[];
    restrictions?: string[];
    isSubRoute?: boolean;
}
