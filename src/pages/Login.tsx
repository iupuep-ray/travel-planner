import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { ICON_NAMES } from '@/utils/fontawesome';
import { useAuth } from '@/contexts/AuthContext';
import { LOCAL_IMAGES } from '@/config/images';
import { auth } from '@/lib/firebase';

const Login = () => {
  const navigate = useNavigate();
  const { signIn, signUp } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    displayName: '',
  });
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isFirebaseConfigured, setIsFirebaseConfigured] = useState(true);

  useEffect(() => {
    // 檢查 Firebase 是否已配置
    setIsFirebaseConfigured(!!auth);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.displayName) {
          setError('請輸入姓名');
          setLoading(false);
          return;
        }
        await signUp(formData.email, formData.password, formData.displayName);
        // 註冊成功後切換到登入模式
        setIsSignUp(false);
        setFormData({ email: formData.email, password: '', displayName: '' });
        setSuccessMessage('註冊成功！請登入');
        setLoading(false);
        return;
      } else {
        await signIn(formData.email, formData.password);
      }
      navigate('/');
    } catch (err: any) {
      console.error('Auth error:', err);
      // Firebase 錯誤訊息翻譯
      if (err.message === '此帳號已被停用') {
        setError('此帳號已被停用');
      } else if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        setError('帳號或密碼錯誤');
      } else if (err.code === 'auth/email-already-in-use') {
        setError('此 Email 已被註冊');
      } else if (err.code === 'auth/weak-password') {
        setError('密碼強度不足（至少 6 個字元）');
      } else if (err.code === 'auth/invalid-email') {
        setError('Email 格式不正確');
      } else {
        setError('發生錯誤，請稍後再試');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      {/* Firebase 未配置警告 */}
      {!isFirebaseConfigured && (
        <div className="absolute top-4 left-4 right-4 z-20">
          <div className="rounded-[20px] bg-yellow-100 border-2 border-yellow-400 p-4 shadow-soft">
            <div className="flex items-start gap-3">
              <FontAwesomeIcon
                icon={['fas', 'triangle-exclamation' as any]}
                className="text-yellow-600 text-xl mt-0.5"
              />
              <div>
                <h3 className="font-bold text-yellow-800 mb-1">Firebase 尚未配置</h3>
                <p className="text-sm text-yellow-700">
                  請參考專案根目錄的 <code className="bg-yellow-200 px-1 rounded">FIREBASE_SETUP.md</code> 檔案進行 Firebase 設定
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div
          className="rounded-[40px] shadow-soft-lg p-8"
          style={{ backgroundColor: '#FDFAF3' }}
        >
          {/* Logo / Title */}
          <div className="text-center mb-8">
            <div className="inline-block mb-4">
              <img
                src={LOCAL_IMAGES.decorative.leaves}
                alt="旅遊手帳"
                className="w-24 h-24 object-contain mx-auto"
              />
            </div>
            <h1 className="text-3xl font-bold text-brown mb-2">旅遊手帳</h1>
            <p className="text-brown opacity-60">動森風格團體旅遊規劃</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Display Name (Sign Up only) */}
            {isSignUp && (
              <div>
                <label className="block text-sm font-bold text-brown mb-2">
                  姓名
                  <span className="text-accent ml-1">*</span>
                </label>
                <input
                  type="text"
                  required={isSignUp}
                  value={formData.displayName}
                  onChange={(e) => setFormData({ ...formData, displayName: e.target.value })}
                  className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
                  placeholder="例如：小明"
                />
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-bold text-brown mb-2">
                Email
                <span className="text-accent ml-1">*</span>
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
                placeholder="example@email.com"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-bold text-brown mb-2">
                密碼
                <span className="text-accent ml-1">*</span>
              </label>
              <input
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 rounded-[20px] bg-white border-2 border-cream focus:border-primary outline-none transition-colors text-brown"
                placeholder="至少 6 個字元"
                minLength={6}
              />
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className="p-3 rounded-[20px] bg-green-100 text-green-600 text-sm text-center">
                {successMessage}
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="p-3 rounded-[20px] bg-red-100 text-red-600 text-sm text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-[24px] bg-primary text-white font-bold shadow-soft transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? '處理中...' : isSignUp ? '註冊帳號' : '登入'}
            </button>
          </form>

          {/* Toggle Sign In / Sign Up */}
          <div className="text-center mt-6">
            <button
              type="button"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
                setSuccessMessage('');
              }}
              className="text-primary font-bold hover:underline"
            >
              {isSignUp ? '已有帳號？返回登入' : '還沒有帳號？立即註冊'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
