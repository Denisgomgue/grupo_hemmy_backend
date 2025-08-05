import { Controller, Get, Post, Delete, Param, ParseIntPipe, Query } from '@nestjs/common';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
export class NotificationsController {
    constructor(private readonly notificationsService: NotificationsService) { }

    @Get()
    async getNotifications(@Query('limit') limit?: string) {
        const limitNumber = limit ? parseInt(limit) : 50;
        return await this.notificationsService.getNotifications(undefined, limitNumber);
    }

    @Get('unread-count')
    async getUnreadCount() {
        const count = await this.notificationsService.getUnreadCount();
        return { count };
    }

    @Post(':id/read')
    async markAsRead(@Param('id', ParseIntPipe) id: number) {
        await this.notificationsService.markAsRead(id);
        return { message: 'Notificación marcada como leída' };
    }

    @Post('mark-all-read')
    async markAllAsRead() {
        await this.notificationsService.markAllAsRead();
        return { message: 'Todas las notificaciones marcadas como leídas' };
    }

    @Delete(':id')
    async deleteNotification(@Param('id', ParseIntPipe) id: number) {
        await this.notificationsService.deleteNotification(id);
        return { message: 'Notificación eliminada' };
    }

    @Delete()
    async clearAllNotifications() {
        await this.notificationsService.clearAllNotifications();
        return { message: 'Todas las notificaciones eliminadas' };
    }
} 