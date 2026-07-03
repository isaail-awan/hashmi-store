"use client";

import Link from "next/link";
import { ShoppingBasket, Search, User, Store, Heart } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCartStore, useWishlistStore } from "@/lib/store";

export function Navbar() {
  const cart = useCartStore((state) => state.cart);
  const searchQuery = useCartStore((state) => state.searchQuery);
  const setSearchQuery = useCartStore((state) => state.setSearchQuery);
  const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
  const wishlistCount = useWishlistStore((state) => state.wishlist.length);

  return (
    <nav className="sticky top-0 z-50 w-full border-b-2 border-leaf-deep/40 bg-leaf-deep/95 backdrop-blur-md">
      <div className="container mx-auto flex h-20 items-center justify-between gap-4 px-6 md:px-10">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-display text-2xl font-bold tracking-tight text-paper transition-opacity hover:opacity-90 md:text-3xl"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-haldi text-leaf-deep transition-transform duration-300 group-hover:-rotate-12">
            <Store className="h-5 w-5" strokeWidth={2.5} />
          </span>
          Hashmi Store
        </Link>

        <div className="hidden flex-1 items-center justify-center px-8 md:flex">
          <div className="group relative w-full max-w-md">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-paper/50 transition-colors group-focus-within:text-haldi" />
            <Input
              type="search"
              placeholder="Rice, oil, tea talaash karein..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-11 w-full rounded-full border-transparent bg-paper/10 pl-12 text-paper shadow-none placeholder:text-paper/40 focus-visible:bg-paper/15 focus-visible:ring-1 focus-visible:ring-haldi/60"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link href="/wishlist">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 rounded-full text-paper/80 transition-all hover:bg-paper/10 hover:text-paper"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span
                  key={wishlistCount}
                  className="absolute -right-1 -top-1 flex h-5 w-5 animate-thump items-center justify-center rounded-full bg-chili font-mono-tag text-[10px] font-bold text-paper ring-2 ring-leaf-deep"
                >
                  {wishlistCount}
                </span>
              )}
            </Button>
          </Link>

          <Link href="/profile">
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 rounded-full text-paper/80 transition-all hover:bg-paper/10 hover:text-paper"
            >
              <User className="h-5 w-5" />
            </Button>
          </Link>

          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative h-11 w-11 rounded-full text-paper/80 transition-all hover:bg-paper/10 hover:text-paper"
            >
              <ShoppingBasket className="h-5 w-5" />
              {totalItems > 0 && (
                <span
                  key={totalItems}
                  className="absolute -right-1 -top-1 flex h-5 w-5 animate-thump items-center justify-center rounded-full bg-chili font-mono-tag text-[10px] font-bold text-paper ring-2 ring-leaf-deep"
                >
                  {totalItems}
                </span>
              )}
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}
