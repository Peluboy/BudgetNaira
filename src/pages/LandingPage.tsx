import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';

const LandingPage: React.FC = () => {
  const isPwaStandalone = typeof window !== 'undefined' && (
    (window.matchMedia && window.matchMedia('(display-mode: standalone)').matches) ||
    // iOS Safari PWA
    (navigator as any).standalone === true
  );
  const shouldShowSplash = Capacitor.isNativePlatform() || isPwaStandalone;

  if (shouldShowSplash) {
    return <Navigate to="/splash" replace />;
  }

  return (
    <div className="min-h-screen w-full bg-[#F7F9FC] text-gray-900">
      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600" />
            <span className="font-semibold text-gray-900">Budget Wise</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-700">
            <a className="hover:text-gray-900" href="#features">Features</a>
            <a className="hover:text-gray-900" href="#pricing">Pricing</a>
            <a className="hover:text-gray-900" href="#resources">Resources</a>
            <a className="hover:text-gray-900" href="#solutions">Solutions</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link to="/login" className="hidden sm:inline text-sm font-medium text-gray-700 hover:text-gray-900">Sign in</Link>
            <Link
              to="/register"
              className="inline-flex items-center justify-center rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Get started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background grid and glow */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-gradient-to-b from-white via-white to-[#F2F6FF]" />
          {/* soft radial glow */}
          <div className="pointer-events-none absolute left-1/2 top-24 -translate-x-1/2 h-[900px] w-[1200px] rounded-[40px] bg-gradient-to-b from-[#2F6BFF] to-[#5B6BFF] opacity-20 blur-3xl" />
          {/* perspective grid (svg) */}
          <svg className="absolute inset-x-0 top-16 mx-auto max-w-[1200px]" viewBox="0 0 1200 400" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#E6ECFF" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width="1200" height="400" fill="url(#grid)" />
          </svg>
        </div>

        <div className="mx-auto max-w-[1200px] px-4 sm:px-6 lg:px-8 pt-16 lg:pt-24">
          {/* Centered hero copy */}
          <div className="text-center max-w-3xl mx-auto">
            <p className="text-[10px] tracking-[0.2em] text-blue-700 font-semibold">#1 PERSONAL FINANCE APP</p>
            <h1 className="mt-4 text-[34px] sm:text-[42px] leading-tight font-extrabold text-gray-900">
              Easy Budgeting Starts Here.
              <br />
              Meet <span className="text-[#2F6BFF]">Budget Wise</span>.
            </h1>
            <p className="mt-4 text-[13px] text-gray-600">
              Trust the all-in-one app designed for easy budgeting and complete financial oversight.
            </p>
            <div className="mt-6 flex items-center justify-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 rounded-full bg-[#2F6BFF] px-4 py-2 text-white text-[13px] font-semibold shadow hover:bg-[#255BDF]">
                Get started
              </Link>
              <a href="#learn" className="text-[13px] font-medium text-gray-700 hover:text-gray-900">Get started for free</a>
            </div>
          </div>

          {/* Device and floating cards block */}
          <div className="relative mt-12">
            <div className="mx-auto h-[480px] w-full max-w-[900px] rounded-[28px] bg-gradient-to-br from-[#2F6BFF] to-[#4A5BFF] p-6 shadow-2xl">
              <div className="relative h-full w-full rounded-[22px] bg-gradient-to-b from-indigo-50/40 to-white/70 flex items-center justify-center overflow-hidden">
                {/* center phone */}
                <div className="relative z-10 h-[360px] w-[180px] rounded-[28px] bg-white shadow-2xl border border-gray-100 flex items-center justify-center">
                  <span className="text-xs text-gray-400">Phone preview</span>
                </div>
                {/* left floating card */}
                <div className="absolute left-10 bottom-16 z-0">
                  <div className="rounded-2xl bg-white/95 shadow-xl border border-gray-100 px-4 py-3">
                    <div className="h-2 w-24 rounded-full bg-[#2F6BFF]/10 mb-2" />
                    <div className="h-3 w-32 rounded-full bg-gray-200" />
                  </div>
                </div>
                {/* right floating card */}
                <div className="absolute right-10 top-16 z-0">
                  <div className="rounded-2xl bg-white/95 shadow-xl border border-gray-100 px-4 py-3">
                    <div className="h-2 w-24 rounded-full bg-[#2F6BFF]/10 mb-2" />
                    <div className="h-3 w-32 rounded-full bg-gray-200" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Logos row */}
          <div className="mt-8 flex items-center justify-center gap-6 text-[11px] tracking-wide text-gray-500">
            <span>Trusted by Media..</span>
            <span className="font-semibold">FORTUNE</span>
            <span className="font-semibold">The CUT</span>
            <span className="font-semibold">WSJ</span>
            <span className="font-semibold">BUSINESS INSIDER</span>
            <span className="font-semibold">USA TODAY</span>
          </div>
        </div>
      </section>

      {/* Feature sections */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid gap-12">
          {/* Financial Picture */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl font-bold text-gray-900">Your Complete Financial Picture</h2>
              <p className="mt-3 text-gray-600 max-w-prose">
                View all your accounts and assets in one simple dashboard for a clear overview of your net worth.
              </p>
              <a href="#learn" className="mt-6 inline-block text-blue-700 font-semibold">Learn more</a>
            </div>
            <div className="order-1 lg:order-2">
              <div className="h-64 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Chart / balances mock</span>
              </div>
            </div>
          </div>

          {/* Set goals */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <div>
              <div className="h-64 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Monthly budget mock</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Set Goals (and hit them)</h2>
              <p className="mt-3 text-gray-600 max-w-prose">
                Create custom budgets, monitor your progress in real‑time, and stay motivated to achieve your financial targets.
              </p>
              <a href="#learn" className="mt-6 inline-block text-blue-700 font-semibold">Learn more</a>
            </div>
          </div>

          {/* Bank sync */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl font-bold text-gray-900">Automatic Bank Sync</h2>
              <p className="mt-3 text-gray-600 max-w-prose">
                Securely connect your bank accounts and let BudgetNaira import transactions automatically, saving you time.
              </p>
              <a href="#learn" className="mt-6 inline-block text-blue-700 font-semibold">Learn more</a>
            </div>
            <div className="order-1 lg:order-2">
              <div className="h-64 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Bank logos mock</span>
              </div>
            </div>
          </div>

          {/* Spending clarity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <div>
              <div className="h-64 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Spending donut mock</span>
              </div>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">See Where Your Money Goes</h2>
              <p className="mt-3 text-gray-600 max-w-prose">
                Effortlessly track your spending by category to understand your habits and find opportunities to save.
              </p>
              <a href="#learn" className="mt-6 inline-block text-blue-700 font-semibold">Learn more</a>
            </div>
          </div>

          {/* Bills and subscriptions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center rounded-[28px] bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <div className="order-2 lg:order-1">
              <h2 className="text-2xl font-bold text-gray-900">Manage Bills & Subscriptions</h2>
              <p className="mt-3 text-gray-600 max-w-prose">
                Never miss a payment or renewal. We centralize your bills and subscriptions for effortless oversight.
              </p>
              <a href="#learn" className="mt-6 inline-block text-blue-700 font-semibold">Learn more</a>
            </div>
            <div className="order-1 lg:order-2">
              <div className="h-64 rounded-2xl bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200 flex items-center justify-center">
                <span className="text-gray-400">Upcoming bills mock</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom stats */}
      <section className="pb-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-100">
            <h3 className="text-center text-xl font-semibold text-gray-900">Real Results, Real Fast</h3>
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
              <div>
                <div className="text-3xl font-extrabold text-blue-700">32%</div>
                <div className="mt-1 text-xs text-gray-500">Savings Boost</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-blue-700">6h</div>
                <div className="mt-1 text-xs text-gray-500">Time Saved Weekly</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-blue-700">2x</div>
                <div className="mt-1 text-xs text-gray-500">Faster Insights</div>
              </div>
              <div>
                <div className="text-3xl font-extrabold text-blue-700">96%</div>
                <div className="mt-1 text-xs text-gray-500">More Control</div>
              </div>
            </div>
            <div className="mt-10 flex justify-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-blue-700"
              >
                Get started
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

