import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

function getErrorMessage(code: string): string {
  const messages: Record<string, string> = {
    'auth/email-already-in-use': '此電子郵件已被使用',
    'auth/invalid-email': '電子郵件格式不正確',
    'auth/weak-password': '密碼至少需要 6 個字元',
    'auth/user-not-found': '找不到此帳號',
    'auth/wrong-password': '密碼錯誤',
    'auth/invalid-credential': '帳號或密碼錯誤',
    'auth/too-many-requests': '嘗試次數過多，請稍後再試',
  };
  return messages[code] ?? '發生錯誤，請再試一次';
}

export default function AuthModal() {
  const { signIn, signUp, playAsGuest } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      await signIn(email, password);
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('兩次密碼不一致');
      return;
    }
    setSubmitting(true);
    try {
      await signUp(email, password);
    } catch (err: any) {
      setError(getErrorMessage(err.code));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGuest = async () => {
    setSubmitting(true);
    try {
      await playAsGuest();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-amber-950/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-amber-50 rounded-2xl p-8 w-full max-w-md shadow-2xl border-2 border-amber-300">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🏴‍☠️</div>
          <h1 className="text-2xl font-bold text-amber-900">寶藏獵人遊戲</h1>
          <p className="text-amber-700 text-sm mt-1">登入以記錄你的冒險成績</p>
        </div>

        <Tabs defaultValue="login" onValueChange={() => setError('')}>
          <TabsList className="grid grid-cols-2 w-full mb-4 bg-amber-200">
            <TabsTrigger
              value="login"
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              登入
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className="data-[state=active]:bg-amber-600 data-[state=active]:text-white"
            >
              註冊
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="login-email" className="text-amber-900">電子郵件</Label>
                <Input
                  id="login-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="border-amber-300 focus-visible:ring-amber-500"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="login-password" className="text-amber-900">密碼</Label>
                <Input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  className="border-amber-300 focus-visible:ring-amber-500"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {submitting ? '登入中…' : '登入'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div className="space-y-1">
                <Label htmlFor="reg-email" className="text-amber-900">電子郵件</Label>
                <Input
                  id="reg-email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  required
                  className="border-amber-300 focus-visible:ring-amber-500"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-password" className="text-amber-900">密碼</Label>
                <Input
                  id="reg-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="至少 6 個字元"
                  required
                  className="border-amber-300 focus-visible:ring-amber-500"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="reg-confirm" className="text-amber-900">確認密碼</Label>
                <Input
                  id="reg-confirm"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••"
                  required
                  className="border-amber-300 focus-visible:ring-amber-500"
                />
              </div>
              {error && <p className="text-red-600 text-sm">{error}</p>}
              <Button
                type="submit"
                disabled={submitting}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
              >
                {submitting ? '註冊中…' : '建立帳號'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="relative my-5">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-amber-300" />
          </div>
          <div className="relative flex justify-center">
            <span className="px-3 bg-amber-50 text-amber-600 text-sm">或</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={handleGuest}
          disabled={submitting}
          className="w-full border-amber-400 text-amber-800 hover:bg-amber-100"
        >
          👻 以訪客身份遊玩（不記錄成績）
        </Button>
      </div>
    </div>
  );
}
