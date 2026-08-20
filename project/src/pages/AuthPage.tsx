import { useState } from 'react';
import { Pill, Mail, Lock, User as UserIcon, Phone, MapPin, ArrowRight, Loader2, Shield, Sparkles, AlertCircle } from 'lucide-react';
import { supabase, type Role } from '@/lib/supabase';
import RoleSelector from '@/components/ui/RoleSelector';
import ThemeToggle from '@/components/ThemeToggle';

type Mode = 'login' | 'signup';

export default function AuthPage({ mode }: { mode: Mode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (mode === 'signup' && !role) {
      setError('Please select an account type.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);

    if (mode === 'signup') {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }
      if (data.user) {
        const { error: profileError } = await supabase.from('profiles').insert({
          id: data.user.id,
          full_name: fullName,
          role: role!,
          phone: phone || null,
          city: city || null,
        });
        if (profileError) {
          setError('Account created, but profile setup failed. Please try logging in.');
          setLoading(false);
          return;
        }
      }
      setLoading(false);
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError(signInError.message);
        setLoading(false);
      }
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* Left panel — brand */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 rounded-full bg-white blur-3xl animate-float" />
          <div className="absolute bottom-20 right-20 w-96 h-96 rounded-full bg-secondary-300 blur-3xl animate-float-delayed" />
        </div>
        <div className="absolute top-1/4 left-1/3 text-white/10 animate-float">
          <Pill size={48} />
        </div>
        <div className="absolute bottom-1/3 right-1/4 text-white/10 animate-float-delayed">
          <Shield size={40} />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="flex items-center gap-3 mb-8 animate-slide-up">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center shadow-lg">
              <Pill size={26} />
            </div>
            <span className="text-2xl font-bold tracking-tight">MedTrack</span>
          </div>
          <h1 className="text-4xl font-bold leading-tight mb-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            Don't let medicines<br />go to waste.
          </h1>
          <p className="text-primary-100 text-lg leading-relaxed max-w-md animate-slide-up" style={{ animationDelay: '200ms' }}>
            Connect surplus medicines with people, NGOs, and hospitals who need them.
            Track expiry dates, donate what you can't use, and save lives.
          </p>
          <div className="mt-12 space-y-4">
            {[
              'List medicines you want to donate',
              'See what NGOs and hospitals need',
              'Get reminders before medicines expire',
              'Find organizations on the map',
            ].map((point, i) => (
              <div
                key={point}
                style={{ animationDelay: `${300 + i * 80}ms` }}
                className="flex items-center gap-3 text-primary-50 animate-slide-up"
              >
                <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
                  <ArrowRight size={14} />
                </div>
                <span>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 bg-gray-50 dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-100/30 dark:bg-primary-900/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3" />

        {/* Theme toggle */}
        <div className="absolute top-6 right-6 z-10">
          <ThemeToggle />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Mobile brand */}
          <div className="lg:hidden flex items-center gap-2.5 mb-8 justify-center animate-scale-in">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-md">
              <Pill size={22} />
            </div>
            <span className="text-xl font-bold text-gray-900 dark:text-gray-100">MedTrack</span>
          </div>

          <div className="animate-slide-up">
            {mode === 'signup' && (
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 text-sm font-medium mb-3 border border-primary-200/50 dark:border-primary-900/50">
                <Sparkles size={14} className="animate-bounce-subtle" />
                Join the network
              </div>
            )}
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-1">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {mode === 'login'
                ? 'Sign in to manage your medicines and donations.'
                : 'Join the medicine donation network today.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
            {mode === 'signup' && (
              <>
                <div>
                  <label className="label">Account type</label>
                  <RoleSelector value={role} onChange={setRole} />
                </div>
                <div>
                  <label className="label" htmlFor="fullName">
                    {role === 'ngo' ? 'NGO name' : role === 'hospital' ? 'Hospital name' : 'Full name'}
                  </label>
                  <div className="relative group">
                    <UserIcon size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      id="fullName"
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="input pl-10"
                      placeholder={role === 'ngo' ? 'Hope Foundation' : role === 'hospital' ? 'City Care Hospital' : 'John Doe'}
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="label" htmlFor="email">Email</label>
              <div className="relative group">
                <Mail size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="input pl-10"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="password">Password</label>
              <div className="relative group">
                <Lock size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            {mode === 'signup' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="label" htmlFor="phone">Phone (optional)</label>
                  <div className="relative group">
                    <Phone size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      id="phone"
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="input pl-10"
                      placeholder="+91 98765 43210"
                    />
                  </div>
                </div>
                <div>
                  <label className="label" htmlFor="city">City (optional)</label>
                  <div className="relative group">
                    <MapPin size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                    <input
                      id="city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="input pl-10"
                      placeholder="Mumbai"
                    />
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="rounded-xl bg-error-50 dark:bg-error-950/30 border border-error-200 dark:border-error-900/50 px-4 py-3 text-sm text-error-700 dark:text-error-400 animate-scale-in flex items-start gap-2">
                <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-primary w-full text-base py-3">
              {loading ? (
                <Loader2 size={20} className="animate-spin" />
              ) : mode === 'login' ? (
                <>
                  Sign in <ArrowRight size={18} />
                </>
              ) : (
                <>
                  Create account <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
            {mode === 'login' ? (
              <>
                Don't have an account?{' '}
                <a href="/signup" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign up</a>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <a href="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">Sign in</a>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
