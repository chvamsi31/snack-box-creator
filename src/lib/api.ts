// API Base URL - update this to your actual backend URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:9191';

// API Response Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
}

export interface UserResponse {
  email: string;
  firstName: string;
  lastName: string;
}

export interface OrderResponse {
  orderId: number;
  userEmail: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
  status: string;
  orderDate: string;
}

export interface NudgeRequest {
  userEmail: string;
  productName: string;
  nudgeType: string;
}

export interface NudgeResponse {
  success: boolean;
  message: string;
}

// API Service
export const api = {
  // User login
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    
    if (!response.ok && response.status !== 401) {
      throw new Error('Network response was not ok');
    }
    
    return response.json();
  },

  // Get user details by email
  getUserByEmail: async (email: string): Promise<UserResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch user details');
    }
    
    return response.json();
  },

  // Get orders by email
  getOrdersByEmail: async (email: string): Promise<OrderResponse[]> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/orders/email/${encodeURIComponent(email)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch orders');
    }
    
    return response.json();
  },

  // Send nudge
  sendNudge: async (nudgeData: NudgeRequest): Promise<NudgeResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/v1/user/nudge`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(nudgeData),
    });
    
    if (!response.ok) {
      throw new Error('Failed to send nudge');
    }
    
    return response.json();
  },
};
