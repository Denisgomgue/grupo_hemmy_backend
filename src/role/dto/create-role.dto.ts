export class CreateRoleDto {
    name: string;
    description?: string;
    allowAll?: boolean;
    isPublic?: boolean;
    role_has_permissions: {
        name: string;
        routeCode: string;
        actions: string[];
        restrictions: string[];
        isSubRoute: boolean;
        permissionId: number;
    }[];
}
