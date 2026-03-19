import { create } from 'zustand';
import { AUTH_URI } from '../api/constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserState {
    user: any;
    loading: boolean;
    fetchProfile: () => Promise<void>;
    setUser: (user: any) => void;
}

export const useUserStore = create<UserState>((set) => ({
    user: null,
    loading: false,
    setUser: (user) => set({ user }),
    fetchProfile: async () => {
        set({ loading: true });
        try {
            const response = await AUTH_URI.get('me');
            if (response.data.success) {
                set({ user: response.data.data });
            }
        } catch (error) {
            console.error('Fetch profile error:', error);
        } finally {
            set({ loading: false });
        }
    }
}));
