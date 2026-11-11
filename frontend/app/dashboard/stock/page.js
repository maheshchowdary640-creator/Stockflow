'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Boxes,
  Search,
  AlertTriangle,
  CheckCircle,
  Save,
  Plus,
  Minus,
  Loader2,
  Filter,
  Inbox,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { productService } from '@/services/productService';
import { organizationService } from '@/services/organizationService';

export default function StockManagementPage() {
  const { organization } = useAuth();
  const { showToast } = useToast();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('ALL');
  const [defaultThreshold, setDefaultThreshold] = useState(5);

  // Local draft state for quick stock edits: { [productId]: number }
  const [stockDrafts, setStockDrafts] = useState({});
  const [savingId, setSavingId] = useState(null);

  const loadStock = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts({
        search,
      });
      setProducts(data);

      // Initialize drafts
      const drafts = {};
      data.forEach((p) => {
        drafts[p.id] = p.quantity_on_hand;
      });
      setStockDrafts(drafts);

      if (organization?.id) {
        const settings = await organizationService.getSettings(organization.id);
        if (settings?.default_low_stock_threshold) {
          setDefaultThreshold(settings.default_low_stock_threshold);
        }
      }
    } catch (err) {
      console.error('Failed to load stock list:', err);
      showToast('Error loading stock: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, organization?.id, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadStock();
    }, 200);
    return () => clearTimeout(timer);
  }, [loadStock]);

  const handleDraftChange = (id, value) => {
    const parsed = Math.max(0, parseInt(value, 10) || 0);
    setStockDrafts((prev) => ({ ...prev, [id]: parsed }));
  };

  const handleStep = (id, delta) => {
    setStockDrafts((prev) => {
      const current = prev[id] ?? 0;
      return { ...prev, [id]: Math.max(0, current + delta) };
    });
  };

  const handleSaveStock = async (product) => {
    const newQty = stockDrafts[product.id] ?? product.quantity_on_hand;
    setSavingId(product.id);
    try {
      await productService.updateStockQuantity(product.id, newQty);
      showToast(
        `Updated stock for "${product.name}" to ${newQty} units.`,
        'success'
      );
      // Update local state without full refetch
      setProducts((prev) =>
        prev.map((p) => (p.id === product.id ? { ...p, quantity_on_hand: newQty } : p))
      );
    } catch (err) {
      console.error('Error updating stock quantity:', err);
      showToast('Failed to update stock: ' + err.message, 'error');
    } finally {
      setSavingId(null);
    }
  };

  // Filter products by stock state
  const filteredProducts = products.filter((p) => {
    const threshold = p.low_stock_threshold ?? defaultThreshold;
    if (filter === 'LOW_STOCK') {
      return p.quantity_on_hand > 0 && p.quantity_on_hand <= threshold;
    }
    if (filter === 'OUT_OF_STOCK') {
      return p.quantity_on_hand === 0;
    }
    if (filter === 'HEALTHY') {
      return p.quantity_on_hand > threshold;
    }
    return true;
  });

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Stock Management
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Perform rapid physical inventory counts and inline stock adjustments.
          </p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by product name or SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {[
            { label: 'All Products', value: 'ALL' },
            { label: 'Healthy Stock', value: 'HEALTHY' },
            { label: 'Low Stock Only', value: 'LOW_STOCK' },
            { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
          ].map((pill) => (
            <button
              key={pill.value}
              onClick={() => setFilter(pill.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                filter === pill.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stock Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            Loading stock registers...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center p-6">
            <Inbox className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-900 mb-1">
              No matching products found
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-4">
              Try adjusting your search criteria or filter options.
            </p>
            <button
              onClick={() => {
                setSearch('');
                setFilter('ALL');
              }}
              className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Product & SKU</th>
                  <th className="py-3.5 px-6 text-center">Alert Threshold</th>
                  <th className="py-3.5 px-6">Inventory Status</th>
                  <th className="py-3.5 px-6 text-center">Current Quantity</th>
                  <th className="py-3.5 px-6 text-right">Quick Stock Adjustment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProducts.map((p) => {
                  const threshold = p.low_stock_threshold ?? defaultThreshold;
                  const currentDraft = stockDrafts[p.id] ?? p.quantity_on_hand;
                  const isModified = currentDraft !== p.quantity_on_hand;
                  const isSaving = savingId === p.id;
                  const isLow = p.quantity_on_hand > 0 && p.quantity_on_hand <= threshold;
                  const isOut = p.quantity_on_hand <= 0;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      {/* Name & SKU */}
                      <td className="py-4 px-6 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{p.name}</p>
                        <p className="font-mono text-xs text-slate-400 uppercase mt-0.5">
                          {p.sku}
                        </p>
                      </td>

                      {/* Threshold */}
                      <td className="py-4 px-6 text-center text-xs text-slate-600 font-medium">
                        {p.low_stock_threshold !== null && p.low_stock_threshold !== undefined ? (
                          <span>{p.low_stock_threshold} units</span>
                        ) : (
                          <span className="text-slate-400">{defaultThreshold} (default)</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {isOut ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Low Stock Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                            Adequate Stock
                          </span>
                        )}
                      </td>

                      {/* Current Recorded Qty */}
                      <td className="py-4 px-6 text-center">
                        <span className="text-base font-black text-slate-900">
                          {p.quantity_on_hand.toLocaleString()}
                        </span>
                        <span className="text-xs text-slate-400 block">units</span>
                      </td>

                      {/* Inline Adjustment Control */}
                      <td className="py-4 px-6 text-right">
                        <div className="inline-flex items-center gap-2">
                          <div className="flex items-center border border-slate-200 rounded-xl overflow-hidden bg-white shadow-2xs">
                            <button
                              type="button"
                              onClick={() => handleStep(p.id, -1)}
                              className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                              title="Decrease count"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <input
                              type="number"
                              min="0"
                              value={currentDraft}
                              onChange={(e) => handleDraftChange(p.id, e.target.value)}
                              className="w-16 py-1.5 text-center text-xs font-bold text-slate-900 focus:outline-hidden"
                            />
                            <button
                              type="button"
                              onClick={() => handleStep(p.id, 1)}
                              className="px-2.5 py-1.5 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition"
                              title="Increase count"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <button
                            type="button"
                            disabled={!isModified || isSaving}
                            onClick={() => handleSaveStock(p)}
                            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                              isModified
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-600/20'
                                : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            }`}
                          >
                            {isSaving ? (
                              <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            ) : (
                              <Save className="w-3.5 h-3.5" />
                            )}
                            Save
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
