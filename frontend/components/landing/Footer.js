import React from 'react';
import Link from 'next/link';
import { Package2 } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-12 border-b border-slate-800">
          {/* Brand info */}
          <div className="col-span-2">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md">
                <Package2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">
                Stock<span className="text-indigo-400">Flow</span>
              </span>
            </Link>
            <p className="text-sm text-slate-400 max-w-sm leading-relaxed mb-6">
              Take Control of Your Inventory. Grow Your Business. The modern, clean SaaS inventory system for fast-moving businesses.
            </p>
            <p className="text-xs text-slate-500">
              &copy; {new Date().getFullYear()} StockFlow Inc. All rights reserved.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <a href="#features" className="hover:text-white transition">
                  Features
                </a>
              </li>
              <li>
                <a href="#how-it-works" className="hover:text-white transition">
                  How It Works
                </a>
              </li>
              <li>
                <a href="#benefits" className="hover:text-white transition">
                  Benefits
                </a>
              </li>
              <li>
                <a href="#pricing" className="hover:text-white transition">
                  Pricing
                </a>
              </li>
            </ul>
          </div>

          {/* Applications */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Application
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <Link href="/login" className="hover:text-white transition">
                  User Login
                </Link>
              </li>
              <li>
                <Link href="/signup" className="hover:text-white transition">
                  Create Account
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-white transition">
                  Live Dashboard
                </Link>
              </li>
              <li>
                <a href="#faq" className="hover:text-white transition">
                  Help & FAQs
                </a>
              </li>
            </ul>
          </div>

          {/* Legal & Trust */}
          <div>
            <h4 className="text-xs font-semibold text-white uppercase tracking-wider mb-4">
              Legal & Trust
            </h4>
            <ul className="space-y-2.5 text-sm">
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition">
                  Security Overview
                </span>
              </li>
              <li>
                <span className="text-slate-400 hover:text-white cursor-pointer transition">
                  Contact Support
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>Built with Next.js 14, Node.js Express, and Supabase PostgreSQL with RLS.</p>
          <div className="flex items-center gap-6">
            <span>Clean Architecture</span>
            <span>&bull;</span>
            <span>Multi-Tenant RLS</span>
            <span>&bull;</span>
            <span>Enterprise Ready</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
