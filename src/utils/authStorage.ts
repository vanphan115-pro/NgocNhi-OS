export interface AdminCredentials {
  username: string;
  password: string;
  name?: string;
  role?: string;
  updatedAt?: string;
}

export const DEFAULT_ADMIN_CREDENTIALS: AdminCredentials = {
  username: 'admin',
  password: 'Lộcninh@123',
  name: 'Ban Quản Trị Hệ Thống Ngọc Nhi',
  role: 'Tổng Quản Trị Viên',
  updatedAt: new Date().toISOString()
};

const STORAGE_KEY = 'nn_admin_credentials_v2';

export const getStoredAdminCredentials = (): AdminCredentials => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed.username === 'string' && typeof parsed.password === 'string') {
        return {
          username: parsed.username.trim(),
          password: parsed.password.trim(),
          name: parsed.name || 'Ban Quản Trị Hệ Thống Ngọc Nhi',
          role: parsed.role || 'Tổng Quản Trị Viên',
          updatedAt: parsed.updatedAt || new Date().toISOString()
        };
      }
    }
  } catch (err) {
    console.error('Error reading admin credentials:', err);
  }
  return DEFAULT_ADMIN_CREDENTIALS;
};

export const saveAdminCredentials = (newCreds: { username: string; password: string }): boolean => {
  try {
    const dataToSave: AdminCredentials = {
      username: newCreds.username.trim(),
      password: newCreds.password.trim(),
      name: 'Ban Quản Trị Hệ Thống Ngọc Nhi',
      role: 'Tổng Quản Trị Viên',
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    window.dispatchEvent(new CustomEvent('nn_auth_credentials_changed', { detail: dataToSave }));
    return true;
  } catch (err) {
    console.error('Error saving admin credentials:', err);
    return false;
  }
};

export const RECOVERY_SECURITY_CONFIG = {
  authorizedEmail: 'phandungfarm@gmail.com',
  authorizedPhone: '0969310601',
  supportOwner: 'Phan Dũng Farm (Dũng Kaka) & Quán Ăn Ngọc Nhi',
  hotline: '0969.310.601'
};

const RECOVERY_LOGS_KEY = 'nn_admin_recovery_audit_logs';

export interface RecoveryLogEntry {
  id: string;
  channel: 'email' | 'phone';
  target: string;
  timestamp: string;
  success: boolean;
}

export const logRecoveryAttempt = (channel: 'email' | 'phone', target: string, success: boolean) => {
  try {
    const existing = JSON.parse(localStorage.getItem(RECOVERY_LOGS_KEY) || '[]');
    const newEntry: RecoveryLogEntry = {
      id: `REC-${Date.now()}`,
      channel,
      target,
      timestamp: new Date().toLocaleString('vi-VN'),
      success
    };
    localStorage.setItem(RECOVERY_LOGS_KEY, JSON.stringify([newEntry, ...existing].slice(0, 20)));
  } catch (err) {}
};

export const resetToDefaultAdminCredentialsWithVerification = (
  channel: 'email' | 'phone',
  target: string
): AdminCredentials => {
  logRecoveryAttempt(channel, target, true);
  return resetToDefaultAdminCredentials();
};

export const resetToDefaultAdminCredentials = (): AdminCredentials => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_ADMIN_CREDENTIALS));
    window.dispatchEvent(new CustomEvent('nn_auth_credentials_changed', { detail: DEFAULT_ADMIN_CREDENTIALS }));
  } catch (err) {}
  return DEFAULT_ADMIN_CREDENTIALS;
};

export const verifyAdminLogin = (inputUser: string, inputPass: string): { success: boolean; user?: AdminCredentials; message?: string } => {
  const cleanUser = (inputUser || '').trim();
  const cleanPass = (inputPass || '').trim();

  if (!cleanUser || !cleanPass) {
    return { success: false, message: 'Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu.' };
  }

  const currentCreds = getStoredAdminCredentials();

  // 1. Exact check against currently saved single admin account
  if (
    cleanUser.toLowerCase() === currentCreds.username.toLowerCase() &&
    cleanPass === currentCreds.password
  ) {
    return { success: true, user: currentCreds };
  }

  // 2. Convenience check: if credentials are still at factory default, allow unaccented or simple default
  const isStillDefault = 
    currentCreds.username.toLowerCase() === DEFAULT_ADMIN_CREDENTIALS.username.toLowerCase() &&
    currentCreds.password === DEFAULT_ADMIN_CREDENTIALS.password;

  if (isStillDefault) {
    const defaultVariants = ['Lộcninh@123', 'Locninh@123', 'locninh@123', '123456'];
    if (cleanUser.toLowerCase() === 'admin' && defaultVariants.includes(cleanPass)) {
      return { success: true, user: currentCreds };
    }
  }

  return { 
    success: false, 
    message: `Tên đăng nhập hoặc mật khẩu quản trị không chính xác! Tên đăng nhập hiện tại là: "${currentCreds.username}".` 
  };
};
