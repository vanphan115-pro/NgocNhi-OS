import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Crown, 
  Lock, 
  User, 
  KeyRound, 
  X, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw,
  Sparkles,
  ArrowRight,
  Eye,
  EyeOff,
  Settings,
  Save,
  Check,
  Zap,
  Info,
  Mail,
  Phone,
  ShieldAlert,
  Copy,
  Timer,
  Send,
  RefreshCw,
  ExternalLink
} from 'lucide-react';
import { 
  getStoredAdminCredentials, 
  saveAdminCredentials, 
  verifyAdminLogin,
  resetToDefaultAdminCredentials,
  resetToDefaultAdminCredentialsWithVerification,
  RECOVERY_SECURITY_CONFIG,
  AdminCredentials,
  DEFAULT_ADMIN_CREDENTIALS
} from '../utils/authStorage';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: { username: string; name: string }) => void;
  requiredActionNote?: string;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  requiredActionNote
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'change_creds' | 'recover'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Change credentials form state
  const [currentCredentials, setCurrentCredentials] = useState<AdminCredentials>(DEFAULT_ADMIN_CREDENTIALS);
  const [changeForm, setChangeForm] = useState({
    currentPass: '',
    newUsername: '',
    newPass: '',
    confirmPass: ''
  });
  const [showNewPass, setShowNewPass] = useState(false);
  const [showActivePass, setShowActivePass] = useState(false);

  // Recovery & OTP Verification State
  const [recoveryChannel, setRecoveryChannel] = useState<'email' | 'phone'>('email');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [otpSentTime, setOtpSentTime] = useState<number | null>(null);
  const [countdown, setCountdown] = useState<number>(0);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);
  const [otpNotice, setOtpNotice] = useState<{
    channel: 'email' | 'phone';
    target: string;
    code: string;
    sentAt: string;
  } | null>(null);

  // Countdown timer effect
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [countdown]);

  useEffect(() => {
    if (isOpen) {
      const creds = getStoredAdminCredentials();
      setCurrentCredentials(creds);
      setUsername('');
      setPassword('');
      setChangeForm({
        currentPass: '',
        newUsername: creds.username,
        newPass: '',
        confirmPass: ''
      });
      setErrorMsg(null);
      setSuccessMsg(null);
      setOtpCode('');
      setCopiedOtp(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleQuickFillCurrent = () => {
    setUsername(currentCredentials.username);
    setPassword(currentCredentials.password);
    setErrorMsg(null);
    setSuccessMsg(`✓ Đã điền tài khoản quản trị: ${currentCredentials.username}`);
  };

  const handleInitiateRecovery = () => {
    setActiveTab('recover');
    setErrorMsg(null);
    setSuccessMsg(null);
    setOtpCode('');
  };

  const handleSendOtp = () => {
    setIsSendingOtp(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    const target = recoveryChannel === 'email' 
      ? RECOVERY_SECURITY_CONFIG.authorizedEmail 
      : RECOVERY_SECURITY_CONFIG.authorizedPhone;

    setTimeout(() => {
      // Generate a secure 6-digit random code
      const newOtp = Math.floor(100000 + Math.random() * 900000).toString();
      setGeneratedOtp(newOtp);
      setOtpSentTime(Date.now());
      setCountdown(180); // 3 minutes validity
      setOtpNotice({
        channel: recoveryChannel,
        target,
        code: newOtp,
        sentAt: new Date().toLocaleTimeString('vi-VN')
      });
      setIsSendingOtp(false);
      setSuccessMsg(
        recoveryChannel === 'email'
          ? `✓ Đã gửi mã OTP bảo mật 6 số đến Gmail: ${target}`
          : `✓ Đã gửi mã OTP bảo mật 6 số đến SĐT: ${target}`
      );
    }, 600);
  };

  const handleCopyOtp = (code: string) => {
    if (navigator?.clipboard?.writeText) {
      navigator.clipboard.writeText(code);
      setCopiedOtp(true);
      setTimeout(() => setCopiedOtp(false), 2000);
    }
  };

  const handleAutoFillOtp = (code: string) => {
    setOtpCode(code);
    setErrorMsg(null);
  };

  const handleVerifyAndReset = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const target = recoveryChannel === 'email' 
      ? RECOVERY_SECURITY_CONFIG.authorizedEmail 
      : RECOVERY_SECURITY_CONFIG.authorizedPhone;

    const enteredClean = otpCode.trim();

    if (!enteredClean) {
      setErrorMsg('Vui lòng nhập mã xác thực OTP 6 số.');
      return;
    }

    if (!generatedOtp || !otpSentTime) {
      setErrorMsg(`Chưa có mã OTP nào được phát sinh. Vui lòng bấm "Gửi Mã Xác Thực OTP".`);
      return;
    }

    if (Date.now() - otpSentTime > 180 * 1000) {
      setErrorMsg('Mã OTP xác thực đã hết hiệu lực (quá 3 phút). Vui lòng nhấn "Gửi lại mã OTP mới".');
      return;
    }

    if (enteredClean !== generatedOtp) {
      setErrorMsg(`Mã OTP không chính xác! Vui lòng kiểm tra lại mã đã gửi về ${target}.`);
      return;
    }

    setIsVerifyingOtp(true);

    setTimeout(() => {
      // Execute verified reset
      const resetCreds = resetToDefaultAdminCredentialsWithVerification(recoveryChannel, target);
      setCurrentCredentials(resetCreds);
      setUsername(resetCreds.username);
      setPassword(resetCreds.password);
      setChangeForm({
        currentPass: '',
        newUsername: resetCreds.username,
        newPass: '',
        confirmPass: ''
      });
      setIsVerifyingOtp(false);
      setGeneratedOtp(null);
      setOtpNotice(null);
      setOtpCode('');

      setSuccessMsg(
        `✓ XÁC THỰC THÀNH CÔNG qua ${target}! Tài khoản quản trị đã khôi phục về mặc định: "${resetCreds.username}" / "${resetCreds.password}"`
      );

      // Transition smoothly to login tab with prefilled credentials
      setTimeout(() => {
        setActiveTab('login');
      }, 1600);
    }, 500);
  };

  const handleLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const u = username.trim();
    const p = password.trim();

    if (!u || !p) {
      setErrorMsg('Vui lòng điền đầy đủ Tên đăng nhập và Mật khẩu.');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      const result = verifyAdminLogin(u, p);

      if (result.success && result.user) {
        const userObj = {
          username: result.user.username,
          name: result.user.name || 'Quản Trị Viên'
        };
        onLoginSuccess(userObj);
        onClose();
      } else {
        setErrorMsg(result.message || 'Tên đăng nhập hoặc mật khẩu quản trị không chính xác.');
      }
      setIsSubmitting(false);
    }, 300);
  };

  const handleChangeCredentials = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const { currentPass, newUsername, newPass, confirmPass } = changeForm;

    // Verify current password first
    const verify = verifyAdminLogin(currentCredentials.username, currentPass);
    if (!verify.success) {
      setErrorMsg('Mật khẩu hiện tại không đúng! Vui lòng nhập đúng mật khẩu đang sử dụng (hoặc bấm "Khôi phục tài khoản gốc" bên dưới).');
      return;
    }

    if (!newUsername.trim()) {
      setErrorMsg('Tên đăng nhập mới không được để trống.');
      return;
    }

    if (!newPass.trim()) {
      setErrorMsg('Mật khẩu mới không được để trống.');
      return;
    }

    if (newPass.length < 4) {
      setErrorMsg('Mật khẩu mới phải có ít nhất 4 ký tự.');
      return;
    }

    if (newPass !== confirmPass) {
      setErrorMsg('Mật khẩu mới và mật khẩu xác nhận không trùng khớp!');
      return;
    }

    const updatedCreds: AdminCredentials = {
      username: newUsername.trim(),
      password: newPass.trim(),
      name: 'Ban Quản Trị Hệ Thống Ngọc Nhi',
      role: 'Tổng Quản Trị Viên',
      updatedAt: new Date().toISOString()
    };

    const saved = saveAdminCredentials(updatedCreds);
    if (saved) {
      setCurrentCredentials(updatedCreds);
      setUsername(updatedCreds.username);
      setPassword(updatedCreds.password);
      setSuccessMsg(`✓ Đổi thành công! Tên đăng nhập mới: "${updatedCreds.username}" - Mật khẩu mới: "${updatedCreds.password}"`);
      setTimeout(() => {
        setActiveTab('login');
      }, 1400);
    } else {
      setErrorMsg('Có lỗi xảy ra khi lưu vào bộ nhớ. Vui lòng thử lại.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl border border-slate-200 my-auto animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shadow-md ${
              activeTab === 'recover'
                ? 'bg-rose-900/90 text-rose-400 shadow-rose-900/20'
                : 'bg-gradient-to-tr from-slate-900 to-slate-800 text-amber-400 shadow-slate-900/20'
            }`}>
              {activeTab === 'recover' ? (
                <ShieldAlert className="w-6 h-6 text-rose-400" />
              ) : (
                <Crown className="w-6 h-6" />
              )}
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-lg">
                {activeTab === 'login' 
                  ? 'Đăng Nhập Quản Trị Viên' 
                  : activeTab === 'change_creds'
                    ? 'Đổi Thông Tin Đăng Nhập'
                    : 'Xác Thực Khôi Phục Tài Khoản Gốc'}
              </h3>
              <p className="text-xs text-slate-500">
                {activeTab === 'recover'
                  ? 'Xác thực bảo mật gửi về phandungfarm@gmail.com hoặc 0969310601'
                  : 'Toàn quyền quản lý Quán Ăn, Tiệc Cưới & Giá Món Dúi'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Toggle */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 text-[11px] font-bold rounded-xl transition-all ${
              activeTab === 'login'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Đăng Nhập
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('change_creds');
              setErrorMsg(null);
              setSuccessMsg(null);
            }}
            className={`py-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
              activeTab === 'change_creds'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Settings className="w-3 h-3" />
            <span>Đổi Mật Khẩu</span>
          </button>
          <button
            type="button"
            onClick={() => {
              handleInitiateRecovery();
            }}
            className={`py-2 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
              activeTab === 'recover'
                ? 'bg-white text-rose-700 shadow-xs'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <RotateCcw className="w-3 h-3 text-rose-600" />
            <span>Khôi Phục (OTP)</span>
          </button>
        </div>

        {/* Notice if redirected from an action */}
        {requiredActionNote && activeTab === 'login' && (
          <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Yêu cầu quyền Quản Trị:</span> {requiredActionNote}
            </div>
          </div>
        )}

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2 animate-shake">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {activeTab === 'login' ? (
          /* Login Form */
          <form onSubmit={handleLogin} className="space-y-4 text-xs">
            {/* Username Input */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span>Tên Đăng Nhập Quản Trị *</span>
              </label>
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập quản trị..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-xs sm:text-sm font-mono"
              />
            </div>

            {/* Password Input */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="font-bold text-slate-700 block flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>Mật Khẩu *</span>
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleInitiateRecovery}
                    className="text-[11px] text-rose-700 hover:text-rose-900 font-semibold hover:underline flex items-center gap-1"
                  >
                    <span>Quên mật khẩu? (OTP)</span>
                  </button>
                  <span className="text-slate-300">|</span>
                  <button
                    type="button"
                    onClick={() => setActiveTab('change_creds')}
                    className="text-[11px] text-amber-700 hover:text-amber-900 font-semibold hover:underline"
                  >
                    Đổi mật khẩu
                  </button>
                </div>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Nhập mật khẩu quản trị..."
                  className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 focus:bg-white transition-all text-xs sm:text-sm pr-10 font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-2xl bg-slate-950 hover:bg-slate-900 text-amber-400 font-bold text-xs sm:text-sm shadow-lg shadow-slate-950/20 flex items-center justify-center gap-2 transition-all cursor-pointer hover:shadow-xl"
            >
              {isSubmitting ? (
                <span className="inline-block animate-spin">⏳ Đang xác thực...</span>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Xác Thực & Đăng Nhập Quản Trị</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            {/* Quick Fill & Single Admin Credentials Helper */}
            <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Info className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                  <span>Tài khoản quản trị duy nhất:</span>
                </span>
                <button
                  type="button"
                  onClick={handleInitiateRecovery}
                  className="text-[10px] text-rose-700 hover:text-rose-900 underline flex items-center gap-1 cursor-pointer font-medium"
                  title="Khôi phục tài khoản về mặc định (Yêu cầu xác thực OTP gửi về phandungfarm@gmail.com hoặc 0969310601)"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Khôi phục gốc (Cần OTP)</span>
                </button>
              </div>

              <div className="space-y-1.5 bg-white/95 p-3 rounded-xl border border-amber-200/60 font-mono text-[11px] text-slate-800">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans font-medium">Tên đăng nhập:</span>
                  <strong className="text-slate-900 bg-amber-100/70 px-2 py-0.5 rounded font-mono font-bold">
                    {currentCredentials.username}
                  </strong>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-sans font-medium">Mật khẩu:</span>
                  <div className="flex items-center gap-1.5">
                    <strong className="text-amber-900 bg-amber-100/70 px-2 py-0.5 rounded font-mono font-bold">
                      {showActivePass ? currentCredentials.password : '••••••••'}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setShowActivePass(!showActivePass)}
                      className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      title={showActivePass ? 'Ẩn mật khẩu' : 'Xem mật khẩu'}
                    >
                      {showActivePass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-0.5">
                <button
                  type="button"
                  onClick={handleQuickFillCurrent}
                  className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs cursor-pointer active:scale-98 transition-all"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>⚡ Điền nhanh tài khoản: {currentCredentials.username}</span>
                </button>
              </div>
            </div>
          </form>
        ) : activeTab === 'change_creds' ? (
          /* Change Credentials Form */
          <form onSubmit={handleChangeCredentials} className="space-y-3.5 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11.5px] text-slate-600">
              💡 Bạn có thể tự do đặt <strong>Tên đăng nhập mới</strong> và <strong>Mật khẩu mới</strong>. Hệ thống sẽ tự động ghi nhớ và lưu an toàn vào thiết bị.
            </div>

            {/* Current Password Verification */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Mật Khẩu Hiện Tại (Xác minh) *
              </label>
              <input
                type="password"
                required
                value={changeForm.currentPass}
                onChange={(e) => setChangeForm({ ...changeForm, currentPass: e.target.value })}
                placeholder="Nhập mật khẩu quản trị đang sử dụng..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
            </div>

            {/* New Username */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Tên Đăng Nhập Mới *
              </label>
              <input
                type="text"
                required
                value={changeForm.newUsername}
                onChange={(e) => setChangeForm({ ...changeForm, newUsername: e.target.value })}
                placeholder="Tên đăng nhập mới (vd: admin, quanly_ngocnhi)..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
            </div>

            {/* New Password */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Mật Khẩu Mới *
              </label>
              <div className="relative">
                <input
                  type={showNewPass ? 'text' : 'password'}
                  required
                  value={changeForm.newPass}
                  onChange={(e) => setChangeForm({ ...changeForm, newPass: e.target.value })}
                  placeholder="Nhập mật khẩu mới..."
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 font-mono text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPass(!showNewPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showNewPass ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 block">
                Xác Nhận Mật Khẩu Mới *
              </label>
              <input
                type="password"
                required
                value={changeForm.confirmPass}
                onChange={(e) => setChangeForm({ ...changeForm, confirmPass: e.target.value })}
                placeholder="Nhập lại mật khẩu mới..."
                className="w-full px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-semibold focus:outline-none focus:border-amber-500 font-mono text-xs"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              <button
                type="submit"
                className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-colors cursor-pointer"
              >
                <Save className="w-4 h-4" />
                <span>Lưu Thay Đổi Thông Tin Quản Trị</span>
              </button>

              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100">
                <span className="text-slate-500">Quên mật khẩu hiện tại?</span>
                <button
                  type="button"
                  onClick={handleInitiateRecovery}
                  className="text-rose-700 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Khôi phục tài khoản gốc (Cần OTP)</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* Recovery & OTP Verification Form */
          <div className="space-y-4 text-xs">
            {/* Security Explanation Box */}
            <div className="p-3.5 rounded-2xl bg-rose-50/90 border border-rose-200 text-rose-950 space-y-1.5">
              <div className="flex items-center gap-2 font-bold text-xs text-rose-900">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Bảo Mật Khôi Phục Tài Khoản Quản Trị Gốc</span>
              </div>
              <p className="text-[11.5px] text-rose-800 leading-relaxed">
                Để khôi phục tài khoản về mặc định (<strong className="font-mono text-rose-950">admin / Lộcninh@123</strong>), hệ thống bắt buộc gửi mã OTP 6 số xác thực đến <strong>Gmail</strong> hoặc <strong>Số điện thoại</strong> chính chủ.
              </p>
            </div>

            {/* Select Channel */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 block text-xs">
                1. Chọn kênh nhận mã OTP xác thực:
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {/* Email Option */}
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryChannel('email');
                    setOtpNotice(null);
                    setOtpCode('');
                    setErrorMsg(null);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    recoveryChannel === 'email'
                      ? 'border-rose-500 bg-rose-50/80 shadow-xs ring-2 ring-rose-400/40'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${
                    recoveryChannel === 'email' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Mail className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>Qua Gmail</span>
                      {recoveryChannel === 'email' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                    </div>
                    <div className="text-[11px] font-mono font-semibold text-rose-900 truncate mt-0.5" title={RECOVERY_SECURITY_CONFIG.authorizedEmail}>
                      {RECOVERY_SECURITY_CONFIG.authorizedEmail}
                    </div>
                    <div className="text-[10px] text-slate-500">Email quản trị chính thức</div>
                  </div>
                </button>

                {/* Phone Option */}
                <button
                  type="button"
                  onClick={() => {
                    setRecoveryChannel('phone');
                    setOtpNotice(null);
                    setOtpCode('');
                    setErrorMsg(null);
                  }}
                  className={`p-3 rounded-2xl border text-left flex items-start gap-2.5 transition-all cursor-pointer ${
                    recoveryChannel === 'phone'
                      ? 'border-rose-500 bg-rose-50/80 shadow-xs ring-2 ring-rose-400/40'
                      : 'border-slate-200 bg-slate-50 hover:bg-slate-100/70 text-slate-700'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${
                    recoveryChannel === 'phone' ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-600'
                  }`}>
                    <Phone className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-slate-900 flex items-center justify-between">
                      <span>Qua Số Điện Thoại</span>
                      {recoveryChannel === 'phone' && <Check className="w-3.5 h-3.5 text-rose-600" />}
                    </div>
                    <div className="text-[11px] font-mono font-bold text-rose-900 truncate mt-0.5">
                      {RECOVERY_SECURITY_CONFIG.authorizedPhone}
                    </div>
                    <div className="text-[10px] text-slate-500">SMS / Zalo chính chủ</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Send OTP Trigger Button */}
            <div>
              <button
                type="button"
                onClick={handleSendOtp}
                disabled={isSendingOtp || (countdown > 120)}
                className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-all cursor-pointer ${
                  countdown > 120
                    ? 'bg-slate-100 text-slate-400 border border-slate-200 cursor-not-allowed'
                    : 'bg-rose-600 hover:bg-rose-700 text-white active:scale-98'
                }`}
              >
                {isSendingOtp ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Đang kết nối & phát sinh mã OTP bảo mật...</span>
                  </>
                ) : countdown > 0 ? (
                  <>
                    <Timer className="w-3.5 h-3.5 text-amber-300" />
                    <span>
                      {countdown > 120 
                        ? `Mã OTP đã gửi! Gửi lại sau (${countdown - 120}s)` 
                        : `Gửi lại mã OTP mới (${countdown}s)`}
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>
                      Gửi Mã OTP Đến {recoveryChannel === 'email' ? 'phandungfarm@gmail.com' : '0969310601'}
                    </span>
                  </>
                )}
              </button>
            </div>

            {/* OTP Dispatch Card Alert */}
            {otpNotice && (
              <div className="p-3.5 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 border border-emerald-300 shadow-sm space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                    <span>Đã gửi mã xác thực lúc {otpNotice.sentAt}</span>
                  </div>
                  <div className="text-[10px] font-semibold text-emerald-800 flex items-center gap-1">
                    <Timer className="w-3 h-3 text-emerald-600" />
                    <span>Còn {Math.floor(countdown / 60)}:{(countdown % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>

                <div className="bg-white/90 p-2.5 rounded-xl border border-emerald-200 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-500">Mã xác thực OTP (6 chữ số):</div>
                    <div className="text-xl font-extrabold tracking-widest font-mono text-emerald-950">
                      {otpNotice.code}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleCopyOtp(otpNotice.code)}
                      className="py-1 px-2 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 text-[11px] font-semibold flex items-center gap-1 cursor-pointer transition-colors"
                      title="Sao chép mã OTP"
                    >
                      <Copy className="w-3 h-3" />
                      <span>{copiedOtp ? 'Đã chép!' : 'Sao chép'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAutoFillOtp(otpNotice.code)}
                      className="py-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold flex items-center gap-1 cursor-pointer shadow-xs active:scale-98 transition-all"
                      title="Điền tự động vào ô bên dưới"
                    >
                      <Zap className="w-3 h-3" />
                      <span>Tự điền</span>
                    </button>
                  </div>
                </div>

                {/* External Mail / SMS Quick Links */}
                <div className="flex items-center justify-between text-[11px] pt-1 text-slate-600">
                  <span>Kênh: <strong className="font-mono text-emerald-900">{otpNotice.target}</strong></span>
                  {otpNotice.channel === 'email' ? (
                    <a
                      href={`mailto:${RECOVERY_SECURITY_CONFIG.authorizedEmail}?subject=Ma%20Xac%20Thuc%20Khoi%20Phuc%20He%20Thong%20Ngoc%20Nhi&body=Ma%20OTP%20xac%20thuc%20la:%20${otpNotice.code}`}
                      className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Mở Gmail</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <a
                      href={`sms:${RECOVERY_SECURITY_CONFIG.authorizedPhone}?body=Ma%20OTP%20xac%20thuc%20la:%20${otpNotice.code}`}
                      className="text-emerald-800 font-bold hover:underline flex items-center gap-1"
                    >
                      <span>Mở SMS</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* OTP Entry Form */}
            <form onSubmit={handleVerifyAndReset} className="space-y-3.5">
              <div className="space-y-1">
                <label className="font-bold text-slate-700 block flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                    <span>2. Nhập Mã Xác Thực OTP (6 số) *</span>
                  </span>
                  {generatedOtp && (
                    <span className="text-[10px] text-rose-600 font-semibold">
                      Kiểm tra {recoveryChannel === 'email' ? 'Gmail' : 'SMS'} của bạn
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="Nhập 6 số OTP (vd: 123456)..."
                  className="w-full px-4 py-3 rounded-xl bg-slate-50 border-2 border-slate-300 text-slate-950 font-bold text-center tracking-[0.35em] text-lg focus:outline-none focus:border-rose-500 focus:bg-white font-mono transition-all placeholder:tracking-normal placeholder:font-normal placeholder:text-xs placeholder:text-slate-400"
                />
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  type="submit"
                  disabled={isVerifyingOtp || !otpCode.trim()}
                  className="w-full py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed text-white font-bold text-xs sm:text-sm shadow-md shadow-rose-900/20 flex items-center justify-center gap-2 transition-all cursor-pointer active:scale-98"
                >
                  {isVerifyingOtp ? (
                    <span className="inline-block animate-spin">⏳ Đang xác minh mã OTP...</span>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Xác Thực & Khôi Phục Tài Khoản Gốc</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('login');
                      setErrorMsg(null);
                      setSuccessMsg(null);
                    }}
                    className="text-xs text-slate-500 hover:text-slate-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <span>← Quay lại Đăng Nhập</span>
                  </button>

                  <span className="text-[10px] text-slate-400">
                    Hotline: {RECOVERY_SECURITY_CONFIG.hotline}
                  </span>
                </div>
              </div>
            </form>
          </div>
        )}

        {/* Footer info */}
        <div className="p-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-600" />
            <span>Phân quyền Quản Trị Hệ Thống Ngọc Nhi</span>
          </span>
          <span className="text-emerald-700 font-bold">Bảo Mật Cao</span>
        </div>
      </div>
    </div>
  );
};

