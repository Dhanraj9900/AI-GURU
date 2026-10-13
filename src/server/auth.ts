import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { db } from './db.ts';
import { User, Role, Language, TeacherDegree } from '../types/index.ts';

// Simple, secure session token store (token -> userId)
const tokenStore = new Map<string, { userId: string; expiresAt: number }>();

// Pre-seed sessions for demo users so testing is seamless
tokenStore.set('token_student_demo', {
  userId: 'usr_student_1',
  expiresAt: Date.now() + 86400000 * 7,
});
tokenStore.set('token_teacher_demo', {
  userId: 'usr_teacher_1',
  expiresAt: Date.now() + 86400000 * 7,
});
tokenStore.set('token_admin_demo', {
  userId: 'usr_admin_1',
  expiresAt: Date.now() + 86400000 * 7,
});

export function generateToken(userId: string): string {
  const token = 'guru_' + crypto.randomBytes(32).toString('hex');
  tokenStore.set(token, {
    userId,
    expiresAt: Date.now() + 86400000 * 7, // 7 days
  });
  return token;
}

export function verifyToken(token: string): User | null {
  if (!token) return null;
  const session = tokenStore.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    tokenStore.delete(token);
    return null;
  }
  const userRecord = db.users.find((u) => u.id === session.userId);
  if (!userRecord) return null;
  const { passwordHash: _, ...safeUser } = userRecord;
  return safeUser;
}

export function revokeToken(token: string): void {
  tokenStore.delete(token);
}

export async function loginUser(email: string, password: string): Promise<{ user: User; token: string } | null> {
  const user = db.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (!user) return null;

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) return null;

  const token = generateToken(user.id);
  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser, token };
}

export async function signupUser(params: {
  name: string;
  email: string;
  password: string;
  role?: Role;
  preferredLanguage?: Language;
  educationalLevel?: string;
  teacherDegree?: {
    degreeLevel: 'graduate' | 'postgraduate' | 'phd';
    degreeName: string;
    institution: string;
    graduationYear: string;
    specialization?: string;
    documentName: string;
    documentUrl?: string;
  };
}): Promise<{ user: User; token: string } | { error: string }> {
  const existing = db.users.find((u) => u.email.toLowerCase() === params.email.toLowerCase());
  if (existing) {
    return { error: 'An account with this email address already exists.' };
  }

  if (params.password.length < 6) {
    return { error: 'Password must be at least 6 characters long.' };
  }

  const role = params.role || 'student';

  // Strict enforcement: Teachers MUST upload at least a graduate, postgraduate, or PhD degree!
  let teacherDegreeData: TeacherDegree | undefined = undefined;
  if (role === 'teacher') {
    if (!params.teacherDegree) {
      return {
        error:
          'अनिवार्य आवश्यकता: शिक्षक खाता बनाने के लिए कम से कम स्नातक (Graduate), स्नातकोत्तर (Postgraduate) या पीएचडी (PhD) डिग्री और प्रमाण-पत्र अपलोड करना अनिवार्य है। बिना डिग्री के शिक्षक नहीं बन सकते।',
      };
    }

    const { degreeLevel, degreeName, institution, graduationYear, documentName } = params.teacherDegree;
    if (!['graduate', 'postgraduate', 'phd'].includes(degreeLevel)) {
      return {
        error:
          'अमान्य डिग्री स्तर। शिक्षक बनने के लिए कम से कम स्नातक (Graduate), स्नातकोत्तर (Postgraduate) या पीएचडी (PhD) होना आवश्यक है।',
      };
    }

    if (!degreeName?.trim() || !institution?.trim() || !graduationYear?.trim() || !documentName?.trim()) {
      return {
        error:
          'डिग्री का नाम, विश्वविद्यालय/संस्थान, उत्तीर्ण वर्ष और डिग्री प्रमाण-पत्र दस्तावेज़ अपलोड करना अनिवार्य है।',
      };
    }

    teacherDegreeData = {
      degreeLevel: params.teacherDegree.degreeLevel,
      degreeName: params.teacherDegree.degreeName.trim(),
      institution: params.teacherDegree.institution.trim(),
      graduationYear: params.teacherDegree.graduationYear.trim(),
      specialization: params.teacherDegree.specialization?.trim() || 'General Pedagogy & STEM',
      documentName: params.teacherDegree.documentName.trim(),
      documentUrl:
        params.teacherDegree.documentUrl ||
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
      verified: true,
      verifiedAt: new Date().toISOString(),
    };
  }

  const saltRounds = 10;
  const passwordHash = await bcrypt.hash(params.password, saltRounds);

  const newUser = {
    id: 'usr_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6),
    name: params.name.trim(),
    email: params.email.toLowerCase().trim(),
    passwordHash,
    role,
    preferredLanguage: params.preferredLanguage || 'en',
    educationalLevel:
      role === 'teacher' && teacherDegreeData
        ? `${teacherDegreeData.degreeName} (${teacherDegreeData.institution})`
        : params.educationalLevel || 'Standard Secondary Curriculum',
    createdAt: new Date().toISOString(),
    teacherDegree: teacherDegreeData,
  };

  db.users.push(newUser);

  // Initialize empty progress and study plan
  db.topicMastery[newUser.id] = [];
  db.studyPlans[newUser.id] = {
    id: 'stp_' + newUser.id,
    userId: newUser.id,
    targetGoal: params.educationalLevel || 'Holistic Academic Excellence',
    targetDate: '2026-06-30',
    dailyHoursAvailable: 2,
    tasks: [],
    flashcards: [],
  };

  const token = generateToken(newUser.id);
  const { passwordHash: _, ...safeUser } = newUser;
  return { user: safeUser, token };
}

export async function verifyAndUpgradeTeacher(
  userId: string,
  degree: {
    degreeLevel: 'graduate' | 'postgraduate' | 'phd';
    degreeName: string;
    institution: string;
    graduationYear: string;
    specialization?: string;
    documentName: string;
    documentUrl?: string;
  }
): Promise<{ user: User } | { error: string }> {
  const user = db.users.find((u) => u.id === userId);
  if (!user) {
    return { error: 'User account not found.' };
  }

  if (!['graduate', 'postgraduate', 'phd'].includes(degree.degreeLevel)) {
    return {
      error:
        'अमान्य डिग्री स्तर। शिक्षक बनने के लिए कम से कम स्नातक (Graduate), स्नातकोत्तर (Postgraduate) या पीएचडी (PhD) होना आवश्यक है।',
    };
  }

  if (!degree.degreeName?.trim() || !degree.institution?.trim() || !degree.graduationYear?.trim() || !degree.documentName?.trim()) {
    return {
      error:
        'डिग्री का नाम, विश्वविद्यालय/संस्थान, उत्तीर्ण वर्ष और डिग्री प्रमाण-पत्र दस्तावेज़ अपलोड करना अनिवार्य है।',
    };
  }

  const teacherDegreeData: TeacherDegree = {
    degreeLevel: degree.degreeLevel,
    degreeName: degree.degreeName.trim(),
    institution: degree.institution.trim(),
    graduationYear: degree.graduationYear.trim(),
    specialization: degree.specialization?.trim() || 'General Pedagogy & STEM',
    documentName: degree.documentName.trim(),
    documentUrl:
      degree.documentUrl ||
      'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    verified: true,
    verifiedAt: new Date().toISOString(),
  };

  user.role = 'teacher';
  user.teacherDegree = teacherDegreeData;
  user.educationalLevel = `Verified Faculty: ${teacherDegreeData.degreeName} (${teacherDegreeData.institution})`;

  const { passwordHash: _, ...safeUser } = user;
  return { user: safeUser };
}
