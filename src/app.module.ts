import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user/entities/user.entity";
import { Sector } from "./sectors/entities/sector.entity";
import { Plan } from "./plans/entities/plan.entity";
import { Client } from "./client/entities/client.entity";
import { UserModule } from "./user/user.module";
import { ClientModule } from "./client/client.module";
import { PlansModule } from "./plans/plans.module";
import { SectorsModule } from "./sectors/sectors.module";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { APP_GUARD } from "@nestjs/core";
import { Service } from "./services/entities/service.entity";
import { ServicesModule } from "./services/services.module";
import { AuthGuard } from "./auth/auth.guard";
import { AuthModule } from "./auth/auth.module";
import { DatabaseSeederModule } from "./database/seeders/database-seeder.module";
import { Role } from "./role/entities/role.entity";
import { Permission } from "./permission/entities/permission.entity";
import { RoleHasPermission } from "./role-has-permissions/entities/role-has-permission.entity";
import { RoleHasPermissionsModule } from "./role-has-permissions/role-has-permissions.module";
import { RoleModule } from "./role/role.module";
import { PermissionModule } from "./permission/permission.module";
import { PaymentsModule } from "./payments/payments.module";
import { Payment } from "./payments/entities/payment.entity";
import { PaymentHistory } from "./payment-history/entities/payment-history.entity";


@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [
        User,
        Client,
        Plan,
        Sector,
        Service,
        Role,
        Permission,
        RoleHasPermission,
        Payment,
        PaymentHistory
      ],
      synchronize: true,
      //migrationsRun: true,
      //logging: true,
      timezone: 'Z',
    }),
    UserModule,
    ClientModule,
    PlansModule,
    SectorsModule,
    ServicesModule,
    AuthModule,
    DatabaseSeederModule,
    RoleHasPermissionsModule,
    RoleModule,
    PermissionModule,
    PaymentsModule

  ],
  controllers: [ AppController ],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule { }