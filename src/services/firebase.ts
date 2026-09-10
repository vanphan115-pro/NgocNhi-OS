import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getDatabase, Database } from 'firebase/database';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  Auth, 
  User 
} from 'firebase/auth';

export const firebaseConfig = {
  apiKey: "AIzaSyCGMjMNqOHxo3WHnHDt350WY5w02oI5k_M",
  authDomain: "hethongdichvungocnhi.firebaseapp.com",
  databaseURL: "https://hethongdichvungocnhi-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "hethongdichvungocnhi",
  storageBucket: "hethongdichvungocnhi.firebasestorage.app",
  messagingSenderId: "442352470681",
  appId: "1:442352470681:web:a62038dae57b4f229b4608",
  measurementId: "G-1GMMT43N8N"
};

// 1. Khởi tạo Firebase App với cấu hình chính xác của Hệ thống Dịch Vụ Ngọc Nhi
export const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// 2. Khởi tạo Firebase Analytics an toàn (kiểm tra môi trường trình duyệt)
export let analytics: any = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analytics = getAnalytics(app);
    }
  }).catch(() => {});
}

// 3. Khởi tạo Firebase Realtime Database trỏ chính xác vào databaseURL
export const rtdb: Database = getDatabase(app, firebaseConfig.databaseURL);
export const db: Database = rtdb;

// 4. Khởi tạo Firebase Auth hỗ trợ phiên xác thực nếu có yêu cầu phân quyền
export const auth: Auth = getAuth(app);

let authInitPromise: Promise<User | null> | null = null;

/**
 * Đảm bảo client có phiên xác thực nếu cần (ngầm, không làm phiền người dùng)
 */
export async function ensureAuth(): Promise<User | null> {
  if (auth.currentUser) return auth.currentUser;
  
  if (!authInitPromise) {
    authInitPromise = new Promise((resolve) => {
      let settled = false;
      const finish = (user: User | null) => {
        if (!settled) {
          settled = true;
          resolve(user);
        }
      };

      const unsub = onAuthStateChanged(auth, async (user) => {
        if (user) {
          unsub();
          finish(user);
        } else {
          try {
            const cred = await signInAnonymously(auth);
            unsub();
            finish(cred.user);
          } catch (err: any) {
            unsub();
            finish(null);
          }
        }
      });

      // Fallback timeout nhanh (800ms) để không làm chặn tải dữ liệu nếu Realtime Database cho phép đọc/ghi công khai
      setTimeout(() => {
        if (!settled) {
          finish(auth.currentUser);
        }
      }, 800);
    });
  }
  
  const res = await authInitPromise;
  if (!res && !auth.currentUser) {
    authInitPromise = null;
  }
  return res || auth.currentUser;
}

export default rtdb;

