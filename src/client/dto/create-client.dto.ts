import { AccountStatus, PaymentStatus } from "../entities/client.entity";

export class CreateClientDto {
    name: string;
    lastName: string;
    dni: string;
    phone: string;
    address: string;
    installationDate: string;
    reference?: string;
    paymentDate: string;
    advancePayment: boolean;
    status: AccountStatus;
    description: string;    
    plan?: number;
    sector?: number;
    routerSerial?: string;
    decoSerial?: string;
    paymentStatus?: PaymentStatus;
}