import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPaymentCode1685389937000 implements MigrationInterface {
    name = 'AddPaymentCode1685389937000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Primero, agregar la columna code como nullable
        await queryRunner.query(`ALTER TABLE payment ADD COLUMN code VARCHAR(255) NULL`);

        // Actualizar los registros existentes con un código basado en el cliente
        const payments = await queryRunner.query(`
            SELECT p.id, c.name, c.lastName 
            FROM payment p 
            LEFT JOIN client c ON p.clientId = c.id 
            WHERE p.code IS NULL
        `);

        for (const payment of payments) {
            const clientInitial = payment.name ? payment.name.charAt(0).toUpperCase() : 'X';
            const clientLastNameInitial = payment.lastName ? payment.lastName.charAt(0).toUpperCase() : 'X';
            const formattedNumber = payment.id.toString().padStart(4, '0');
            const code = `PG${clientInitial}${clientLastNameInitial}-${formattedNumber}`;

            await queryRunner.query(`
                UPDATE payment 
                SET code = ? 
                WHERE id = ?
            `, [ code, payment.id ]);
        }

        // Finalmente, hacer la columna unique y not null
        await queryRunner.query(`ALTER TABLE payment MODIFY code VARCHAR(255) NOT NULL`);
        await queryRunner.query(`ALTER TABLE payment ADD UNIQUE INDEX IDX_payment_code (code)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE payment DROP INDEX IDX_payment_code`);
        await queryRunner.query(`ALTER TABLE payment DROP COLUMN code`);
    }
} 