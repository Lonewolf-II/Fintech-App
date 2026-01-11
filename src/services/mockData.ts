import type { User, UserRole } from '../types/auth.types';
import type { Notification } from '../types/common.types';

// Helper function to generate UUID
const generateUUID = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
};

// Mock users for different roles
export const mockUsers: User[] = [
    {
        id: '1',
        userId: 'usr_001_admin',
        staffId: 100,
        email: 'admin@fintech.com',
        name: 'Admin User',
        role: 'admin',
        phone: '+977-9841234567',
        status: 'active',
        createdAt: new Date('2024-01-01').toISOString(),
    },
    {
        id: '2',
        userId: 'usr_002_maker',
        staffId: 101,
        email: 'maker@fintech.com',
        name: 'Maker Staff',
        role: 'maker',
        phone: '+977-9841234568',
        status: 'active',
        createdAt: new Date('2024-02-15').toISOString(),
    },
    {
        id: '3',
        userId: 'usr_003_checker',
        staffId: 102,
        email: 'checker@fintech.com',
        name: 'Checker Staff',
        role: 'checker',
        phone: '+977-9841234569',
        status: 'active',
        createdAt: new Date('2024-03-10').toISOString(),
    },
    {
        id: '4',
        userId: 'usr_004_investor',
        staffId: 103,
        email: 'investor@fintech.com',
        name: 'Investor User',
        role: 'investor',
        phone: '+977-9841234570',
        status: 'active',
        createdAt: new Date('2024-04-20').toISOString(),
    },
];


// User Management CRUD Operations
export const getAllMockUsers = (): User[] => {
    return [...mockUsers];
};

export const createMockUser = (userData: Omit<User, 'id' | 'createdAt' | 'userId'>): User => {
    const newUser: User = {
        ...userData,
        id: (mockUsers.length + 1).toString(),
        userId: generateUUID(),
        createdAt: new Date().toISOString(),
        status: userData.status || 'active',
    };
    mockUsers.push(newUser);
    return newUser;
};

export const updateMockUser = (id: string, updates: Partial<User>): User => {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) throw new Error(`User with id ${id} not found`);

    mockUsers[index] = { ...mockUsers[index], ...updates };
    return mockUsers[index];
};

export const deleteMockUser = (id: string): void => {
    const index = mockUsers.findIndex((u) => u.id === id);
    if (index === -1) throw new Error(`User with id ${id} not found`);

    mockUsers.splice(index, 1);
};

// Mock notifications
export const mockNotifications: Notification[] = [
    {
        id: '1',
        title: 'IPO Application Verified',
        message: 'Your IPO application for XYZ Company has been verified.',
        type: 'success',
        read: false,
        createdAt: new Date().toISOString(),
    },
    {
        id: '2',
        title: 'New IPO Available',
        message: 'ABC Company IPO is now open for applications.',
        type: 'info',
        read: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
        id: '3',
        title: 'Account Balance Low',
        message: 'Your available balance is below NPR 10,000.',
        type: 'warning',
        read: true,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
    },
];

// Mock login function - accepts email or staff ID
export const mockLogin = (emailOrStaffId: string, _password: string): User | null => {
    // For demo purposes, any password works
    // Search by email or staff ID (convert to number if it's a staff ID)
    const staffIdNum = parseInt(emailOrStaffId);
    const user = mockUsers.find(
        (u) => u.email === emailOrStaffId ||
            (!isNaN(staffIdNum) && u.staffId === staffIdNum)
    );
    return user || null;
};

// Get user by role (for quick testing)
export const getUserByRole = (role: UserRole): User => {
    const user = mockUsers.find((u) => u.role === role);
    if (!user) throw new Error(`No user found for role: ${role}`);
    return user;
};
