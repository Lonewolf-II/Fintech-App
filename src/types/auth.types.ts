export type UserRole = 'admin' | 'maker' | 'checker' | 'investor';

export interface User {
    id: string;
    userId: string;        // Unique internal ID (UUID)
    staffId: number;       // Editable staff number (e.g., 100, 101)
    email: string;
    name: string;
    role: UserRole;
    avatar?: string;
    phone?: string;
    status?: 'active' | 'inactive';
    createdAt?: string;
}

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;
}
