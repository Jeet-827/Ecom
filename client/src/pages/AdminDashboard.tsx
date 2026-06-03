import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

interface Product {
  _id: string;
  productname: string;
  productdec: string;
  price: number;
  category: string;
  stock: number;
  productimage: string;
  brand: string;
  isFeatured: boolean;
}

const AdminDashboard: React.FC = () => {
  const { token } = useAuth();
  
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [newProduct, setNewProduct] = useState({
    productname: '',
    productdec: '',
    price: '',
    category: 'Electronics',
    stock: '',
    productimage: '',
    brand: '',
    isFeatured: false,
  });
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitFeedback, setSubmitFeedback] = useState<{ message: string; isError: boolean } | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await axios.get('http://localhost:5000/api/products');
      setProducts(res.data);
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: checked,
    }));
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    setSubmitFeedback(null);

    // Validate inputs
    const priceNum = parseFloat(newProduct.price);
    const stockNum = parseInt(newProduct.stock, 10);

    if (isNaN(priceNum) || priceNum < 0) {
      setSubmitFeedback({ message: 'Price must be a valid positive number.', isError: true });
      setSubmitLoading(false);
      return;
    }

    if (isNaN(stockNum) || stockNum < 0) {
      setSubmitFeedback({ message: 'Stock must be a valid positive integer.', isError: true });
      setSubmitLoading(false);
      return;
    }

    try {
      const payload = {
        ...newProduct,
        price: priceNum,
        stock: stockNum,
      };

      const res = await axios.post(
        'http://localhost:5000/api/products/create',
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSubmitFeedback({ message: res.data.message || 'Product created successfully!', isError: false });
      
      // Reset form (keep default category)
      setNewProduct({
        productname: '',
        productdec: '',
        price: '',
        category: 'Electronics',
        stock: '',
        productimage: '',
        brand: '',
        isFeatured: false,
      });

      // Refresh list
      fetchProducts();
    } catch (err: any) {
      console.error(err);
      setSubmitFeedback({
        message: err.response?.data?.message || 'Failed to create product. Check token rights.',
        isError: true,
      });
    } finally {
      setSubmitLoading(false);
    }
  };

  // Compute Stats
  const totalProducts = products.length;
  const featuredCount = products.filter(p => p.isFeatured).length;
  const totalStock = products.reduce((acc, curr) => acc + curr.stock, 0);
  const categoriesCount = new Set(products.map(p => p.category)).size;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-grow w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-200 pb-5">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Admin Operations</h1>
            <p className="text-sm text-slate-500 mt-1">Manage catalog offerings, create products, and monitor inventory levels.</p>
          </div>
          <button 
            onClick={fetchProducts}
            className="px-4 py-2 border border-slate-200 rounded-xl bg-white text-slate-600 hover:text-indigo-600 hover:border-indigo-100 hover:bg-indigo-50/20 font-semibold text-sm transition-all shadow-sm flex items-center gap-2 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
            Refresh Catalog
          </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 7.5V18a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 18V7.5M21 7.5V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v1.5m18 0v3.75a2.25 2.25 0 0 1-2.25 2.25H5.25A2.25 2.25 0 0 1 3 12V7.5m18 0H3" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Products</span>
              <span className="text-2xl font-black text-slate-800">{totalProducts}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499c.173-.44.83-.44 1.002 0l2.1 4.252 4.69 1.139c.477.115.669.7.322 1.03l-3.4 3.313.805 4.673c.082.476-.418.84-.84.62l-4.184-2.199-4.183 2.199c-.422.22-.922-.144-.84-.62l.804-4.673-3.4-3.313c-.347-.33-.156-.915.322-1.03l4.69-1.14 2.1-4.251Z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Featured Items</span>
              <span className="text-2xl font-black text-slate-800">{featuredCount}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Total Stock</span>
              <span className="text-2xl font-black text-slate-800">{totalStock}</span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/80 p-5 rounded-3xl shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581a1.125 1.125 0 0 0 1.591 0l7.22-7.22a1.125 1.125 0 0 0 0-1.591L12.48 3.03A2.25 2.25 0 0 0 10.889 2.3H9.568Zm.92 5.04a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" />
              </svg>
            </div>
            <div>
              <span className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Categories</span>
              <span className="text-2xl font-black text-slate-800">{categoriesCount}</span>
            </div>
          </div>
        </div>

        {/* Dashboard Split Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Product Table */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm overflow-hidden">
              <div className="px-6 py-5 border-b border-slate-100">
                <h3 className="font-bold text-lg text-slate-900">Current Catalog Offerings</h3>
              </div>

              {/* loading */}
              {loading && (
                <div className="p-8 space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="flex gap-4 animate-pulse">
                      <div className="w-12 h-12 bg-slate-100 rounded-xl"></div>
                      <div className="flex-1 space-y-2 py-1">
                        <div className="h-4 bg-slate-100 rounded w-1/3"></div>
                        <div className="h-3 bg-slate-100 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Empty state */}
              {!loading && products.length === 0 && (
                <div className="p-12 text-center text-slate-500">
                  No products exist in database yet. Use the creation tool on the right to populate items.
                </div>
              )}

              {/* Table */}
              {!loading && products.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50/50 border-b border-slate-100 text-xs font-bold text-slate-400 uppercase">
                        <th className="px-6 py-4">Item Details</th>
                        <th className="px-6 py-4">Category</th>
                        <th className="px-6 py-4">Price</th>
                        <th className="px-6 py-4">Stock</th>
                        <th className="px-6 py-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm">
                      {products.map((product) => (
                        <tr key={product._id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-6 py-4 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 flex items-center justify-center border border-slate-200/50">
                              {product.productimage ? (
                                <img src={product.productimage} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <span className="text-slate-400 font-bold uppercase">{product.productname.charAt(0)}</span>
                              )}
                            </div>
                            <div>
                              <span className="block font-bold text-slate-800">{product.productname}</span>
                              <span className="text-xs text-slate-400">{product.brand}</span>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-6 py-4 font-bold text-slate-700">${product.price.toFixed(2)}</td>
                          <td className="px-6 py-4 font-semibold text-slate-600">{product.stock} pcs</td>
                          <td className="px-6 py-4 text-right">
                            {product.isFeatured && (
                              <span className="px-2 py-0.5 text-[9px] font-bold text-white bg-indigo-600 rounded-full uppercase tracking-wider">
                                Featured
                              </span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Creation Form */}
          <div className="lg:col-span-1">
            <div className="bg-white border border-slate-200/80 rounded-3xl shadow-sm p-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none"></div>
              
              <h3 className="font-extrabold text-lg text-slate-900 mb-2">Create New Product</h3>
              <p className="text-xs text-slate-500 mb-6">Complete the specifications below to post a new product offering to the shop catalog.</p>

              {submitFeedback && (
                <div className={`mb-5 p-4 rounded-xl text-xs font-semibold border ${
                  submitFeedback.isError
                    ? 'bg-rose-50 border-rose-100 text-rose-800'
                    : 'bg-emerald-50 border-emerald-100 text-emerald-800'
                }`}>
                  {submitFeedback.message}
                </div>
              )}

              <form onSubmit={handleCreateProduct} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Product Name</label>
                  <input
                    type="text"
                    required
                    name="productname"
                    value={newProduct.productname}
                    onChange={handleInputChange}
                    placeholder="e.g. Gravity Headphones"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Brand</label>
                    <input
                      type="text"
                      required
                      name="brand"
                      value={newProduct.brand}
                      onChange={handleInputChange}
                      placeholder="e.g. Antigravity"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Category</label>
                    <select
                      name="category"
                      value={newProduct.category}
                      onChange={handleInputChange}
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all cursor-pointer"
                    >
                      <option value="Electronics">Electronics</option>
                      <option value="Audio">Audio</option>
                      <option value="Wearables">Wearables</option>
                      <option value="Computers">Computers</option>
                      <option value="Accessories">Accessories</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Price ($)</label>
                    <input
                      type="number"
                      required
                      step="0.01"
                      min="0"
                      name="price"
                      value={newProduct.price}
                      onChange={handleInputChange}
                      placeholder="0.00"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Stock Qty</label>
                    <input
                      type="number"
                      required
                      min="0"
                      name="stock"
                      value={newProduct.stock}
                      onChange={handleInputChange}
                      placeholder="0"
                      className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Product Image URL</label>
                  <input
                    type="url"
                    name="productimage"
                    value={newProduct.productimage}
                    onChange={handleInputChange}
                    placeholder="https://example.com/image.jpg"
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">Description</label>
                  <textarea
                    required
                    rows={3}
                    name="productdec"
                    value={newProduct.productdec}
                    onChange={handleInputChange}
                    placeholder="Provide a compelling description of product attributes, antigravity core specifications..."
                    className="w-full px-3.5 py-2.5 bg-slate-50/50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/5 transition-all resize-none"
                  />
                </div>

                <div className="flex items-center gap-3 py-2">
                  <input
                    type="checkbox"
                    id="isFeatured"
                    name="isFeatured"
                    checked={newProduct.isFeatured}
                    onChange={handleCheckboxChange}
                    className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500/5"
                  />
                  <label htmlFor="isFeatured" className="text-xs font-bold text-slate-500 select-none uppercase tracking-wider cursor-pointer">
                    Promote as Featured Item
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={submitLoading}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold rounded-xl shadow-md shadow-indigo-600/10 hover:shadow-indigo-600/25 transition-all transform hover:-translate-y-[1px] active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer text-center text-sm"
                >
                  {submitLoading ? 'Creating Product...' : 'Publish Product'}
                </button>
              </form>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
};

export default AdminDashboard;
