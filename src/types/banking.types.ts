export interface Customer {
    customerId: string; // Format: YYYYNN (e.g., 202601)
    name: string;
    dateOfBirth: string;
    contactNo: string;
    email?: string;
    address?: string;
    createdAt: string;
    updatedAt: string;
}

export interface BankAccount {
    id: string;
    customerId: string;
    accountNumber: string;
    totalBalance: number;
    holdBalance: number;
    availableBalance: number;
    effectiveBalance: number;
    status: 'active' | 'frozen' | 'closed';
    createdAt: string;
}

export type TransactionType = 'CREDIT' | 'DEBIT' | 'HOLD' | 'RELEASE';

export interface Transaction {
    id: string;
    accountId: string;
    type: TransactionType;
    amount: number;
    balance: number;
    description: string;
    createdAt: string;
}

export interface DematAccount {
    id: string;
    customerId: string;
    dematNumber: string;
    status: 'active' | 'frozen' | 'closed';
    createdAt: string;
}

export interface ShareHolding {
    id: string;
    dematAccountId: string;
    companyName: string;
    symbol: string;
    quantity: number;
    avgPrice: number;
    currentPrice: number;
    lastUpdated: string;
}

export interface IPO {
    id: string;
    name: string;
    symbol: string;
    pricePerUnit: number;
    minUnits: number;
    allowedMultiples: number;
    openDate: string;
    closeDate: string;
    status: 'upcoming' | 'open' | 'closed' | 'allotted';
    createdAt: string;
}

export type IPOApplicationStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export interface IPOApplication {
    id: string;
    ipoId: string;
    customerId: string;
    units: number;
    amount: number;
    status: IPOApplicationStatus;
    appliedBy: string; // Maker ID
    verifiedBy?: string; // Checker ID
    rejectionReason?: string;
    createdAt: string;
    updatedAt: string;
}
