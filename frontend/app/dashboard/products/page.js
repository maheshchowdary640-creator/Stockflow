'use client';

import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Package,
  Plus,
  Search,
  Edit,
  Trash2,
  Eye,
  Loader2,
  AlertCircle,
  Inbox,
  Filter,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { productService } from '@/services/productService';
import { organizationService } from '@/services/organizationService';
import ProductModal from '@/components/dashboard/ProductModal';
import DeleteConfirmModal from '@/components/dashboard/DeleteConfirmModal';

// ── INR currency formatter ────────────────────────────────────────────────────
const formatINR = (amount) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount ?? 0);

function ProductsPageInner() {
  const { organization } = useAuth();
  const { showToast } = useToast();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // Initialise filter from URL query param (e.g. ?filter=LOW_STOCK)
  const [statusFilter, setStatusFilter] = useState(
    () => searchParams.get('filter') || 'ALL'
  );
  const [defaultThreshold, setDefaultThreshold] = useState(5);

  // Sync state if URL query param changes
  useEffect(() => {
    const filterFromUrl = searchParams.get('filter');
    if (filterFromUrl) {
      setStatusFilter(filterFromUrl);
    }
  }, [searchParams]);

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);
  const [viewProductTarget, setViewProductTarget] = useState(null);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getProducts({
        search,
        statusFilter,
      });
      setProducts(data);

      if (organization?.id) {
        const settings = await organizationService.getSettings(organization.id);
        if (settings?.default_low_stock_threshold) {
          setDefaultThreshold(settings.default_low_stock_threshold);
        }
      }
    } catch (err) {
      console.error('Failed to load products:', err);
      showToast('Error loading products: ' + err.message, 'error');
    } finally {
      setLoading(false);
    }
  }, [search, statusFilter, organization?.id, showToast]);

  useEffect(() => {
    const timer = setTimeout(() => {
      loadProducts();
    }, 250);
    return () => clearTimeout(timer);
  }, [loadProducts]);

  // Handle Save (Create or Update)
  const handleSaveProduct = async (formData) => {
    if (editingProduct) {
      await productService.updateProduct(editingProduct.id, formData);
      showToast(`Product "${formData.name}" updated successfully!`, 'success');
    } else {
      if (!organization?.id) {
        throw new Error('Organization not resolved.');
      }
      await productService.createProduct(formData, organization.id);
      showToast(`Product "${formData.name}" created successfully!`, 'success');
    }
    loadProducts();
  };

  // Handle Delete
  const handleDeleteProduct = async () => {
    if (!deleteProductTarget) return;
    try {
      await productService.deleteProduct(deleteProductTarget.id);
      showToast(`Product "${deleteProductTarget.name}" deleted successfully.`, 'success');
      loadProducts();
    } catch (err) {
      showToast('Failed to delete product: ' + err.message, 'error');
    }
  };

  const getStockStatus = (p) => {
    const threshold = p.low_stock_threshold ?? defaultThreshold;
    if (p.quantity_on_hand <= 0) {
      return {
        label: 'Out of Stock',
        badge: 'bg-rose-50 text-rose-700 border-rose-200',
      };
    }
    if (p.quantity_on_hand <= threshold) {
      return {
        label: 'Low Stock',
        badge: 'bg-amber-50 text-amber-700 border-amber-200',
      };
    }
    return {
      label: 'In Stock',
      badge: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Product Catalog
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Manage your full inventory portfolio, stock thresholds, and pricing.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingProduct(null);
            setIsModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 text-white font-semibold hover:bg-indigo-700 transition shadow-sm shadow-indigo-600/20 text-sm flex-shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Product
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or SKU..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-600/20 focus:border-indigo-600 text-sm transition"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-4 h-4 text-slate-400 flex-shrink-0" />
          {[
            { label: 'All Items', value: 'ALL' },
            { label: 'In Stock', value: 'IN_STOCK' },
            { label: 'Low Stock', value: 'LOW_STOCK' },
            { label: 'Out of Stock', value: 'OUT_OF_STOCK' },
          ].map((pill) => (
            <button
              key={pill.value}
              onClick={() => setStatusFilter(pill.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                statusFilter === pill.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Products Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
            Loading products from database...
          </div>
        ) : products.length === 0 ? (
          <div className="py-20 flex flex-col items-center justify-center text-center p-6">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-3">
              <Inbox className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-slate-900 mb-1">
              {search || statusFilter !== 'ALL'
                ? 'No matching products found'
                : 'No products in your inventory yet'}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mb-5">
              {search || statusFilter !== 'ALL'
                ? 'Try adjusting your search terms or filters.'
                : 'Create your first product to begin tracking quantities, SKUs, and pricing.'}
            </p>
            {search || statusFilter !== 'ALL' ? (
              <button
                onClick={() => {
                  setSearch('');
                  setStatusFilter('ALL');
                }}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Clear Filters
              </button>
            ) : (
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsModalOpen(true);
                }}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 text-white text-xs font-semibold hover:bg-indigo-700 transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/70 border-b border-slate-100 text-slate-500 text-xs font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-6">Product Details</th>
                  <th className="py-3.5 px-6">SKU</th>
                  <th className="py-3.5 px-6 text-center">Quantity</th>
                  <th className="py-3.5 px-6">Stock Status</th>
                  <th className="py-3.5 px-6 text-right">Cost Price</th>
                  <th className="py-3.5 px-6 text-right">Selling Price</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const status = getStockStatus(p);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 transition">
                      {/* Name & Description */}
                      <td className="py-4 px-6 max-w-xs">
                        <p className="font-bold text-slate-900 truncate">{p.name}</p>
                        {p.description && (
                          <p className="text-xs text-slate-400 truncate mt-0.5">
                            {p.description}
                          </p>
                        )}
                      </td>

                      {/* SKU */}
                      <td className="py-4 px-6 font-mono font-semibold text-slate-700 uppercase text-xs">
                        {p.sku}
                      </td>

                      {/* Quantity */}
                      <td className="py-4 px-6 text-center font-bold text-slate-900">
                        {p.quantity_on_hand.toLocaleString('en-IN')}
                      </td>

                      {/* Stock Status */}
                      <td className="py-4 px-6">
                        <span
                          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${status.badge}`}
                        >
                          {status.label}
                        </span>
                      </td>

                      {/* Cost Price */}
                      <td className="py-4 px-6 text-right font-medium text-slate-600">
                        {p.cost_price !== null && p.cost_price !== undefined
                          ? formatINR(parseFloat(p.cost_price))
                          : '—'}
                      </td>

                      {/* Selling Price */}
                      <td className="py-4 px-6 text-right font-bold text-slate-900">
                        {p.selling_price !== null && p.selling_price !== undefined
                          ? formatINR(parseFloat(p.selling_price))
                          : '—'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setViewProductTarget(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 transition"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setEditingProduct(p);
                              setIsModalOpen(true);
                            }}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition"
                            title="Edit Product"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeleteProductTarget(p)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                            title="Delete Product"
                          >
                            <Trash2 className="w-4 h-4" />
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

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isModalOpen}
        isEdit={!!editingProduct}
        initialData={editingProduct}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProduct(null);
        }}
        onSubmit={handleSaveProduct}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deleteProductTarget}
        productName={deleteProductTarget?.name}
        productSku={deleteProductTarget?.sku}
        onClose={() => setDeleteProductTarget(null)}
        onConfirm={handleDeleteProduct}
      />

      {/* View Details Drawer / Modal */}
      {viewProductTarget && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
            onClick={() => setViewProductTarget(null)}
          />
          <div className="relative bg-white rounded-2xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-200 z-10 animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-5">
              <h3 className="text-base font-bold text-slate-900">Product Details</h3>
              <button
                onClick={() => setViewProductTarget(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>
            <div className="space-y-3.5 text-xs">
              <div>
                <p className="text-slate-400 uppercase tracking-wider font-semibold">Name</p>
                <p className="text-sm font-bold text-slate-900 mt-0.5">{viewProductTarget.name}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-slate-400 uppercase tracking-wider font-semibold">SKU</p>
                  <p className="font-mono font-bold text-slate-800 mt-0.5">{viewProductTarget.sku}</p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wider font-semibold">Quantity on Hand</p>
                  <p className="font-bold text-slate-900 mt-0.5 text-sm">
                    {viewProductTarget.quantity_on_hand.toLocaleString('en-IN')} units
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wider font-semibold">Cost Price</p>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {viewProductTarget.cost_price !== null && viewProductTarget.cost_price !== undefined
                      ? formatINR(parseFloat(viewProductTarget.cost_price))
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wider font-semibold">Selling Price</p>
                  <p className="font-bold text-slate-900 mt-0.5">
                    {viewProductTarget.selling_price !== null && viewProductTarget.selling_price !== undefined
                      ? formatINR(parseFloat(viewProductTarget.selling_price))
                      : '—'}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wider font-semibold">Low-Stock Alert Threshold</p>
                  <p className="font-semibold text-slate-700 mt-0.5">
                    {viewProductTarget.low_stock_threshold ?? `${defaultThreshold} (default)`}
                  </p>
                </div>
                <div>
                  <p className="text-slate-400 uppercase tracking-wider font-semibold">Created Date</p>
                  <p className="text-slate-600 mt-0.5">
                    {new Date(viewProductTarget.created_at).toLocaleDateString('en-IN')}
                  </p>
                </div>
              </div>
              {viewProductTarget.description && (
                <div className="pt-2 border-t border-slate-100">
                  <p className="text-slate-400 uppercase tracking-wider font-semibold mb-1">Description</p>
                  <p className="text-slate-700 leading-relaxed">{viewProductTarget.description}</p>
                </div>
              )}
            </div>
            <div className="mt-6 pt-4 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setViewProductTarget(null)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition text-xs"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="py-20 flex flex-col items-center justify-center text-slate-400 text-sm gap-2">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
          Loading products...
        </div>
      }
    >
      <ProductsPageInner />
    </Suspense>
  );
}
