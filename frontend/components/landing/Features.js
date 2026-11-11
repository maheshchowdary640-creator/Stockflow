import React from 'react';
import {
  Package,
  Activity,
  AlertTriangle,
  BarChart3,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';

const features = [
  {
    title: 'Product Management',
    description:
      'Easily catalog your complete product portfolio with standardized SKUs, detailed descriptions, and custom cost and selling price valuations.',
    icon: Package,
    color: 'text-indigo-600 bg-indigo-50 border-indigo-100',
  },
  {
    title: 'Real-Time Stock Tracking',
    description:
      'Monitor exact quantities on hand across your inventory. Never second-guess what is in stock, reserved, or ready for fulfillment.',
    icon: Activity,
    color: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    title: 'Low Stock Alerts',
    description:
      'Automatic threshold warnings alert you before products run dry. Avoid costly stockouts and prevent disappointed customers.',
    icon: AlertTriangle,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
  },
  {
    title: 'Inventory Analytics',
    description:
      'Gain immediate visibility into total inventory value, unit distribution, and top product velocity with concise visual dashboards.',
    icon: BarChart3,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-100',
  },
  {
    title: 'Secure Organization Workspace',
    description:
      'Full multi-tenant data isolation backed by PostgreSQL Row Level Security (RLS). Your business catalog belongs strictly to your organization.',
    icon: ShieldCheck,
    color: 'text-purple-600 bg-purple-50 border-purple-100',
  },
  {
    title: 'Simple Inventory Management',
    description:
      'Zero bloat, zero endless setup. Designed specifically for modern businesses who need an uncluttered, fast workflow without training manuals.',
    icon: Sparkles,
    color: 'text-rose-600 bg-rose-50 border-rose-100',
  },
];

export default function Features() {
  return (
    <section id="features" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-indigo-600 mb-3">
            Core Capabilities
          </h2>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Everything You Need to Run Seamless Inventory
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            StockFlow eliminates messy spreadsheets and overcomplicated enterprise software, replacing them with speed and clarity.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl p-7 border border-slate-200/80 shadow-xs hover:shadow-md transition-all group"
              >
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center border mb-5 ${feature.color} transition-transform group-hover:scale-105`}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2.5">
                  {feature.title}
                </h3>
                <p className="text-sm text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
