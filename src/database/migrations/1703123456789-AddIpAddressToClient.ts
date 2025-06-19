import { MigrationInterface, QueryRunner } from "typeorm";

export class AddIpAddressToClient1703123456789 implements MigrationInterface {
    name = 'AddIpAddressToClient1703123456789'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Agregar la columna ipAddress como nullable
        await queryRunner.query(`ALTER TABLE client ADD COLUMN ipAddress VARCHAR(45) NULL`);

        // Agregar un comentario a la columna para documentar su propósito
        await queryRunner.query(`ALTER TABLE client MODIFY COLUMN ipAddress VARCHAR(45) NULL COMMENT 'Dirección IP del cliente'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Eliminar la columna ipAddress
        await queryRunner.query(`ALTER TABLE client DROP COLUMN ipAddress`);
    }
} 