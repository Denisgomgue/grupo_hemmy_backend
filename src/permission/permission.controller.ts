import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PermissionsService } from './permission.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';

@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) { }

  @Post()
  create(@Body() createPermissionDto: CreatePermissionDto) {
    return this.permissionsService.create(createPermissionDto);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get('summary')
  getSummary() {
    return this.permissionsService.getSummary();
  }

  // Nuevo endpoint para obtener permisos por ID de recurso
  @Get('resource/:resourceId')
  findByResourceId(@Param('resourceId') resourceId: string) {
    return this.permissionsService.findByResourceId(+resourceId);
  }

  // Nuevo endpoint para obtener permisos por routeCode de recurso
  @Get('resource/route/:routeCode')
  findByResourceRouteCode(@Param('routeCode') routeCode: string) {
    return this.permissionsService.findByResourceRouteCode(routeCode);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePermissionDto: UpdatePermissionDto) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  // Nuevo endpoint para actualizar módulos masivamente
  @Patch('module/:routeCode')
  updateModule(
    @Param('routeCode') routeCode: string,
    @Body() updateData: { newRouteCode: string; newDisplayName: string; newActions?: string[] }
  ) {
    return this.permissionsService.updateModule(
      routeCode,
      updateData.newRouteCode,
      updateData.newDisplayName,
      updateData.newActions
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}