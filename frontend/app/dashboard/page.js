'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  Package,
  Boxes,
  AlertTriangle,
  IndianRupee,
  TrendingUp,
  Plus,
  ArrowRight,
  BarChart3,
  Loader2,
  Inbox,
  ShoppingCart,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { productService } from '@/services/productService';
import { organizationService } from '@/services/organizationService';
import ProductModal from '@/components/dashboard/ProductModal';

// ── INR currency formatter (Indian locale: lakhs/crores) ──────────────────────
const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

export default function DashboardOverviewPage() {
  const { profile, organization } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [defaultThreshold, setDefaultThreshold] = useState(5);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const items = await productService.getProducts();
      setProducts(items);

      if (organization?.id) {
        const settings = await organizationService.getSettings(organization.id);
        if (settings?.default_low_stock_threshold) {
          setDefaultThreshold(settings.default_low_stock_threshold);
        }
      }
    } catch (err) {
      console.error('[Dashboard] Error loading data:', err);
      showToast('Error loading inventory data: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [organization?.id, showToast]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleCreateProduct = async (productData) => {
    if (!organization?.id) {
      throw new Error('Organization not resolved. Please refresh or update settings.');
    }
    await productService.createProduct(productData, organization.id);
    showToast(`Product "${productData.name}" added successfully!`, 'success');
    loadDashboardData();
  };

  // ── Metrics ────────────────────────────────────────────────────────────────
  const totalProducts = products.length;

  const totalStockUnits = products.reduce(
    (acc, p) => acc + (p.quantity_on_hand || 0),
    0
  );

  const lowStockProducts = products.filter(
    (p) => p.quantity_on_hand <= (p.low_stock_threshold ?? defaultThreshold)
  );

  // Inventory Cost Value = Σ (qty × cost_price); null cost_price treated as 0
  const totalCostValue = products.reduce((acc, p) => {
    const cost =
      p.cost_price !== null && p.cost_price !== undefined
        ? parseFloat(p.cost_price)
        : 0;
    return acc + (p.quantity_on_hand || 0) * cost;
  }, 0);

  // Potential Sales Value = Σ (qty × selling_price); null selling_price treated as 0
  const totalSalesValue = products.reduce((acc, p) => {
    const price =
      p.selling_price !== null && p.selling_price !== undefined
        ? parseFloat(p.selling_price)
        : 0;
    return acc + (p.quantity_on_hand || 0) * price;
  }, 0);

  const recentProducts = products.slice(0, 5);

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-200">
      {/* Welcome Banner */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            Workspace Overview
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Welcome back, {profile?.name || 'Manager'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Managing{' '}
            <strong className="text-slate-800 font-semibold">
              {organization?.name || 'StockFlow Organization'}
            </strong>{' '}
            &bull; Supabase PostgreSQL Protected
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/20 text-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* ── 5 Statistics Cards ────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">

        {/* 1. Total Products */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Products</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-900">
              {loading ? '—' : totalProducts.toLocaleString('en-IN')}
            </p>
            <span className="text-xs font-medium text-emerald-600 flex items-center gap-1">
              <TrendingUp className="w-3.5 h-3.5" /> Active
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Catalog items recorded</p>
        </div>

        {/* 2. Total Stock Units */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Stock Units</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center">
              <Boxes className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className="text-3xl font-black text-slate-900">
              {loading ? '—' : totalStockUnits.toLocaleString('en-IN')}
            </p>
            <span className="text-xs font-medium text-slate-500">Units on hand</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">Physical inventory items</p>
        </div>

        {/* 3. Low Stock Items — clickable → products with LOW_STOCK filter */}
        <Link
          href="/dashboard/products?filter=LOW_STOCK"
          className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md hover:border-amber-300 transition cursor-pointer group block"
        >
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Low Stock Items</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 border border-amber-100 text-amber-600 flex items-center justify-center group-hover:bg-amber-100 transition">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <p className={`text-3xl font-black ${lowStockProducts.length > 0 ? 'text-amber-600' : 'text-slate-900'}`}>
              {loading ? '—' : lowStockProducts.length}
            </p>
            {lowStockProducts.length > 0 ? (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 group-hover:bg-amber-200 transition">
                View →
              </span>
            ) : (
              <span className="text-xs font-medium text-emerald-600">Optimal</span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-2">
            At or below threshold ({defaultThreshold}) · Click to filter
          </p>
        </Link>

        {/* 4. Inventory Cost Value = qty × cost_price */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Cost Value</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 flex items-center justify-center">
              <IndianRupee className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <p className="text-xl font-black text-slate-900 leading-tight">
              {loading ? '—' : formatINR(totalCostValue)}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-2">Inventory cost (qty × cost price)</p>
        </div>

        {/* 5. Potential Sales Value = qty × selling_price */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs hover:shadow-md transition">
          <div className="flex items-center justify-between text-slate-500 mb-3">
            <span className="text-xs font-semibold uppercase tracking-wider">Sales Value</span>
            <div className="w-9 h-9 rounded-xl bg-violet-50 border border-violet-100 text-violet-600 flex items-center justify-center">
              <ShoppingCart className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline justify-between gap-1">
            <p className="text-xl font-black text-slate-900 leading-tight">
              {loading ? '—' : formatINR(totalSalesValue)}
            </p>
          </div>
          <p className="text-xs text-slate-400 mt-2">Potential revenue (qty × selling price)</p>
        </div>
      </div>

      {/* ── Main Dashboard Content Grid ───────────────────────────────────── */}
      <div className="grid lg:grid-cols-12 gap-8">
        {/* A. Inventory Stock Distribution Chart (8 Cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-5 border-b border-slate-100 mb-6">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                Inventory Stock Distribution
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Top products categorized by available unit volumes on hand
              </p>
            </div>
            <Link
              href="/dashboard/stock"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              Manage Stock &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="h-64 flex items-center justify-center text-slate-400 text-sm gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
              Loading chart metrics...
            </div>
          ) : products.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <div className="w-12 h-12 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
                <Package className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-800">No inventory data to chart</p>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mb-4">
                Add your first product to generate stock velocity metrics and volume distribution charts.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition"
              >
                Add Your First Product
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {products.slice(0, 5).map((p, idx) => {
                const maxStock = Math.max(...products.map((item) => item.quantity_on_hand), 1);
                const percent = Math.min(100, Math.round((p.quantity_on_hand / maxStock) * 100));
                const isLow = p.quantity_on_hand <= (p.low_stock_threshold ?? defaultThreshold);

                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate max-w-[200px] sm:max-w-xs">
                        {p.name}{' '}
                        <span className="text-slate-400 font-mono text-[11px]">({p.sku})</span>
                      </span>
                      <span className="font-bold text-slate-900">
                        {p.quantity_on_hand.toLocaleString('en-IN')} units
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isLow ? 'bg-amber-500' : 'bg-indigo-600'
                        }`}
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Quick Actions Card (4 Cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900 mb-1">Quick Actions</h3>
            <p className="text-xs text-slate-500 mb-5">Rapid access to standard daily workflows</p>

            <div className="space-y-3">
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:bg-indigo-600 group-hover:text-white transition">
                    <Plus className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Add New Product</p>
                    <p className="text-[11px] text-slate-400">Register new catalog item</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
              </button>

              <Link
                href="/dashboard/products"
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition">
                    <Package className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">View Catalog</p>
                    <p className="text-[11px] text-slate-400">Manage all {totalProducts} products</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
              </Link>

              <Link
                href="/dashboard/stock"
                className="w-full flex items-center justify-between p-3.5 rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:bg-indigo-50/40 transition group text-left"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition">
                    <Boxes className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900">Manage Stock</p>
                    <p className="text-[11px] text-slate-400">Perform quick count updates</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition" />
              </Link>
            </div>
          </div>

          {/* Low Stock Warning Callout */}
          {lowStockProducts.length > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs">
              <div className="flex items-center gap-2 text-amber-800 font-bold mb-1">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                {lowStockProducts.length} Items Require Reorder
              </div>
              <p className="text-amber-700 leading-relaxed">
                Stock is at or below threshold. Visit Stock Management to adjust or place purchase
                requisitions.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ── Tables Row: Low Stock Alerts & Recent Products ─────────────────── */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Low Stock Products Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              Low Stock Alerts
            </h3>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {lowStockProducts.length} Attention Needed
            </span>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin inline mr-2 text-indigo-600" />
              Checking stock thresholds...
            </div>
          ) : lowStockProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <p className="font-semibold text-slate-700">All products are healthy</p>
              <p className="text-slate-400 mt-1">No products currently below their threshold.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-2.5">Product</th>
                    <th className="pb-2.5">SKU</th>
                    <th className="pb-2.5 text-right">Available Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {lowStockProducts.slice(0, 5).map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-semibold text-slate-900 truncate max-w-[160px]">
                        {p.name}
                      </td>
                      <td className="py-3 font-mono text-slate-500 uppercase">{p.sku}</td>
                      <td className="py-3 text-right">
                        <span className="px-2 py-0.5 rounded-full font-bold bg-amber-100 text-amber-800 text-[11px]">
                          {p.quantity_on_hand} left
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Products Card */}
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Package className="w-4 h-4 text-indigo-600" />
              Recently Added Products
            </h3>
            <Link
              href="/dashboard/products"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
            >
              View All &rarr;
            </Link>
          </div>

          {loading ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              <Loader2 className="w-4 h-4 animate-spin inline mr-2 text-indigo-600" />
              Loading recent products...
            </div>
          ) : recentProducts.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Inbox className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-slate-700">No products yet</p>
              <p className="text-slate-400 mt-1">Get started by adding your first product.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-2.5">Name</th>
                    <th className="pb-2.5">SKU</th>
                    <th className="pb-2.5 text-right">Stock</th>
                    <th className="pb-2.5 text-right">Selling Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentProducts.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50">
                      <td className="py-3 font-semibold text-slate-900 truncate max-w-[150px]">
                        {p.name}
                      </td>
                      <td className="py-3 font-mono text-slate-500 uppercase">{p.sku}</td>
                      <td className="py-3 text-right font-medium text-slate-700">
                        {p.quantity_on_hand.toLocaleString('en-IN')}
                      </td>
                      <td className="py-3 text-right font-semibold text-slate-900">
                        {p.selling_price !== null && p.selling_price !== undefined
                          ? formatINR(parseFloat(p.selling_price))
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add Product Modal */}
      <ProductModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleCreateProduct}
      />
    </div>
  );
}
