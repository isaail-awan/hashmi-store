"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, Heart, Plus, Check, PackageX, LockKeyhole } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/lib/store";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";
import { WishlistHeart } from "@/components/WishlistHeart";

export default function WishlistPage() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);

  useEffect(() => {
    const load = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data, error } = await supabase
          .from("wishlist_items")
          .select("id, product_id, products(*)")
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });
        if (data) setItems(data.filter((row: any) => row.products));
        if (error) toast.error("Wishlist load nahi ho saki.");
      }
      setIsLoading(false);
    };
    load();
  }, []);

  const handleAddToCart = (product: any) => {
    addToCart(product, 1);
    toast.success(`${product.name} cart mein add ho gaya!`);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-leaf/20 border-t-leaf" />
        <p className="font-mono-tag text-sm font-medium text-ink-soft">Wishlist load ho rahi hai...</p>
      </div>
    );
  }

  if (!session) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-paper p-6 text-center font-sans">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-card">
          <LockKeyhole className="h-8 w-8 text-ink" />
        </div>
        <h1 className="mb-3 font-display text-3xl font-bold tracking-tight text-ink">
          Wishlist ke liye login karein
        </h1>
        <p className="mb-8 max-w-sm text-ink-soft">
          Apne pasandeeda products save karne ke liye pehle account mein login karein.
        </p>
        <Link href="/profile">
          <button className="rounded-full bg-ink px-8 py-4 font-display font-bold text-paper transition-all hover:bg-leaf-deep active:scale-[0.98]">
            Login Karein
          </button>
        </Link>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="flex min-h-screen flex-col items-center justify-center bg-paper p-6 text-center font-sans">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-leaf/40 bg-leaf-light">
          <Heart className="h-9 w-9 text-leaf" />
        </div>
        <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-ink">
          Wishlist khali hai.
        </h1>
        <p className="mb-8 text-lg font-medium text-ink-soft">
          Store mein jo pasand aaye, us par heart icon dabayein.
        </p>
        <Link href="/">
          <button className="rounded-full bg-ink px-8 py-4 font-display font-bold text-paper transition-all hover:bg-leaf-deep active:scale-[0.98]">
            Store Dekhein
          </button>
        </Link>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-paper py-12 font-sans md:py-20">
      <div className="container mx-auto max-w-7xl px-6 md:px-10">
        <Link
          href="/"
          className="mb-10 inline-flex items-center font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
        </Link>

        <h1 className="mb-12 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
          Meri Wishlist.
        </h1>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((row, i) => {
            const product = row.products;
            const inCart = cart.find((item) => item.id === product.id);
            const outOfStock = (product.stock ?? 0) <= 0;

            return (
              <Reveal key={row.id} delay={(i % 4) * 80}>
                <div className="group relative flex h-full flex-col rounded-[1.75rem] border-2 border-dashed border-border bg-card p-5 shadow-[0_2px_0_0_rgba(35,38,31,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-leaf/50 md:p-6">
                  <div className="absolute -left-2 -top-3 z-10">
                    <WishlistHeart productId={product.id} size="sm" />
                  </div>

                  <Link href={`/product/${product.id}`}>
                    <div className="relative mb-5 flex aspect-square w-full items-center justify-center overflow-hidden rounded-[1.25rem] border border-border bg-white p-6">
                      {outOfStock && (
                        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                          <span className="flex items-center gap-1.5 rounded-full bg-ink px-3 py-1.5 text-xs font-bold text-paper">
                            <PackageX className="h-3.5 w-3.5" /> Out of Stock
                          </span>
                        </div>
                      )}
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 768px) 45vw, 22vw"
                        className="object-contain mix-blend-multiply transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </Link>

                  <div className="flex flex-1 flex-col">
                    <p className="mb-1.5 font-mono-tag text-[11px] font-semibold uppercase tracking-widest text-leaf">
                      {product.category}
                    </p>
                    <Link href={`/product/${product.id}`}>
                      <h3 className="mb-2 line-clamp-2 font-display text-lg font-bold leading-tight text-ink">
                        {product.name}
                      </h3>
                    </Link>

                    <div className="mt-auto pt-4">
                      <span className="mb-3 block font-mono-tag text-2xl font-bold text-ink">
                        Rs. {product.price}
                      </span>
                      <button
                        onClick={() => handleAddToCart(product)}
                        disabled={outOfStock}
                        className={`flex h-11 w-full items-center justify-center gap-1.5 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                          inCart ? "bg-leaf text-paper" : "bg-ink text-paper hover:bg-leaf-deep"
                        }`}
                      >
                        {inCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                        {inCart ? "Cart mein hai" : "Add to Cart"}
                      </button>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </main>
  );
}
