import { useState, useEffect } from 'react';
import { 
  ShoppingCart, 
  Gift, 
  Search, 
  Filter, 
  Star,
  ShoppingBag,
  CreditCard,
  Package,
  Plus,
  Minus,
  Trash2
} from 'lucide-react';
import { redeemApi, Product, CartItem, Order } from '../services/redeemApi';
import { useWallet } from '../contexts/WalletContext';

type TabType = 'products' | 'cart' | 'orders';
type CategoryType = 'all' | 'gift_card' | 'digital_credit' | 'subscription' | 'voucher';

const Redeem = () => {
  const { wallet } = useWallet();
  const balance = wallet?.balance || 0;
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const [category, setCategory] = useState<CategoryType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cartTotal, setCartTotal] = useState(0);
  const [showFilters, setShowFilters] = useState(false);

  // Categories
  const categories = [
    { id: 'all', label: 'All Products', icon: Package },
    { id: 'gift_card', label: 'Gift Cards', icon: Gift },
    { id: 'digital_credit', label: 'Digital Credits', icon: CreditCard },
    { id: 'subscription', label: 'Subscriptions', icon: Star },
    { id: 'voucher', label: 'Vouchers', icon: ShoppingBag },
  ];

  // Load products
  useEffect(() => {
    loadProducts();
  }, [category, searchQuery]);

  // Load cart
  useEffect(() => {
    if (activeTab === 'cart') {
      loadCart();
    }
  }, [activeTab]);

  // Load orders
  useEffect(() => {
    if (activeTab === 'orders') {
      loadOrders();
    }
  }, [activeTab]);

  // Calculate cart total
  useEffect(() => {
    const total = cart.reduce((sum, item) => {
      const price = item.product?.price || 0;
      return sum + (price * item.quantity);
    }, 0);
    setCartTotal(total);
  }, [cart]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const filters = {
        category: category !== 'all' ? category : undefined,
        search: searchQuery || undefined,
      };
      const data = await redeemApi.getProducts(filters);
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCart = async () => {
    try {
      setLoading(true);
      const data = await redeemApi.getCart();
      setCart(data);
    } catch (error) {
      console.error('Error loading cart:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadOrders = async () => {
    try {
      setLoading(true);
      const data = await redeemApi.getOrders();
      setOrders(data.orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (productId: string) => {
    try {
      await redeemApi.addToCart(productId, 1);
      if (activeTab === 'cart') {
        loadCart();
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
    }
  };

  const handleUpdateQuantity = async (productId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await redeemApi.updateCartItem(productId, quantity);
      loadCart();
    } catch (error) {
      console.error('Error updating quantity:', error);
    }
  };

  const handleRemoveFromCart = async (productId: string) => {
    try {
      await redeemApi.removeFromCart(productId);
      loadCart();
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;

    try {
      const items = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      await redeemApi.createOrder({
        items,
        paymentMethod: 'wallet',
      });

      // Refresh cart and switch to orders tab
      setCart([]);
      setActiveTab('orders');
      loadOrders();
    } catch (error) {
      console.error('Error during checkout:', error);
    }
  };

  // Product Card Component
  const ProductCard = ({ product }: { product: Product }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={product.image || '/placeholder-product.jpg'}
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.discount && (
          <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            {product.discount}% OFF
          </div>
        )}
        {product.stock < 10 && product.stock > 0 && (
          <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded text-xs">
            Only {product.stock} left
          </div>
        )}
        {product.stock === 0 && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <span className="text-white font-semibold">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-gray-900 mb-1">{product.name}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">{product.description}</p>
        
        {product.rating && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="text-sm font-medium">{product.rating}</span>
            {product.reviewCount && (
              <span className="text-xs text-gray-500">({product.reviewCount})</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between mt-3">
          <div>
            <div className="text-xl font-bold text-gray-900">₹{product.price}</div>
            {product.originalPrice && (
              <div className="text-sm text-gray-500 line-through">₹{product.originalPrice}</div>
            )}
          </div>
          <button
            onClick={() => handleAddToCart(product._id)}
            disabled={product.stock === 0}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            Add
          </button>
        </div>
      </div>
    </div>
  );

  // Cart Item Component
  const CartItemCard = ({ item }: { item: CartItem }) => {
    if (!item.product) return null;

    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-4">
          <img
            src={item.product.image || '/placeholder-product.jpg'}
            alt={item.product.name}
            className="w-24 h-24 object-cover rounded-lg"
          />
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{item.product.name}</h3>
            <p className="text-sm text-gray-600 mb-2">{item.product.description}</p>
            <div className="text-lg font-bold text-gray-900">₹{item.product.price}</div>
          </div>
          <div className="flex flex-col items-end justify-between">
            <button
              onClick={() => handleRemoveFromCart(item.productId)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-8 text-center font-semibold">{item.quantity}</span>
              <button
                onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                className="w-8 h-8 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Order Card Component
  const OrderCard = ({ order }: { order: Order }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="text-sm text-gray-600">Order #{order._id.slice(-8)}</div>
          <div className="text-xs text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</div>
        </div>
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${
          order.status === 'completed' ? 'bg-green-100 text-green-700' :
          order.status === 'processing' ? 'bg-blue-100 text-blue-700' :
          order.status === 'failed' ? 'bg-red-100 text-red-700' :
          'bg-yellow-100 text-yellow-700'
        }`}>
          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
        </div>
      </div>

      <div className="space-y-2 mb-3">
        {order.items.map((item, index) => (
          <div key={index} className="flex items-center gap-3">
            <img
              src={item.product.image || '/placeholder-product.jpg'}
              alt={item.product.name}
              className="w-12 h-12 object-cover rounded"
            />
            <div className="flex-1">
              <div className="text-sm font-medium">{item.product.name}</div>
              <div className="text-xs text-gray-600">Qty: {item.quantity}</div>
            </div>
            <div className="text-sm font-semibold">₹{item.price * item.quantity}</div>
          </div>
        ))}
      </div>

      <div className="border-t pt-3 flex items-center justify-between">
        <span className="font-semibold">Total:</span>
        <span className="text-lg font-bold">₹{order.totalAmount}</span>
      </div>

      {order.status === 'completed' && order.redemptionCodes && (
        <div className="mt-3 p-3 bg-green-50 rounded-lg">
          <div className="text-sm font-medium text-green-800 mb-2">Redemption Codes:</div>
          {order.redemptionCodes.map((code, index) => (
            <div key={index} className="text-sm text-green-700 font-mono">{code.code}</div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Redeem Store</h1>
          <p className="text-gray-600 mt-1">Redeem your earnings for amazing rewards</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="bg-blue-50 px-4 py-2 rounded-lg">
            <div className="text-sm text-blue-600">Wallet Balance</div>
            <div className="text-xl font-bold text-blue-700">₹{balance}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('products')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'products'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingBag className="w-5 h-5" />
              Products
            </div>
          </button>
          <button
            onClick={() => setActiveTab('cart')}
            className={`flex-1 px-6 py-4 font-medium transition-colors relative ${
              activeTab === 'cart'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <ShoppingCart className="w-5 h-5" />
              Cart
              {cart.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cart.length}
                </span>
              )}
            </div>
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`flex-1 px-6 py-4 font-medium transition-colors ${
              activeTab === 'orders'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Package className="w-5 h-5" />
              Orders
            </div>
          </button>
        </div>

        <div className="p-6">
          {/* Products Tab */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              {/* Search and Filters */}
              <div className="flex gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
                >
                  <Filter className="w-5 h-5" />
                  Filters
                </button>
              </div>

              {/* Categories */}
              <div className="flex gap-2 flex-wrap">
                {categories.map((cat) => {
                  const Icon = cat.icon;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setCategory(cat.id as CategoryType)}
                      className={`px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                        category === cat.id
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {cat.label}
                    </button>
                  );
                })}
              </div>

              {/* Products Grid */}
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading products...</p>
                </div>
              ) : products.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No products found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id} product={product} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Cart Tab */}
          {activeTab === 'cart' && (
            <div className="space-y-6">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading cart...</p>
                </div>
              ) : cart.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingCart className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">Your cart is empty</p>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Browse Products
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    {cart.map((item) => (
                      <CartItemCard key={item.productId} item={item} />
                    ))}
                  </div>

                  {/* Cart Summary */}
                  <div className="bg-gray-50 rounded-lg p-6">
                    <div className="space-y-2 mb-4">
                      <div className="flex justify-between text-gray-600">
                        <span>Subtotal:</span>
                        <span>₹{cartTotal}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>₹{cartTotal}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleCheckout}
                      disabled={cartTotal > balance}
                      className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed font-semibold transition-colors"
                    >
                      {cartTotal > balance ? 'Insufficient Balance' : 'Proceed to Checkout'}
                    </button>

                    {cartTotal > balance && (
                      <p className="text-sm text-red-600 text-center mt-2">
                        You need ₹{cartTotal - balance} more to complete this purchase
                      </p>
                    )}
                  </div>
                </>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-600 mt-4">Loading orders...</p>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-4">No orders yet</p>
                  <button
                    onClick={() => setActiveTab('products')}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {orders.map((order) => (
                    <OrderCard key={order._id} order={order} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Redeem;
