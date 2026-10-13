import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, Role, Language, DegreeLevel } from '../types/index.ts';
import { api, setStoredToken, clearStoredToken, getStoredToken } from '../api/client.ts';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (payload: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    preferredLanguage?: Language;
    educationalLevel?: string;
    teacherDegree?: {
      degreeLevel: DegreeLevel;
      degreeName: string;
      institution: string;
      graduationYear: string;
      specialization?: string;
      documentName: string;
      documentUrl?: string;
    };
  }) => Promise<void>;
  upgradeToTeacher: (degreeData: {
    degreeLevel: DegreeLevel;
    degreeName: string;
    institution: string;
    graduationYear: string;
    specialization?: string;
    documentName: string;
    documentUrl?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  quickLoginAs: (role: Role) => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authModalMode: 'login' | 'signup';
  setAuthModalMode: (mode: 'login' | 'signup') => void;
  showTeacherVerifyModal: boolean;
  setShowTeacherVerifyModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');
  const [showTeacherVerifyModal, setShowTeacherVerifyModal] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        setUser(res.user);
      } catch {
        clearStoredToken();
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, []);

  const login = async (email: string, password: string) => {
    const res = await api.login(email, password);
    setStoredToken(res.token);
    setUser(res.user);
    setShowAuthModal(false);
  };

  const signup = async (payload: {
    name: string;
    email: string;
    password: string;
    role?: Role;
    preferredLanguage?: Language;
    educationalLevel?: string;
    teacherDegree?: {
      degreeLevel: DegreeLevel;
      degreeName: string;
      institution: string;
      graduationYear: string;
      specialization?: string;
      documentName: string;
      documentUrl?: string;
    };
  }) => {
    const res = await api.signup(payload);
    setStoredToken(res.token);
    setUser(res.user);
    setShowAuthModal(false);
  };

  const upgradeToTeacher = async (degreeData: {
    degreeLevel: DegreeLevel;
    degreeName: string;
    institution: string;
    graduationYear: string;
    specialization?: string;
    documentName: string;
    documentUrl?: string;
  }) => {
    const res = await api.verifyAsTeacher(degreeData);
    setUser(res.user);
    setShowTeacherVerifyModal(false);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors on logout
    }
    clearStoredToken();
    setUser(null);
  };

  const quickLoginAs = async (role: Role) => {
    const demoCredentials: Record<Role, { email: string; pass: string }> = {
      student: { email: 'student@aiguru.edu', pass: 'GuruPass123!' },
      teacher: { email: 'teacher@aiguru.edu', pass: 'GuruPass123!' },
      admin: { email: 'admin@aiguru.edu', pass: 'GuruPass123!' },
    };
    const creds = demoCredentials[role];
    await login(creds.email, creds.pass);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        signup,
        upgradeToTeacher,
        logout,
        quickLoginAs,
        showAuthModal,
        setShowAuthModal,
        authModalMode,
        setAuthModalMode,
        showTeacherVerifyModal,
        setShowTeacherVerifyModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
