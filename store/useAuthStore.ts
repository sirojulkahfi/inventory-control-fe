import { create } from 'zustand';
import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';

export interface AuthUser {
  id: string;
  username: string;
  name: string;
  role: {
    id: string;
    name: string;
    type: string;
    permissions: string[];
  };
  customerId?: string | null;
}

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  login: (token: string, user: AuthUser) => void;
  logout: () => void;
}

// Inisialisasi dari cookie agar tetap login saat direfresh
const token = Cookies.get('accessToken') || null;
let user: AuthUser | null = null;

if (token) {
  try {
    user = jwtDecode<AuthUser>(token);
  } catch (e) {
    Cookies.remove('accessToken');
  }
}

// Perhatikan tanda kurung ganda ()() setelah <AuthState>
export const useAuthStore = create<AuthState>()((set) => ({
  token,
  user,
  login: (newToken, newUser) => {
    Cookies.set('accessToken', newToken, { expires: 1 }); // Expire 1 hari
    set({ token: newToken, user: newUser });
  },
  logout: () => {
    Cookies.remove('accessToken');
    set({ token: null, user: null });
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  },
}));