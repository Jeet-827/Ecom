import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Navbar from '../components/Navbar';

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

const Products: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await axios.get('http://localhost:5000/api/products');
        setProducts(res.data);
      } catch (err: any) {
        console.error(err);
        setError(err.response?.data?.message || 'Failed to fetch products. Make sure services are running.');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter((product) => {
    const matchesSearch = 
      product.productname.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.productdec.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const getCategoryImage = (category: string) => {
    const colors = [
      'from-blue-500 to-indigo-600',
      'from-purple-500 to-pink-600',
      'from-emerald-400 to-teal-600',
      'from-amber-400 to-orange-600',
      'from-rose-500 to-red-600',
      'from-cyan-400 to-blue-600'
    ];
    let sum = 0;
    for (let i = 0; i < category.length; i++) sum += category.charCodeAt(i);
    return colors[sum % colors.length];
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col">
      <Navbar />

      
      <div className="relative overflow-hidden bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(99,102,241,0.15),transparent)] pointer-events-none"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(168,85,247,0.1),transparent)] pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10 flex flex-col items-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
            Discover Tech Excellence
          </h1>
          <p className="mt-4 max-w-2xl text-base sm:text-lg text-slate-300">
            Browse our premium selection of devices configured with antigravity core specifications.
          </p>

        
          <div className="mt-8 w-full max-w-md relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none text-slate-500">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21-21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search products, brands, or features..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/10 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:bg-white/15 focus:border-white/20 focus:ring-4 focus:ring-indigo-500/20 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex-grow w-full">
        {!loading && !error && products.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-10 justify-center">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                  selectedCategory === category
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-slate-800'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="bg-rose-50 border border-rose-100 rounded-3xl p-8 text-center max-w-xl mx-auto my-12 shadow-sm">
            <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4 font-bold text-xl">!</div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Service Connection Offline</h3>
            <p className="text-sm text-slate-500 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-rose-600/10 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 4, 8].map((i) => (
              <div key={i} className="bg-white border border-slate-100 rounded-3xl p-5 space-y-4 animate-pulse">
                <div className="w-full h-48 bg-slate-100 rounded-2xl"></div>
                <div className="h-4 bg-slate-200 rounded-full w-2/3"></div>
                <div className="h-3 bg-slate-100 rounded-full w-full"></div>
                <div className="h-3 bg-slate-100 rounded-full w-5/6"></div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-5 bg-slate-200 rounded-full w-1/3"></div>
                  <div className="h-8 bg-slate-200 rounded-xl w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && filteredProducts.length === 0 && (
          <div className="text-center py-16 bg-white border border-slate-200/60 rounded-3xl max-w-md mx-auto shadow-sm">
            <svg className="mx-auto h-12 w-12 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="m20.25 7.5-.625 10.632a2.25 2.25 0 0 1-2.247 2.118H6.622a2.25 2.25 0 0 1-2.247-2.118L3.75 7.5m8.25 3v6.75m0 0-3-3m3 3 3-3M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125Z" />
            </svg>
            <h3 className="mt-4 text-base font-bold text-slate-900">No products found</h3>
            <p className="mt-2 text-xs text-slate-500 px-8">We couldn't find any products matching your current filters. Try resetting search parameters.</p>
          </div>
        )}

        {/* Products Grid */}
        {!loading && !error && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="group relative bg-white border border-slate-200/80 hover:border-indigo-200 shadow-sm hover:shadow-xl rounded-3xl p-5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {product.isFeatured && (
                  <span className="absolute top-4 left-4 z-10 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-widest text-white bg-indigo-600 rounded-full shadow-sm">
                    Featured
                  </span>
                )}
                
                <div className="flex flex-col">
                  {/* Image container */}
                  <div className="w-full h-48 rounded-2xl overflow-hidden mb-4 relative bg-slate-50 flex items-center justify-center border border-slate-100">
                    {product.productimage ? (
                      <img
                        src={product.productimage}
                        alt={product.productname}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          // Handle image loading error, fallback to category pattern
                          (e.target as HTMLElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className={`w-full h-full bg-gradient-to-tr ${getCategoryImage(product.category)} opacity-80 flex items-center justify-center`}>
                        <span className="text-white text-4xl font-bold font-sans">
                          {product.productname.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Brand and category info */}
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{product.brand}</span>
                    <span className="px-2 py-0.5 text-[10px] font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-md">
                      {product.category}
                    </span>
                  </div>

                  {/* Title and details */}
                  <h3 className="text-base font-bold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors duration-200">
                    {product.productname}
                  </h3>
                  
                  <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed">
                    {product.productdec}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold text-slate-400 uppercase">Price</span>
                    <span className="text-lg font-extrabold text-slate-800">${product.price.toFixed(2)}</span>
                  </div>

                  <div>
                    {product.stock > 0 ? (
                      <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 rounded-lg border border-emerald-100">
                        {product.stock} In Stock
                      </span>
                    ) : (
                      <span className="px-2.5 py-1 text-[10px] font-bold text-rose-700 bg-rose-50 rounded-lg border border-rose-100">
                        Out of Stock
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default Products;
