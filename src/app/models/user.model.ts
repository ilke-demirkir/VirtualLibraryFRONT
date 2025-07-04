export interface User{
    id: number;
    username: string;
    email: string;
    password: string;
    isAdmin?: boolean; // Optional property to indicate if the user is an admin
    token?: string; // Optional property for authentication token
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginResponse {
    username: string;
    isAdmin: boolean;
    token: string; // Authentication token returned upon successful login
}