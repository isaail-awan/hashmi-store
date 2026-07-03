import { create } from 'zustand';

export interface CartItem {
  id: number;
  name: string;
  price: number;
  image: string;
  quantity: number;
  stock?: number;
}

interface CartState {
  cart: CartItem[];
  searchQuery: string;
  activeCategory: string; // "All" ya koi specific category
  addToCart: (item: any, qty?: number) => void;
  removeFromCart: (id: number) => void;
  updateQuantity: (id: number, qty: number) => void;
  clearCart: () => void;
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: string) => void;
}

export const useCartStore = create<CartState>((set) => ({
  cart: [],
  searchQuery: "",
  activeCategory: "All",

  addToCart: (item, qty = 1) => set((state) => {
    const existingItem = state.cart.find((c) => c.id === item.id);
    const maxStock = item.stock ?? Infinity;

    if (existingItem) {
      const nextQty = Math.min(existingItem.quantity + qty, maxStock);
      return {
        cart: state.cart.map((c) =>
          c.id === item.id ? { ...c, quantity: nextQty } : c
        ),
      };
    }
    return { cart: [...state.cart, { ...item, quantity: Math.min(qty, maxStock) }] };
  }),

  removeFromCart: (id) => set((state) => ({
    cart: state.cart.filter((c) => c.id !== id),
  })),

  updateQuantity: (id, qty) => set((state) => {
    if (qty <= 0) {
      return { cart: state.cart.filter((c) => c.id !== id) };
    }
    return {
      cart: state.cart.map((c) =>
        c.id === id ? { ...c, quantity: Math.min(qty, c.stock ?? Infinity) } : c
      ),
    };
  }),

  clearCart: () => set({ cart: [] }),

  setSearchQuery: (query) => set({ searchQuery: query }),
  setActiveCategory: (category) => set({ activeCategory: category }),
}));

// -----------------------------------------------------------------
// Wishlist store — sirf product IDs rakhta hai (Phase 3)
// Actual read/write Supabase se hota hai; ye sirf UI state mirror hai
// takay Navbar, product card aur wishlist page sab sync rahein.
// -----------------------------------------------------------------
interface WishlistState {
  wishlist: number[];
  setWishlist: (ids: number[]) => void;
  addWishlistId: (id: number) => void;
  removeWishlistId: (id: number) => void;
}

export const useWishlistStore = create<WishlistState>((set) => ({
  wishlist: [],
  setWishlist: (ids) => set({ wishlist: ids }),
  addWishlistId: (id) => set((state) => ({ wishlist: [...state.wishlist, id] })),
  removeWishlistId: (id) => set((state) => ({ wishlist: state.wishlist.filter((w) => w !== id) })),
}));
