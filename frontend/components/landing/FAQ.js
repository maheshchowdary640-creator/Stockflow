'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqs = [
  {
    question: 'What is StockFlow?',
    answer:
      'StockFlow is a streamlined, modern SaaS Inventory Management System designed to give businesses effortless control over their products, stock levels, valuations, and low-stock replenishment without bloated menus or complicated training.',
  },
  {
    question: 'How do I add products?',
    answer:
      'Simply log in, head to the Products tab in your dashboard, and click "Add Product". You can specify the product name, SKU (Stock Keeping Unit), description, quantity on hand, cost price, selling price, and a custom low-stock alert threshold.',
  },
  {
    question: 'How do low-stock alerts work?',
    answer:
      'Each product can have its own low-stock threshold, or you can configure a global default (e.g., 5 units) in your Organization Settings. Whenever an item\'s stock falls below or equal to that number, it is automatically highlighted on your dashboard and low-stock filters so you can reorder immediately.',
  },
  {
    question: 'Is my inventory data secure?',
    answer:
      'Yes. StockFlow is built on top of Supabase PostgreSQL with strict Row Level Security (RLS) policies. Every product, setting, and inventory record belongs strictly to your organization tenant, meaning other organizations can never see or touch your data.',
  },
  {
    question: 'Can I manage my organization?',
    answer:
      'Absolutely. The Settings section lets you update your Organization name, adjust global inventory thresholds, and manage your account details easily.',
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState(0);

  const toggle = (idx) => {
    setOpenIdx(openIdx === idx ? -1 : idx);
  };

  return (
    <section id="faq" className="py-20 bg-slate-50 border-t border-slate-200/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            Got Questions?
          </div>
          <p className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            Frequently Asked Questions
          </p>
          <p className="mt-4 text-base sm:text-lg text-slate-600">
            Everything you need to know about StockFlow and getting started.
          </p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIdx === idx;
            return (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden transition"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-hidden"
                  aria-expanded={isOpen}
                >
                  <span className="text-base sm:text-lg font-bold text-slate-900">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-slate-400 transition-transform duration-200 flex-shrink-0 ml-4 ${
                      isOpen ? 'rotate-180 text-indigo-600' : ''
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-0 text-sm sm:text-base text-slate-600 leading-relaxed border-t border-slate-50">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
