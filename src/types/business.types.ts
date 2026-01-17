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
    // Family & Demat Options
    fatherName?: string;
    grandfatherName?: string;
    motherName?: string;
    spouseName?: string;
    boid?: string;
    dematOpenDate?: string;
    dematExpiryDate?: string;
    // Relations
    // Relations
    accounts?: Account[];
    ipoApplications?: IPOApplication[];
    credentials?: CustomerCredential[];
    pendingRequests?: ModificationRequest[];
}

export interface ModificationRequest {
    id: string;
    targetModel: 'Customer' | 'Account' | 'IPOApplication' | 'Holding';
    targetId: string;
    requestedChanges: any;
    changeType: 'update' | 'delete' | 'create';
    status: 'pending' | 'approved' | 'rejected';
    requestedBy: number;
    reviewedBy?: number;
    rejectionReason?: string;
    createdAt: string;
    updatedAt?: string;
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

export interface IPOListing {
    id: number;
    companyName: string;
    pricePerShare: number;
    totalShares: number;
    openDate: string;
    closeDate: string;
    openTime?: string;
    closeTime?: string;
    allotmentDate?: string;
    allotmentTime?: string;
    status: 'upcoming' | 'open' | 'closed';
    description?: string;
    createdAt?: string;
    updatedAt?: string;
}

export interface IPOApplication {
    id: number;
    customerId: number;
    ipoListingId?: number;
    companyName: string;
    quantity: number;
    pricePerShare: number;
    totalAmount: number;
    status: 'pending' | 'verified' | 'rejected' | 'allotted';
    allotmentStatus?: 'pending' | 'allotted' | 'not_allotted';
    allotmentQuantity?: number;
    appliedBy?: number;
    verifiedBy?: number;
    verificationDate?: string;
    allotmentDate?: string;
    rejectionReason?: string;
    createdAt: string;
    updatedAt?: string;
    // Relations
    customer?: Partial<Customer>;
    listing?: IPOListing;
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
    lastTransactionPrice?: number;
    lastClosingPrice?: number;
    investmentId?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface Investor {
    id: number;
    investorId: string;
    name: string;
    email: string;
    phone: string;
    totalCapital: number;
    investedAmount: number;
    availableCapital: number;
    totalProfit: number;
    specialAccountNumber: string;
    status: 'active' | 'inactive';
    createdBy?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface SpecialAccount {
    id: number;
    accountNumber: string;
    accountType: 'office' | 'investor';
    accountName: string;
    shortName: string;
    balance: number;
    investorId?: number;
    status: 'active' | 'inactive';
    createdBy?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface InvestorAccountAssignment {
    id: number;
    investorId: number;
    accountId: number;
    customerId: number;
    assignedDate: string;
    assignedBy?: number;
    status: 'active' | 'inactive';
    createdAt?: string;
    updatedAt?: string;
}

export interface ProfitDistribution {
    id: number;
    investmentId: number;
    saleQuantity: number;
    salePrice: number;
    saleAmount: number;
    principalReturned: number;
    totalProfit: number;
    investorShare: number;
    adminShare: number;
    feesDeducted: number;
    customerShare: number;
    distributionDate: string;
    createdBy?: number;
    createdAt?: string;
}

export interface Fee {
    id: number;
    feeId: string;
    customerId: number;
    accountId?: number;
    feeType: 'annual_fee' | 'demat_charge' | 'meroshare_charge' | 'renewal_fee';
    amount: number;
    dueDate?: string;
    paidDate?: string;
    status: 'pending' | 'paid' | 'waived';
    paidFromDistribution: boolean;
    distributionId?: number;
    createdAt?: string;
    updatedAt?: string;
}

export interface IPOStats {
    totalApplications: number;
    pendingApplications: number;
    verifiedApplications: number;
    allottedApplications: number;
    totalFundsBlocked: string;
    totalFundsAllotted: string;
}

export interface BulkUploadResult {
    message: string;
    successCount: number;
    failureCount: number;
    successfulRecords: any[];
    failedRecords: Array<{
        row: number;
        data: any;
        errors: string[];
    }>;
}

export interface Investment {
    id: number;
    investmentId: string;
    investorId: number;
    customerId: number;
    accountId: number;
    ipoApplicationId?: number;
    principalAmount: number;
    sharesAllocated: number;
    costPerShare: number;
    totalCost: number;
    sharesHeld: number;
    currentMarketPrice: number;
    currentValue: number;
    totalSoldAmount: number;
    investorProfit: number;
    customerProfit: number;
    adminFee: number;
    status: 'active' | 'partially_sold' | 'fully_realized';
    investedAt: string;
    createdAt: string;
    updatedAt: string;
    customer?: Customer;
    account?: Account;
}
