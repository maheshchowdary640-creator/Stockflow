import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Package,
  Boxes,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
  CheckCircle,
  BarChart3,
} from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
      {/* Background radial gradient accent */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/5 blur-3xl rounded-full pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Copy & CTAs */}
          <div className="lg:col-span-6 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-100/80 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
              SaaS Inventory Management System
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.15] mb-6">
              Take Control of Your Inventory.{' '}
              <span className="text-indigo-600">Grow Your Business.</span>
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 mb-8 leading-relaxed max-w-2xl mx-auto lg:mx-0">
              StockFlow helps you manage products, monitor inventory, prevent stockouts, and make smarter business decisions from one simple, intuitive platform.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3.5 justify-center lg:justify-start items-center">
              <Link
                href="/signup"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/25 text-base"
              >
                Get Started Free
                <ArrowRight className="w-4 h-4" />
              </Link>
              <a
                href="#features"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-white border border-slate-200 text-slate-700 font-semibold hover:bg-slate-50 hover:border-slate-300 transition text-base shadow-sm"
              >
                Explore Features
              </a>
            </div>

            {/* Trust highlights */}
            <div className="mt-10 pt-8 border-t border-slate-200/80 grid grid-cols-3 gap-4 text-left max-w-lg mx-auto lg:mx-0">
              <div>
                <p className="text-2xl font-bold text-slate-900">99.9%</p>
                <p className="text-xs text-slate-500 font-medium">Uptime Guarantee</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">Zero</p>
                <p className="text-xs text-slate-500 font-medium">Stockout Surprises</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">&lt; 5 min</p>
                <p className="text-xs text-slate-500 font-medium">Fast Onboarding</p>
              </div>
            </div>
          </div>

          {/* Right Column: Live Dashboard Preview Card */}
          <div className="lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg lg:max-w-none rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/50 p-6 overflow-hidden">
              {/* Fake Dashboard Top Bar */}
              <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">
                    SF
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Acme Supply Co.</p>
                    <p className="text-xs text-slate-400">Inventory Dashboard</p>
                  </div>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-100">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Live Sync
                </span>
              </div>

              {/* Stat Cards Grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">Total Products</span>
                    <Package className="w-4 h-4 text-indigo-600" />
                  </div>
                  <p className="text-xl font-bold text-slate-900">1,428</p>
                  <p className="text-[11px] text-emerald-600 font-medium mt-0.5 flex items-center gap-1">
                    <TrendingUp className="w-3 h-3" /> +12% this month
                  </p>
                </div>

                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">Stock Units</span>
                    <Boxes className="w-4 h-4 text-blue-600" />
                  </div>
                  <p className="text-xl font-bold text-slate-900">14,850</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Across all categories</p>
                </div>

                <div className="bg-amber-50/60 rounded-xl p-3.5 border border-amber-100">
                  <div className="flex items-center justify-between text-amber-700 mb-1">
                    <span className="text-xs font-medium">Low Stock Alerts</span>
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  </div>
                  <p className="text-xl font-bold text-amber-900">3 Items</p>
                  <p className="text-[11px] text-amber-700 font-medium mt-0.5">Needs reorder soon</p>
                </div>

                <div className="bg-slate-50/80 rounded-xl p-3.5 border border-slate-100">
                  <div className="flex items-center justify-between text-slate-500 mb-1">
                    <span className="text-xs font-medium">Inventory Value</span>
                    <IndianRupee className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xl font-bold text-slate-900">₹18,42,000</p>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">Estimated valuation</p>
                </div>
              </div>

              {/* Mini Chart Preview */}
              <div className="bg-slate-50/80 rounded-xl p-4 border border-slate-100 mb-5">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                    <BarChart3 className="w-3.5 h-3.5 text-indigo-600" />
                    Weekly Stock Movement
                  </span>
                  <span className="text-[11px] text-slate-400">Past 7 days</span>
                </div>
                <div className="flex items-end gap-2 h-16 pt-2">
                  {[40, 65, 50, 85, 70, 95, 80].map((val, idx) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div
                        className="w-full bg-indigo-500/80 rounded-t transition-all hover:bg-indigo-600"
                        style={{ height: `${val}%` }}
                      />
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Product List */}
              <div>
                <p className="text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2.5">
                  Recent Products
                </p>
                <div className="space-y-2">
                  {[
                    { name: 'Wireless Barcode Scanner', sku: 'SCAN-BT-01', qty: 42, status: 'In Stock' },
                    { name: 'Thermal Label Rolls (100pk)', sku: 'LBL-ROLL-100', qty: 4, status: 'Low Stock' },
                    { name: 'Ergonomic Warehouse Mouse', sku: 'MS-ERGO-02', qty: 98, status: 'In Stock' },
                  ].map((p, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2.5 rounded-lg bg-white border border-slate-100 text-xs shadow-xs"
                    >
                      <div className="truncate pr-2">
                        <p className="font-medium text-slate-900 truncate">{p.name}</p>
                        <p className="text-slate-400 text-[11px]">{p.sku}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-slate-700">{p.qty} units</span>
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            p.status === 'Low Stock'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
