import { useEffect, useState, useRef } from 'react';
import {
  Pill, HeartHandshake, Building2, Users, ArrowRight, Shield,
  Bell, MapPin, Search, HandHeart, Clock, TrendingDown, Sparkles,
  Package, CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase, type MedicineWithOwner } from '@/lib/supabase';
import { expiryLabel, expiryStatus } from '@/lib/utils';
import { useAuth } from '@/lib/auth';
import { useCountUp } from '@/lib/useCountUp';
import ThemeToggle from '@/components/ThemeToggle';

const expiryColors: Record<string, string> = {
  expired: 'bg-error-100 text-error-700 border-error-200 dark:bg-error-950/40 dark:text-error-400 dark:border-error-900/50',
  critical: 'bg-error-100 text-error-700 border-error-200 dark:bg-error-950/40 dark:text-error-400 dark:border-error-900/50',
  soon: 'bg-warning-100 text-warning-700 border-warning-200 dark:bg-warning-950/40 dark:text-warning-400 dark:border-warning-900/50',
  safe: 'bg-success-100 text-success-700 border-success-200 dark:bg-success-950/40 dark:text-success-400 dark:border-success-900/50',
  none: 'bg-gray-100 text-gray-600 border-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-700',
};

function AnimatedStat({ value, label, delay }: { value: number; label: string; delay: number }) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const counted = useCountUp(value, 1200, inView);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setInView(true),
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ animationDelay: `${delay}ms` }} className="animate-slide-up">
      <div className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 tabular-nums">{counted}</div>
      <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{label}</div>
    </div>
  );
}

