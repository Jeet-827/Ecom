import { useState, useEffect, useRef } from 'react';
import { Search, ShoppingCart, Heart, Star, User, ChevronDown, Plus, Minus, Trash2, X } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { clearToke } from '../stores/feature/AuthSclice';
import api, { productApi } from '../api';

interface ProductType {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  image: string;
  rating: number;
  reviews: number;
  badge?: string;
}

const EcommercePage = () => {
  const dispatch = useDispatch();
  const [products, setProducts] = useState<ProductType[]>([]);
  const [allProducts, setAllProducts] = useState<ProductType[]>([]);
  const [cartItems, setCartItems] = useState<{ productId: string; quantity: number }[]>([]);
  const [showCartDrawer, setShowCartDrawer] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('Newest First');
  const [cart, setCart] = useState(0);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [showLoginMenu, setShowLoginMenu] = useState(false);
  const [user, setUser] = useState<{ username: string; email: string } | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showMobileSuggestions, setShowMobileSuggestions] = useState(false);

  // Reference for pending debounced quantity updates per product
  const pendingUpdates = useRef<{ [productId: string]: { quantity: number; timeoutId: any } }>({});

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      Object.values(pendingUpdates.current).forEach(upd => clearTimeout(upd.timeoutId));
    };
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await productApi.get('/', {
          params: {
            search: searchQuery,
            sort: sortBy
          }
        });
        
        // Normalize products from backend schema to frontend structure
        const normalized = res.data.map((p: any) => ({
          id: p._id,
          name: p.productname,
          price: p.price,
          originalPrice: Math.round(p.price * 1.4),
          image: p.productimage,
          rating: p.rating || (4.5 + (p.productname.length % 5) * 0.1),
          reviews: p.reviews || (Math.abs(p.productname.charCodeAt(0) * 3) % 200 + 50),
          badge: p.isFeatured ? "HOT" : (p.price > 200 ? "SALE" : ""),
        }));
        
        setProducts(normalized);
        setError('');
      } catch (err: any) {
        console.error("Failed to fetch products:", err);
        setError("Could not load products. Please check if the services are running.");
      } finally {
        setLoading(false);
      }
    };

    const handler = setTimeout(() => {
      fetchProducts();
    }, 300);

    return () => clearTimeout(handler);
  }, [searchQuery, sortBy]);

  useEffect(() => {
    const fetchCartAndAllProducts = async () => {
      try {
        // Fetch cart items
        const cartRes = await api.get('/cart');
        const items = cartRes.data.cart || [];
        setCartItems(items);
        const totalQty = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
        setCart(totalQty);

        // Fetch all products (master list) for cart lookups
        const productsRes = await productApi.get('/');
        const normalized = productsRes.data.map((p: any) => ({
          id: p._id,
          name: p.productname,
          price: p.price,
          originalPrice: Math.round(p.price * 1.4),
          image: p.productimage,
          rating: p.rating || (4.5 + (p.productname.length % 5) * 0.1),
          reviews: p.reviews || (Math.abs(p.productname.charCodeAt(0) * 3) % 200 + 50),
          badge: p.isFeatured ? "HOT" : (p.price > 200 ? "SALE" : ""),
        }));
        setAllProducts(normalized);

        // Fetch user profile
        try {
          const profileRes = await api.get('/profile');
          if (profileRes.data.user) {
            setUser(profileRes.data.user);
          }
        } catch (profileErr) {
          console.error("Failed to load user profile:", profileErr);
        }
      } catch (err) {
        console.error("Failed to load initial cart/products:", err);
      }
    };
    fetchCartAndAllProducts();
  }, []);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFav = new Set(prev);
      newFav.has(id) ? newFav.delete(id) : newFav.add(id);
      return newFav;
    });
  };

  const addToCart = async (productId: string) => {
    try {
      const res = await api.post('/cart', { productId, quantity: 1 });
      const items = res.data.cart || [];
      setCartItems(items);
      const totalQty = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
      setCart(totalQty);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    }
  };

  const updateQuantity = (productId: string, quantity: number) => {
    // 1. Optimistically update the UI state immediately
    setCartItems(prev => {
      let updated;
      if (quantity <= 0) {
        updated = prev.filter(item => item.productId !== productId);
      } else {
        // If it doesn't exist yet, we add it, otherwise update quantity
        const exists = prev.some(item => item.productId === productId);
        if (exists) {
          updated = prev.map(item =>
            item.productId === productId ? { ...item, quantity } : item
          );
        } else {
          updated = [...prev, { productId, quantity }];
        }
      }
      const totalQty = updated.reduce((sum, item) => sum + item.quantity, 0);
      setCart(totalQty);
      return updated;
    });

    // 2. Clear any pending timeout for this specific product
    if (pendingUpdates.current[productId]) {
      clearTimeout(pendingUpdates.current[productId].timeoutId);
    }

    // 3. Set a new timeout to write to database after 500ms
    const timeoutId = setTimeout(async () => {
      try {
        const res = await api.put('/cart', { productId, quantity });
        const serverItems = res.data.cart || [];
        
        // Verify this is still the most recent pending update for this product
        if (pendingUpdates.current[productId]?.timeoutId === timeoutId) {
          setCartItems(serverItems);
          const totalQty = serverItems.reduce((sum: number, item: any) => sum + item.quantity, 0);
          setCart(totalQty);
          delete pendingUpdates.current[productId];
        }
      } catch (err) {
        console.error("Failed to persist cart quantity:", err);
      }
    }, 500);

    pendingUpdates.current[productId] = { quantity, timeoutId };
  };

  const getProductDetails = (productId: string) => {
    return allProducts.find(p => p.id === productId);
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      dispatch(clearToke());
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-50 bg-white shadow-md border-b-4 border-blue-600">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-3xl font-bold text-blue-600">TechHub</h1>
            <div className="flex items-center gap-6">
              <div className="relative hidden md:flex items-center bg-gray-100 rounded-lg px-4 py-2 flex-1 max-w-xs">
                <Search size={18} className="text-gray-500" />
                <input
                  type="text"
                  placeholder="Search products..."
                  className="bg-transparent ml-2 outline-none w-full text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
                />

                {showSuggestions && searchQuery && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                    {allProducts
                      .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                      .slice(0, 5)
                      .map(p => (
                        <div
                          key={p.id}
                          onClick={() => {
                            setSearchQuery(p.name);
                            setShowSuggestions(false);
                            const el = document.getElementById(`product-${p.id}`);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }}
                          className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 transition text-left"
                        >
                          <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-lg overflow-hidden shrink-0 border border-gray-200">
                            {p.image && typeof p.image === 'string' && p.image.startsWith('http') ? (
                              <img src={p.image} className="w-full h-full object-cover" alt="" />
                            ) : (
                              p.image || '📦'
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                            <p className="text-xs text-gray-500 font-bold">${p.price}</p>
                          </div>
                        </div>
                      ))}
                    {allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                      <div className="p-3 text-sm text-gray-500 text-center">No matching suggestions</div>
                    )}
                  </div>
                )}
              </div>

              <div className="relative">
                <button
                  onClick={() => setShowLoginMenu(!showLoginMenu)}
                  className="flex items-center gap-2 px-4 py-2 text-blue-600 font-semibold hover:bg-blue-50 rounded-lg transition"
                >
                  <User size={20} />
                  <span className="hidden sm:inline">
                    {user ? `Hi, ${user.username}` : 'Account'}
                  </span>
                  <ChevronDown size={16} className={`transition ${showLoginMenu ? 'rotate-180' : ''}`} />
                </button>

                {showLoginMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-100">
                      <p className="text-xs text-gray-400 font-medium animate-pulse">Logged in as</p>
                      <p className="text-sm font-bold text-gray-800 truncate">{user?.username || 'User'}</p>
                      <p className="text-xs text-gray-500 truncate mt-0.5">{user?.email || ''}</p>
                    </div>
                    <div className="py-1">
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">Your Orders</a>
                      <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition">Wishlist</a>
                    </div>
                    <div className="border-t border-gray-100 py-1">
                      <button
                        onClick={handleLogout}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 font-semibold hover:bg-red-50 transition"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowCartDrawer(true)}
                className="relative"
              >
                <ShoppingCart size={24} className="text-gray-700 hover:text-blue-600 transition" />
                {cart > 0 && (
                  <span className="absolute -top-2 -right-2 bg-blue-600 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                    {cart}
                  </span>
                )}
              </button>
            </div>
          </div>
          <div className="relative md:hidden flex items-center bg-gray-100 rounded-lg px-3 py-2">
            <Search size={16} className="text-gray-500" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent ml-2 outline-none w-full text-xs"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onFocus={() => setShowMobileSuggestions(true)}
              onBlur={() => setTimeout(() => setShowMobileSuggestions(false), 200)}
            />

            {showMobileSuggestions && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-xl overflow-hidden z-50 max-h-60 overflow-y-auto">
                {allProducts
                  .filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .slice(0, 5)
                  .map(p => (
                    <div
                      key={p.id}
                      onClick={() => {
                        setSearchQuery(p.name);
                        setShowMobileSuggestions(false);
                        const el = document.getElementById(`product-${p.id}`);
                        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }}
                      className="flex items-center gap-3 p-3 hover:bg-blue-50 cursor-pointer border-b last:border-0 transition text-left"
                    >
                      <div className="w-8 h-8 rounded bg-gray-100 flex items-center justify-center text-lg overflow-hidden shrink-0 border border-gray-200">
                        {p.image && typeof p.image === 'string' && p.image.startsWith('http') ? (
                          <img src={p.image} className="w-full h-full object-cover" alt="" />
                        ) : (
                          p.image || '📦'
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{p.name}</p>
                        <p className="text-xs text-gray-500 font-bold">${p.price}</p>
                      </div>
                    </div>
                  ))}
                {allProducts.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase())).length === 0 && (
                  <div className="p-3 text-sm text-gray-500 text-center">No matching suggestions</div>
                )}
              </div>
            )}
          </div>
        </div>
      </header>

      <section className="bg-gradient-to-r from-blue-600 via-blue-500 to-blue-700 text-white py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="text-sm font-semibold text-blue-100 mb-4">🎉 SUMMER MEGA SALE</div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4">Up to 50% OFF</h2>
              <p className="text-lg text-blue-100 mb-6">Premium tech products at unbeatable prices. Limited time only!</p>
              <button className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold hover:bg-blue-50 transition transform hover:scale-105">
                Shop Now
              </button>
            </div>
            <div className="text-6xl text-center">🎁</div>
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl p-8 mb-12 shadow-lg">
          <h3 className="text-2xl font-bold mb-2">Flash Deal Alert! ⚡</h3>
          <p className="text-blue-100 mb-4">New arrivals in stock. Don't miss out on the latest tech gadgets.</p>
          <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition">
            View Flash Deals
          </button>
        </div>

        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option>Newest First</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Most Popular</option>
          </select>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse border border-gray-100">
                <div className="bg-gray-200 h-40 flex items-center justify-center">
                  <div className="text-4xl text-gray-300">📦</div>
                </div>
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-6 bg-gray-200 rounded w-2/3"></div>
                  <div className="h-10 bg-gray-200 rounded w-full mt-4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-600 rounded-lg p-6 mb-12 border border-red-200 text-center">
            <p className="font-semibold">{error}</p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSortBy('Newest First');
              }}
              className="mt-3 bg-red-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-red-700 transition"
            >
              Retry & Reset Filters
            </button>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-gray-50 text-gray-500 rounded-lg p-12 mb-12 border border-gray-200 text-center">
            <p className="text-xl font-semibold mb-2">No Products Found 🔍</p>
            <p className="text-sm text-gray-400">Try adjusting your search query or sorting options.</p>
            <button
              onClick={() => setSearchQuery('')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700 transition"
            >
              Clear Search
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            {products.map((product) => (
            <div
              key={product.id}
              id={`product-${product.id}`}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition transform hover:scale-105 duration-300 overflow-hidden group border border-gray-100"
            >
              <div className="relative bg-gray-100 h-40 flex items-center justify-center overflow-hidden">
                {product.image && typeof product.image === 'string' && product.image.startsWith('http') ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition duration-300"
                  />
                ) : (
                  <div className="text-6xl group-hover:scale-110 transition duration-300">
                    {product.image || '📦'}
                  </div>
                )}

                {product.badge && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                    {product.badge}
                  </div>
                )}

                <button
                  onClick={() => toggleFavorite(product.id)}
                  className="absolute top-3 left-3 bg-white rounded-full p-2 hover:bg-gray-100 transition"
                >
                  <Heart
                    size={18}
                    className={`transition ${favorites.has(product.id) ? 'fill-red-500 text-red-500' : 'text-gray-400'}`}
                  />
                </button>
              </div>

              <div className="p-4">
                <h3 className="font-semibold text-gray-900 text-sm mb-2 h-10 overflow-hidden">
                  {product.name}
                </h3>

                <div className="flex items-center gap-1 mb-3">
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={i < Math.floor(product.rating) ? 'fill-current' : 'text-gray-300'}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-gray-500">({product.reviews})</span>
                </div>

                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-gray-900">${product.price}</span>
                    <span className="text-sm text-gray-400 line-through">${product.originalPrice}</span>
                  </div>
                  <div className="text-xs text-green-600 font-semibold">
                    Save ${product.originalPrice - product.price}
                  </div>
                </div>

                <button
                  onClick={() => addToCart(product.id)}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-2 rounded-lg font-semibold hover:from-blue-700 hover:to-blue-800 transition transform hover:scale-105"
                >
                  Add to Cart
                </button>
              </div>
            </div>
          ))}
          </div>
        )}

        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-8 mb-12 shadow-lg">
          <div className="grid md:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-3xl font-bold text-white mb-2">Free Shipping Offer 🚚</h3>
              <p className="text-blue-100 mb-4">Get free shipping on orders above $50. Use code FREESHIP50</p>
              <button className="bg-white text-blue-600 px-6 py-2 rounded-full font-semibold hover:bg-blue-50 transition">
                Copy Code
              </button>
            </div>
            <div className="text-right text-5xl">📦</div>
          </div>
        </div>

        <section className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl p-8 text-white mb-12">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">Stay Updated with Latest Deals</h3>
            <p className="text-blue-100 mb-6">Subscribe to our newsletter and get exclusive offers delivered to your inbox.</p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-300"
              />
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition">
                Subscribe
              </button>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-gray-300 py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-bold mb-4">About Us</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">About TechHub</a></li>
                <li><a href="#" className="hover:text-white transition">Blog</a></li>
                <li><a href="#" className="hover:text-white transition">Careers</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Customer Service</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Contact Us</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Returns</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Policies</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms & Conditions</a></li>
                <li><a href="#" className="hover:text-white transition">Shipping Info</a></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-4">Follow Us</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Facebook</a></li>
                <li><a href="#" className="hover:text-white transition">Twitter</a></li>
                <li><a href="#" className="hover:text-white transition">Instagram</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-sm">
            <p>&copy; 2024 TechHub. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {showCartDrawer && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/55 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setShowCartDrawer(false)}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex">
            {/* Drawer Panel */}
            <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l border-gray-150">
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-50 text-blue-600 p-2 rounded-lg">
                    <ShoppingCart size={20} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">Your Cart</h3>
                </div>
                <button
                  onClick={() => setShowCartDrawer(false)}
                  className="text-gray-400 hover:text-gray-600 p-2 rounded-lg hover:bg-gray-100 transition"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                    <span className="text-6xl animate-bounce">🛒</span>
                    <div>
                      <p className="text-lg font-bold text-gray-800">Your cart is empty</p>
                      <p className="text-sm text-gray-500 max-w-xs mt-1">
                        Add some awesome premium tech products to get started!
                      </p>
                    </div>
                    <button
                      onClick={() => setShowCartDrawer(false)}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg transition"
                    >
                      Start Shopping
                    </button>
                  </div>
                ) : (
                  cartItems.map((item) => {
                    const product = getProductDetails(item.productId);
                    if (!product) return null;
                    return (
                      <div
                        key={item.productId}
                        className="flex items-center gap-4 bg-slate-50/50 p-4 rounded-xl border border-gray-100 hover:border-blue-100 hover:bg-blue-50/10 transition duration-300"
                      >
                        {/* Image/Emoji */}
                        <div className="w-16 h-16 bg-white rounded-lg border border-gray-100 flex items-center justify-center text-4xl shadow-sm overflow-hidden shrink-0">
                          {product.image && typeof product.image === 'string' && product.image.startsWith('http') ? (
                            <img src={product.image} className="w-full h-full object-cover" alt="" />
                          ) : (
                            product.image || '📦'
                          )}
                        </div>

                        {/* Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 text-sm truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center gap-2 mt-1">
                            <span className="font-bold text-gray-900 text-sm">
                              ${product.price}
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              ${product.originalPrice}
                            </span>
                          </div>
                        </div>

                        {/* Controls */}
                        <div className="flex flex-col items-end justify-between gap-3">
                          <button
                            onClick={() => updateQuantity(item.productId, 0)}
                            className="text-gray-400 hover:text-red-500 transition p-1"
                          >
                            <Trash2 size={16} />
                          </button>

                          <div className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                              className="text-gray-500 hover:bg-gray-100 p-1 rounded transition"
                            >
                              <Minus size={12} />
                            </button>
                            <span className="text-xs font-bold text-gray-800 w-4 text-center">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                              className="text-gray-500 hover:bg-gray-100 p-1 rounded transition"
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Footer Summary */}
              {cartItems.length > 0 && (
                <div className="px-6 py-6 border-t border-gray-100 bg-gray-50/50 space-y-4">
                  <div className="flex items-center justify-between text-base">
                    <span className="text-gray-600 font-medium">Subtotal</span>
                    <span className="text-xl font-bold text-gray-900">
                      $
                      {cartItems.reduce((sum, item) => {
                        const prod = getProductDetails(item.productId);
                        return sum + (prod ? prod.price * item.quantity : 0);
                      }, 0)}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Shipping and taxes calculated at checkout.
                  </p>
                  <button className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3.5 rounded-xl transition transform hover:scale-[1.02] shadow-lg shadow-blue-500/10">
                    Proceed to Checkout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcommercePage;