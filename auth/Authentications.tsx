"use client";

import { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";
import { toast, ToastClassName } from "react-toastify";
import { ROOT_URL } from "@/app/root_api";
import { useRouter } from "next/navigation";

interface User {
    id: number;
    username: string;
    full_name: string;
}

interface AuthContextType {
    isAuthenticated: boolean;
    user: User | null;
    login: () => void;
    logout: () => void;
    fetchUser: () => void;
}

const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    user: null,
    login: () => { },
    logout: () => { },
    fetchUser: () => { },
});

export const Auths = ({ children }: { children: React.ReactNode }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<User | null>(null);
    const router = useRouter();
    const fetchUser = async () => {
        try {
            const res = await axios.get(`${ROOT_URL}/accounts/me`, {
                withCredentials: true,
            });
            setUser(res.data.data);
            setIsAuthenticated(true);
        } catch (e) {
            console.log("have an error");
            setUser(null);
            setIsAuthenticated(false);
        }
    };

    useEffect(() => {
        fetchUser();
    }, []);

    const login = () => {
        setIsAuthenticated(true);
        fetchUser();
    };

    const logout = async () => {
        try {
            await axios.post(`${ROOT_URL}/accounts/logout/`, {}, { withCredentials: true });
        } catch (err) {
        } finally {
            router.push('/')
            setIsAuthenticated(false);
            setUser(null);
            toast.info("Succes loged out")
        }
    };


    return (
        <AuthContext.Provider value={{ isAuthenticated, user, login, logout, fetchUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export default function useAuth() {
    return useContext(AuthContext);
}