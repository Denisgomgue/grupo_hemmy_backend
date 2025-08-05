export class CreatePermissionDto {
    name: string;
    displayName?: string;
    routeCode: string;
    actions?: string[];
    restrictions?: string[];
    isSubRoute?: boolean;
}
