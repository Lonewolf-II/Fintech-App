export interface Customer {
    id: string;
    customerId: string;
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    dateOfBirth?: string;
    kycStatus: 'pending' | 'verified' | 'rejected';
    accountType?: 'individual' | 'corporate';
    createdBy?: number;
    verifiedBy?: number;
    createdAt?: string;
    updatedAt?: string;
    // Relations
    accounts?: Account[];
    ipoApplications?: IPOApplication[];
    credentials?: CustomerCredential[];
}

export interface CustomerCredential {
    id: string;
    customerId: string;
    platform: 'mobile_banking' | 'meroshare' | 'tms';
    loginId: string;
    password?: string;
    status: 'active' | 'inactive' | 'locked';
    updatedBy?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Account {
    id: string;
    accountNumber: string;
    customerId: string;
    accountType: 'savings' | 'current' | 'fixed_deposit';
    balance: number;
    currency: string;
    status: 'active' | 'frozen' | 'closed';
    openingDate: string;
    blockedAmount: number;
    isPrimary: boolean;
    bankName?: string;
    branch?: string;
    accountName?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IPOApplication {
    id: string;
    customerId: string;
    companyName: string;
    quantity: number;
    pricePerShare: number;
    totalAmount: number;
    status: 'pending' | 'verified' | 'allotted' | 'rejected';
    appliedAt: string;
    verifiedBy?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Transaction {
    id: string;
    transactionId: string;
    accountId: string;
    transactionType: 'deposit' | 'withdrawal' | 'transfer';
    amount: number;
    balanceAfter: number;
    description?: string;
    createdBy?: number;
    createdAt?: string;
}

export interface Portfolio {
    id: string;
    portfolioId: string;
    customerId: string;
    totalValue: number;
    totalInvestment: number;
    profitLoss: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Holding {
    id: string;
    holdingId: string;
    portfolioId: string;
    stockSymbol: string;
    companyName: string;
    quantity: number;
    purchasePrice: number;
    currentPrice: number;
    totalValue: number;
    profitLossPercent?: number;
    purchaseDate: string;
    createdAt?: string;
    updatedAt?: string;
}