export default function LandingPage() {
  const { session } = useAuth();
  const [stats, setStats] = useState({ medicines: 0, orgs: 0 });
  const [featured, setFeatured] = useState<MedicineWithOwner[]>([]);

  useEffect(() => {
    (async () => {
      const [{ count: medCount }, { count: orgCount }, { data: meds }] = await Promise.all([
        supabase.from('medicines').select('*', { count: 'exact', head: true }).eq('listing_type', 'donate').eq('status', 'available'),
        supabase.from('profiles').select('*', { count: 'exact', head: true }).in('role', ['ngo', 'hospital']),
        supabase
          .from('medicines')
          .select('*, owner:profiles!medicines_owner_id_fkey(id, full_name, role, phone, city, address, latitude, longitude)')
          .eq('listing_type', 'donate')
          .eq('status', 'available')
          .order('created_at', { ascending: false })
          .limit(6),
      ]);
      setStats({ medicines: medCount || 0, orgs: orgCount || 0 });
      setFeatured((meds as MedicineWithOwner[]) || []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Nav */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-gray-950/80 backdrop-blur-lg border-b border-gray-100 dark:border-gray-800 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 text-white flex items-center justify-center shadow-sm group-hover:shadow-md group-hover:scale-105 transition-all duration-200">
              <Pill size={20} />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-gray-100 tracking-tight">MedTrack</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-600 dark:text-gray-400">
            <a href="#how" className="relative hover:text-primary-600 dark:hover:text-primary-400 transition-colors after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary-600 dark:after:bg-primary-400 hover:after:w-full after:transition-all after:duration-300">How it works</a>
            <a href="#features" className="relative hover:text-primary-600 dark:hover:text-primary-400 transition-colors after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary-600 dark:after:bg-primary-400 hover:after:w-full after:transition-all after:duration-300">Features</a>
            <a href="#browse" className="relative hover:text-primary-600 dark:hover:text-primary-400 transition-colors after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-0.5 after:bg-primary-600 dark:after:bg-primary-400 hover:after:w-full after:transition-all after:duration-300">Browse</a>
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {session ? (
              <Link to="/dashboard" className="btn-primary text-sm">
                Dashboard <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost text-sm hidden sm:inline-flex">Sign in</Link>
                <Link to="/signup" className="btn-primary text-sm">Get started <ArrowRight size={16} /></Link>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary-50 via-white to-white dark:from-primary-950/20 dark:via-gray-950 dark:to-gray-950 transition-colors duration-300" />
        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-primary-100/40 dark:bg-primary-900/10 rounded-full blur-3xl -translate-y-1/3 translate-x-1/3 animate-float" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary-100/30 dark:bg-secondary-900/10 rounded-full blur-3xl translate-y-1/3 animate-float-delayed" />
        <div className="absolute top-32 left-10 text-primary-200 dark:text-primary-800 animate-float opacity-50 hidden lg:block">
          <Pill size={40} />
        </div>
        <div className="absolute bottom-40 right-20 text-secondary-200 dark:text-secondary-800 animate-float-delayed opacity-40 hidden lg:block">
          <HeartHandshake size={36} />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-24 lg:pt-24 lg:pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="animate-slide-up">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-100 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 text-sm font-medium mb-6 border border-primary-200/50 dark:border-primary-900/50">
                <Sparkles size={15} className="animate-bounce-subtle" />
                Reducing medicine waste, together
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-gray-100 leading-[1.1] tracking-tight mb-6">
                Don't let medicines<br />
                <span className="gradient-text">go to waste.</span>
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed mb-8 max-w-xl">
                Connect your surplus medicines with NGOs, hospitals, and people who need them.
                Track expiry dates, donate what you can't use, and help save lives across India.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link to="/signup" className="btn-primary text-base px-6 py-3">
                  Start donating <ArrowRight size={18} />
                </Link>
                <a href="#how" className="btn-secondary text-base px-6 py-3">
                  How it works
                </a>
              </div>

              <div className="flex items-center gap-8 mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">
                <AnimatedStat value={stats.medicines} label="Medicines listed" delay={0} />
                <AnimatedStat value={stats.orgs} label="Organizations" delay={100} />
                <AnimatedStat value={3} label="Account types" delay={200} />
              </div>
            </div>

            {/* Hero illustration card */}
            <div className="hidden lg:block animate-fade-in">
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-tr from-primary-200 to-secondary-200 dark:from-primary-900/30 dark:to-secondary-900/30 rounded-[2rem] blur-2xl opacity-50 animate-pulse-slow" />
                <div className="relative card-glass p-6 rounded-[2rem]">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Available for donation</div>
                      <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">Near you</div>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center shadow-md animate-float">
                      <HandHeart size={24} />
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { name: 'Paracetamol 500mg', org: 'City Care Hospital', days: '15 days', color: 'bg-success-100 text-success-700 dark:bg-success-950/40 dark:text-success-400', icon: Pill },
                      { name: 'Vitamin D3 Tablets', org: 'Hope Foundation', days: '45 days', color: 'bg-success-100 text-success-700 dark:bg-success-950/40 dark:text-success-400', icon: Pill },
                      { name: 'Cough Syrup 100ml', org: 'Rahul S.', days: '3 days', color: 'bg-warning-100 text-warning-700 dark:bg-warning-950/40 dark:text-warning-400', icon: Bell },
                    ].map((m, i) => {
                      const Icon = m.icon;
                      return (
                        <div
                          key={m.name}
                          style={{ animationDelay: `${i * 120}ms` }}
                          className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 dark:border-gray-800 hover:border-primary-200 dark:hover:border-primary-800 hover:bg-primary-50/50 dark:hover:bg-primary-950/20 hover:shadow-sm hover:translate-x-1 transition-all duration-200 animate-slide-up cursor-default"
                        >
                          <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center flex-shrink-0">
                            <Icon size={18} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-gray-800 dark:text-gray-200 text-sm truncate">{m.name}</div>
                            <div className="text-xs text-gray-500 dark:text-gray-400">{m.org}</div>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${m.color}`}>{m.days}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                      <span className="flex -space-x-1.5">
                        <span className="w-6 h-6 rounded-full bg-primary-400 border-2 border-white dark:border-gray-900" />
                        <span className="w-6 h-6 rounded-full bg-secondary-400 border-2 border-white dark:border-gray-900" />
                        <span className="w-6 h-6 rounded-full bg-accent-400 border-2 border-white dark:border-gray-900" />
                      </span>
                      Active community
                    </div>
                    <Link to="/signup" className="text-xs text-primary-600 dark:text-primary-400 font-medium hover:underline inline-flex items-center gap-1">
                      Join now <ArrowRight size={12} />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="py-20 lg:py-28 bg-white dark:bg-gray-950 relative overflow-hidden transition-colors duration-300">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary-50 dark:bg-primary-950/20 rounded-full blur-3xl opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-secondary-50 dark:bg-secondary-950/40 text-secondary-700 dark:text-secondary-400 text-sm font-medium mb-4 border border-secondary-100 dark:border-secondary-900/50">
              <Sparkles size={14} />
              Simple process
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">How it works</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              Three simple steps to start making a difference with your unused medicines.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: Users, title: 'Create your account', desc: 'Sign up as an individual, NGO, or hospital. Set up your profile with contact details and location.', gradient: 'from-primary-400 to-primary-600' },
              { icon: Pill, title: 'List your medicines', desc: 'Add medicines you want to donate or post requests for what you need. Set expiry dates and quantities.', gradient: 'from-secondary-400 to-secondary-600' },
              { icon: HeartHandshake, title: 'Connect & donate', desc: 'Browse the directory, find matches, and coordinate pickup or delivery. Save medicines from going to waste.', gradient: 'from-accent-400 to-accent-600' },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  style={{ animationDelay: `${i * 120}ms` }}
                  className="relative card p-8 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 animate-slide-up group"
                >
                  <div className="absolute top-6 right-6 text-6xl font-bold text-gray-100 dark:text-gray-800 group-hover:text-primary-50 dark:group-hover:text-primary-950/50 transition-colors duration-300">{i + 1}</div>
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} text-white flex items-center justify-center mb-5 shadow-md group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                    <Icon size={26} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 relative">{step.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed relative">{step.desc}</p>
                  {i < 2 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 z-10 text-gray-200 dark:text-gray-700">
                      <ArrowRight size={24} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900/50 relative overflow-hidden transition-colors duration-300">
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary-50 dark:bg-secondary-950/20 rounded-full blur-3xl opacity-50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-accent-50 dark:bg-accent-950/40 text-accent-700 dark:text-accent-400 text-sm font-medium mb-4 border border-accent-100 dark:border-accent-900/50">
              <Shield size={14} />
              Full-featured platform
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">Everything you need</h2>
            <p className="text-lg text-gray-500 dark:text-gray-400 max-w-2xl mx-auto">
              A complete platform built to reduce medicine waste and improve access for everyone.
            </p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Bell, title: 'Expiry reminders', desc: 'Get notified before your medicines expire so you can donate or use them in time.', gradient: 'from-warning-400 to-warning-600' },
              { icon: MapPin, title: 'Interactive map', desc: 'Find NGOs and hospitals near you with an integrated location map.', gradient: 'from-secondary-400 to-secondary-600' },
              { icon: Search, title: 'Search & filter', desc: 'Find medicines by name, category, or location. Filter donations and requests.', gradient: 'from-primary-400 to-primary-600' },
              { icon: Shield, title: 'Role-based access', desc: 'Separate dashboards for individuals, NGOs, and hospitals with tailored views.', gradient: 'from-accent-400 to-accent-600' },
              { icon: Clock, title: 'Track status', desc: 'Monitor medicine status from available to reserved to fulfilled.', gradient: 'from-primary-400 to-secondary-500' },
              { icon: TrendingDown, title: 'Reduce waste', desc: 'Keep medicines out of landfills and get them to people who need them.', gradient: 'from-success-400 to-success-600' },
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  style={{ animationDelay: `${i * 80}ms` }}
                  className="card p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up group"
                >
                  <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${f.gradient} text-white flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={22} />
                  </div>
                  <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-1.5">{f.title}</h3>
                  <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured medicines */}
      {featured.length > 0 && (
        <section id="browse" className="py-20 bg-white dark:bg-gray-950 transition-colors duration-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-10">
              <div>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-success-50 dark:bg-success-950/40 text-success-700 dark:text-success-400 text-sm font-medium mb-3 border border-success-100 dark:border-success-900/50">
                  <CheckCircle2 size={14} />
                  Live listings
                </div>
                <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Available now</h2>
                <p className="text-gray-500 dark:text-gray-400">Recently listed medicines ready for donation.</p>
              </div>
              <Link to="/signup" className="btn-ghost text-sm hidden sm:inline-flex group">
                View all <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {featured.map((med, i) => {
                const status = expiryStatus(med.expiry_date);
                return (
                  <div
                    key={med.id}
                    style={{ animationDelay: `${i * 80}ms` }}
                    className="card p-5 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 animate-slide-up group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-primary-400 to-primary-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 flex items-center justify-center group-hover:bg-primary-100 dark:group-hover:bg-primary-900/40 group-hover:scale-110 transition-all duration-300">
                          <Pill size={18} />
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-gray-100 leading-tight">{med.name}</div>
                          {med.generic_name && <div className="text-xs text-gray-500 dark:text-gray-400">{med.generic_name}</div>}
                        </div>
                      </div>
                      {med.category && (
                        <span className="text-xs px-2 py-1 rounded-full bg-secondary-50 dark:bg-secondary-950/40 text-secondary-700 dark:text-secondary-400 font-medium whitespace-nowrap">
                          {med.category}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-50 dark:border-gray-800">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {med.quantity} units · {med.owner?.full_name || 'Anonymous'}
                      </div>
                      <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${expiryColors[status]}`}>
                        {expiryLabel(med.expiry_date)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-gradient-to-br from-primary-600 via-primary-700 to-secondary-800 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 rounded-full bg-white blur-3xl animate-float" />
          <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-secondary-300 blur-3xl animate-float-delayed" />
        </div>
        <div className="absolute top-20 left-1/4 text-white/10 animate-float hidden lg:block">
          <Pill size={48} />
        </div>
        <div className="absolute bottom-20 right-1/4 text-white/10 animate-float-delayed hidden lg:block">
          <HandHeart size={44} />
        </div>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Ready to make a difference?</h2>
          <p className="text-primary-100 text-lg mb-8 max-w-2xl mx-auto">
            Join MedTrack today and turn your unused medicines into lifelines for those in need.
          </p>
          <Link to="/signup" className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-primary-700 font-semibold shadow-lg hover:scale-105 hover:shadow-xl active:scale-95 transition-all duration-200">
            Get started free <ArrowRight size={18} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-gray-900 dark:bg-black text-gray-400 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-400 to-primary-600 text-white flex items-center justify-center">
                <Pill size={18} />
              </div>
              <span className="font-bold text-white">MedTrack</span>
            </div>
            <p className="text-sm text-center md:text-right">
              Reducing medicine waste, one donation at a time.
            </p>
          </div>
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">Made by Kanchan Borole</p>
            <p className="text-xs text-gray-600 mt-1">Built during internship at Talking Crooks IT Pvt. Ltd.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
