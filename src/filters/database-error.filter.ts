import { ExceptionFilter, Catch, ArgumentsHost, HttpStatus } from '@nestjs/common';
import { Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch(QueryFailedError)
export class DatabaseErrorFilter implements ExceptionFilter {
  catch(exception: QueryFailedError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Error interno del servidor';

    // Manejar error de duplicación
    if (exception.message.includes('Duplicate entry')) {
      status = HttpStatus.CONFLICT;
      if (exception.message.includes('IDX_fb529f57900726838c410fa83d')) {
        message = 'Ya existe un cliente registrado con este DNI';
      } else {
        message = 'Error de duplicación en la base de datos';
      }
    }

    response
      .status(status)
      .json({
        statusCode: status,
        message: message,
        error: exception.name,
      });
  }
} 