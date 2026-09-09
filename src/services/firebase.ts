import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  Firestore,
  setLogLevel
} from 'firebase/firestore';
import { 
  getAuth, 
  signInAnonymously, 
  onAuthStateChanged, 
  Auth, 
  User 
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Khởi tạo Firebase App an toàn
const app = getApps().length > 0 ? getApp() : initializeApp({
  apiKey: firebaseConfig.apiKey,
  authDomain: firebaseConfig.authDomain,
  projectId: firebaseConfig.projectId,
  storageBucket: firebaseConfig.storageBucket,
  messagingSenderId: firebaseConfig.messagingSenderId,
  appId: firebaseConfig.appId,
});

// Lấy databaseId tùy biến từ firebase-applet-config.json nếu có
const customDatabaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
  ? firebaseConfig.firestoreDatabaseId
  : undefined;

// Thiết lập log level sang silent để ngăn Firestore SDK in cảnh báo retry rác khi mạng hoặc hạn ngạch quá tải
try {
  setLogLevel('silent');
} catch (e) {}

export const db: Firestore = customDatabaseId
  ? getFirestore(app, customDatabaseId)
  : getFirestore(app);

export const auth: Auth = getAuth(app);

let authInitPromise: Promise<User | null> | null = null;

/**
 * Đảm bảo client đã có phiên xác thực hợp lệ (ngầm, không làm phiền người dùng)
 * Đáp ứng yêu cầu bảo mật Firestore request.auth != null trên đa thiết bị
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
            console.warn('Lưu ý kết nối Firebase Auth:', err?.message || err);
            unsub();
            finish(null);
          }
        }
      });

      // Fallback timeout tránh treo promise quá lâu nếu mạng chậm
      setTimeout(() => {
        if (!settled) {
          finish(auth.currentUser);
        }
      }, 5000);
    });
  }
  
  const res = await authInitPromise;
  // Nếu chưa có phiên xác thực, cho phép thử lại ở lần gọi kế tiếp
  if (!res && !auth.currentUser) {
    authInitPromise = null;
  }
  return res || auth.currentUser;
}

export default db;
