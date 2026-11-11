import React from 'react';
import { UserPlus, PlusCircle, BellRing, LineChart } from 'lucide-react';

const steps = [
  {
    step: '01',
    title: 'Create your StockFlow account',
    description:
      'Sign up in under 60 seconds with your work email and customize your business organization workspace instantly.',
    icon: UserPlus,
  },
  {
    step: '02',
    title: 'Add your products',
    description:
      'Enter your catalog items with names, custom SKUs, cost prices, selling margins, and initial stock counts.',
    icon: PlusCircle,
  },
  {
    step: '03',
    title: 'Track stock and monitor alerts',
    description:
      'Watch real-time quantities update with every cycle. Receive instant visual warnings as items hit your low-stock thresholds.',
    icon: BellRing,
  },
  {
    step: '04',
    title: 'Make better inventory decisions',
    description:
      'Eliminate dead stock, prevent stockouts, forecast replenishment orders accurately, and maximize your cash flow.',
    icon: LineChart,
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">
            Simple 4-Step Process
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            How StockFlow Powers Your Daily Operations
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Get up and running immediately with zero steep learning curve.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="relative bg-slate-50/70 rounded-2xl p-6 border border-slate-200/80 hover:border-indigo-200 transition group"
              >
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-md shadow-indigo-600/20 group-hover:bg-indigo-700 transition">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-slate-300 group-hover:text-indigo-600/30 transition">
                    {item.step}
                  </span>
                </div>
                <h3 className="text-lg font-bold text-slate-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {item.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
