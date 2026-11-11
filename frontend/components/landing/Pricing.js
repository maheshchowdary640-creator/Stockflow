import React from 'react';
import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

const plans = [
  {
    name: 'Starter / Free',
    badge: 'Free Forever',
    price: '$0',
    frequency: 'free during beta',
    description: 'Perfect for small shops, boutiques, and solopreneurs organizing their initial inventory.',
    features: [
      'Up to 100 products',
      'Real-time stock level tracking',
      'Automatic low-stock threshold alerts',
      'Single organization workspace',
      'Community & email support',
    ],
    cta: 'Get Started Free',
    href: '/signup',
    popular: false,
  },
  {
    name: 'Professional',
    badge: 'Most Popular',
    price: '$29',
    frequency: 'illustrative / coming soon',
    description: 'Ideal for established retail and growing e-commerce businesses scaling catalog operations.',
    features: [
      'Unlimited products & SKUs',
      'Customizable threshold alerts',
      'Complete inventory analytics & valuation',
      'Multi-user team members',
      'Priority email & chat support',
    ],
    cta: 'Coming Soon',
    href: '/signup',
    popular: true,
  },
  {
    name: 'Business',
    badge: 'Enterprise Grade',
    price: '$79',
    frequency: 'illustrative / coming soon',
    description: 'High-volume businesses requiring custom integrations and dedicated support.',
    features: [
      'Everything in Professional',
      'Multi-channel inventory sync (Planned)',
      'Bulk CSV product import & export',
      'Dedicated account manager',
      '99.99% uptime SLA',
    ],
    cta: 'Coming Soon',
    href: '/signup',
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-20 bg-white border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Transparent Pricing
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Simple, Transparent Plans That Scale With You
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Start completely free. Upgrade only when your product volume and operations demand it.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-stretch">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`rounded-2xl p-8 flex flex-col justify-between transition-all ${
                plan.popular
                  ? 'bg-white border-2 border-indigo-600 shadow-xl shadow-indigo-600/10 relative'
                  : 'bg-slate-50/70 border border-slate-200/80 shadow-xs'
              }`}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-indigo-600 text-white text-[11px] font-bold tracking-wider uppercase shadow-sm">
                  {plan.badge}
                </span>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-slate-900">{plan.name}</h3>
                  {!plan.popular && (
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-200/70 text-slate-700">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <div className="flex items-baseline gap-1.5 mb-2">
                  <span className="text-4xl font-extrabold text-slate-900">{plan.price}</span>
                  <span className="text-xs text-slate-500 font-medium">/ month</span>
                </div>
                <p className="text-[11px] text-indigo-600 font-semibold uppercase tracking-wider mb-4">
                  ({plan.frequency})
                </p>

                <p className="text-sm text-slate-600 mb-6 leading-relaxed">
                  {plan.description}
                </p>

                <div className="pt-6 border-t border-slate-200/80 space-y-3 mb-8">
                  <p className="text-xs font-semibold text-slate-800 uppercase tracking-wider">
                    Included Capabilities:
                  </p>
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5 text-xs text-slate-600">
                      <div className="w-4 h-4 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-2.5 h-2.5" />
                      </div>
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Link
                href={plan.href}
                className={`w-full py-3 rounded-xl text-center text-sm font-semibold transition shadow-sm ${
                  plan.popular
                    ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-600/25'
                    : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
