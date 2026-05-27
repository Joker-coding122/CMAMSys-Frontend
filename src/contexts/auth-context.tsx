"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useRouter } from "next/navigation";

export type UserRole = "modeler" | "coder" | "writer" | "undecided";

interface User {
  id: string;
  username: string;
  email: string;
  displayName: string;
  role: UserRole;
  roleLabel: string;
  team?: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (
    username: string,
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ) => Promise<boolean>;
  updateRole: (role: UserRole) => void;
  logout: () => void;
}

const ROLE_LABELS: Record<UserRole, string> = {
  modeler: "建模手",
  coder: "编程手",
  writer: "论文手",
  undecided: "暂未确定",
};

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => false,
  register: async () => false,
  updateRole: () => {},
  logout: () => {},
});

export function useAuth() {
  return useContext(AuthContext);
}

const STORAGE_KEY = "cmamsys_user";

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Date.now().toString(36);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // 页面刷新时从 localStorage 恢复用户状态
  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed && parsed.id && parsed.username) {
            setUser(parsed);
          }
        }
      } catch {
        localStorage.removeItem(STORAGE_KEY);
      }
      setIsLoading(false);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    // Mock: 任何非空用户名密码都成功
    if (!username.trim() || !password.trim()) {
      return false;
    }

    // 登录时尝试沿用上次已注册的角色（若有）
    let existingRole: UserRole = "undecided";
    try {
      const prev = localStorage.getItem(STORAGE_KEY);
      if (prev) {
        const parsed = JSON.parse(prev);
        if (parsed?.username === username.trim() && parsed?.role) {
          existingRole = parsed.role;
        }
      }
    } catch {}

    const newUser: User = {
      id: generateId(),
      username: username.trim(),
      email: `${username.trim()}@example.com`,
      displayName: username.trim(),
      role: existingRole,
      roleLabel: ROLE_LABELS[existingRole],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return true;
  }, []);

  const register = useCallback(async (
    username: string,
    email: string,
    password: string,
    displayName: string,
    role: UserRole
  ): Promise<boolean> => {
    if (!username.trim() || !email.trim() || !password.trim() || !displayName.trim()) {
      return false;
    }

    const newUser: User = {
      id: generateId(),
      username: username.trim(),
      email: email.trim(),
      displayName: displayName.trim(),
      role,
      roleLabel: ROLE_LABELS[role],
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(newUser));
    setUser(newUser);
    return true;
  }, []);

  const updateRole = useCallback((role: UserRole) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next: User = {
        ...prev,
        role,
        roleLabel: ROLE_LABELS[role],
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setUser(null);
    router.push("/login");
  }, [router]);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, updateRole, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
