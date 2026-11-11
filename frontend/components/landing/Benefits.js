import React from 'react';
import { Store, ShoppingCart, Briefcase, TrendingUp, Check } from 'lucide-react';

const segments = [
  {
    title: 'Small Businesses',
    description:
      'Ditch fragile spreadsheets for an intuitive cloud system that saves hours of weekly stock counting and manual audits.',
    icon: Briefcase,
    benefits: [
      'Centralized real-time catalog',
      'No complicated enterprise setup',
      'Instant product lookup by SKU',
    ],
  },
  {
    title: 'Retail Stores',
    description:
      'Keep shelves stocked, monitor physical counts accurately, and avoid lost sales from unexpected out-of-stock items.',
    icon: Store,
    benefits: [
      'Rapid stock level adjustment',
      'Clear low-stock threshold triggers',
      'Cost price vs selling price visibility',
    ],
  },
  {
    title: 'Online Sellers & E-Commerce',
    description:
      'Stay in total control of dispatch velocity across e-commerce channels with fast inventory sync and accurate stock logs.',
    icon: ShoppingCart,
    benefits: [
      'Prevent overselling and backorders',
      'Total inventory valuation metrics',
      'Clean SKU standardizations',
    ],
  },
  {
    title: 'Growing Businesses',
    description:
      'Scale from 50 to 50,000 product units with confidence, backed by high-performance multi-tenant PostgreSQL architecture.',
    icon: TrendingUp,
    benefits: [
      'Multi-tenant database security',
      'Audit-ready data consistency',
      'Prepared for team expansion',
    ],
  },
];

export default function Benefits() {
  return (
    <section id="benefits" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">
            Tailored For Growth
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Built for Modern Commerce at Any Stage
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            See how StockFlow brings effortless clarity to physical, digital, and hybrid merchants.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {segments.map((seg, idx) => {
            const Icon = seg.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-8 border border-slate-200/80 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center gap-3.5 mb-4">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{seg.title}</h3>
                      <p className="text-xs text-slate-400 font-medium">Use Case Spotlight</p>
                    </div>
                  </div>
                  <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                    {seg.description}
                  </p>
                </div>

                <div className="pt-5 border-t border-slate-100 space-y-2.5">
                  {seg.benefits.map((b, bIdx) => (
                    <div key={bIdx} className="flex items-center gap-2.5 text-xs font-medium text-slate-700">
                      <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center flex-shrink-0">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
