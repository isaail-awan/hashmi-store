"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { useCartStore } from "@/lib/store";
import { Plus, Check, Tag, Truck, Leaf, Clock, PackageX } from "lucide-react";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";
import { RateTicker } from "@/components/RateTicker";
import { QuantityStepper } from "@/components/QuantityStepper";
import { WishlistHeart } from "@/components/WishlistHeart";
import { StarRating } from "@/components/StarRating";

const PAGE_SIZE = 12;

export default function Home() {
  const [products, setProducts] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [ratingStats, setRatingStats] = useState<Record<number, { avg: number; count: number }>>({});
  const addToCart = useCartStore((state) => state.addToCart);
  const cart = useCartStore((state) => state.cart);
  const searchQuery = useCartStore((state) => state.searchQuery);
  const activeCategory = useCartStore((state) => state.activeCategory);
  const setActiveCategory = useCartStore((state) => state.setActiveCategory);

  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .order("id", { ascending: false });
      if (data) setProducts(data);
      if (error) toast.error("Products load nahi ho sake!");
      setIsLoading(false);
    };
    const fetchRatingStats = async () => {
      const { data } = await supabase.from("reviews").select("product_id, rating");
      if (data) {
        const map: Record<number, { total: number; count: number }> = {};
        data.forEach((r: any) => {
          if (!map[r.product_id]) map[r.product_id] = { total: 0, count: 0 };
          map[r.product_id].total += r.rating;
          map[r.product_id].count += 1;
        });
        const stats: Record<number, { avg: number; count: number }> = {};
        Object.entries(map).forEach(([id, v]) => {
          stats[Number(id)] = { avg: v.total / v.count, count: v.count };
        });
        setRatingStats(stats);
      }
    };
    fetchProducts();
    fetchRatingStats();
  }, []);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)));
    return ["All", ...unique];
  }, [products]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== "All") {
      list = list.filter((p) => p.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) => p.name?.toLowerCase().includes(q) || p.category?.toLowerCase().includes(q)
      );
    }
    return list;
  }, [products, searchQuery, activeCategory]);

  const offers = filtered.filter((p) => p.is_offer);
  const regularProducts = filtered.filter((p) => !p.is_offer);
  const visibleRegularProducts = regularProducts.slice(0, visibleCount);
  const hasMore = visibleCount < regularProducts.length;

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, activeCategory]);

  const handleAddToCart = (product: any, qty: number) => {
    addToCart(product, qty);
    toast.success(`${qty}x ${product.name} cart mein add ho gaya!`);
  };

  const ProductCard = ({ product, index }: { product: any; index: number }) => {
    const inCart = cart.find((item) => item.id === product.id);
    const [qty, setQty] = useState(1);
    const outOfStock = (product.stock ?? 0) <= 0;
    const lowStock = !outOfStock && (product.stock ?? 0) <= 5;

    return (
      <Reveal delay={(index % 4) * 80}>
        <div className="group relative flex h-full flex-col rounded-[1.75rem] border-2 border-dashed border-border bg-card p-5 shadow-[0_2px_0_0_rgba(35,38,31,0.06)] transition-all duration-300 hover:-translate-y-1.5 hover:border-leaf/50 hover:shadow-[0_10px_24px_-8px_rgba(23,40,27,0.25)] md:p-6">
          <div className="absolute -top-2 left-1/2 hidden -translate-x-1/2 md:block">
            <div className="tag-hole" />
          </div>

          {product.is_offer && (
            <div className="absolute -right-2 -top-3 z-10 animate-stamp rotate-[-8deg] rounded-full border-2 border-chili bg-paper px-3 py-1.5 text-[11px] font-black uppercase tracking-wider text-chili shadow-sm">
              <span className="flex items-center gap-1">
                <Tag className="h-3 w-3" /> Sale
              </span>
            </div>
          )}

          <div className="absolute -left-2 -top-3 z-10">
            <WishlistHeart productId={product.id} size="sm" />
          </div>

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

          <div className="flex flex-1 flex-col">
            <div className="mb-1.5 flex items-center justify-between">
              <p className="font-mono-tag text-[11px] font-semibold uppercase tracking-widest text-leaf">
                {product.category}
              </p>
              {lowStock && (
                <span className="rounded-full bg-haldi/20 px-2 py-0.5 text-[10px] font-bold text-haldi-deep">
                  Sirf {product.stock} bache
                </span>
              )}
            </div>
            <h3 className="mb-1 line-clamp-2 font-display text-lg font-bold leading-tight text-ink">
              {product.name}
            </h3>

            {ratingStats[product.id] && (
              <div className="mb-2 flex items-center gap-1.5">
                <StarRating value={ratingStats[product.id].avg} size="sm" />
                <span className="text-xs font-semibold text-ink-soft">
                  ({ratingStats[product.id].count})
                </span>
              </div>
            )}

            <div className="mt-auto pt-4">
              <div className="mb-3 font-mono-tag">
                {product.is_offer && product.original_price ? (
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-ink-soft line-through">
                      Rs. {product.original_price}
                    </span>
                    <span className="text-2xl font-bold text-chili">Rs. {product.price}</span>
                  </div>
                ) : (
                  <span className="text-2xl font-bold text-ink">Rs. {product.price}</span>
                )}
              </div>

              <div className="flex items-center justify-between gap-2">
                {!outOfStock && (
                  <QuantityStepper
                    value={qty}
                    onChange={setQty}
                    max={product.stock ?? Infinity}
                    size="sm"
                  />
                )}
                <button
                  onClick={() => handleAddToCart(product, qty)}
                  disabled={outOfStock}
                  className={`flex h-11 flex-1 shrink-0 items-center justify-center gap-1.5 rounded-full text-sm font-bold shadow-sm transition-all active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 ${
                    inCart ? "bg-leaf text-paper" : "bg-ink text-paper hover:bg-leaf-deep"
                  }`}
                >
                  {inCart ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  {inCart ? "Cart mein hai" : "Add"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    );
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper font-sans">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-leaf/20 border-t-leaf" />
        <p className="font-mono-tag text-sm font-medium text-ink-soft">
          Rate-board taiyaar ho raha hai...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-paper pb-24 font-sans">
      <section className="relative overflow-hidden border-b-2 border-dashed border-border px-6 pb-0 pt-16 md:px-10 md:pt-24">
        <div className="container relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[1.2fr_0.8fr]">
            <Reveal>
              <div>
                <span className="mb-6 inline-flex items-center gap-2 rounded-full border-2 border-leaf/30 bg-leaf-light px-4 py-1.5 font-mono-tag text-xs font-bold uppercase tracking-wider text-leaf-deep">
                  <Truck className="h-3.5 w-3.5" /> Rawalpindi mein aaj hi delivery
                </span>
                <h1 className="max-w-xl font-display text-5xl font-bold leading-[1.05] tracking-tight text-ink md:text-7xl">
                  Aapke mohalle
                  <span className="relative mx-3 inline-block text-leaf">
                    ka rate-board
                    <svg
                      className="absolute -bottom-2 left-0 w-full text-haldi"
                      viewBox="0 0 200 12"
                      fill="none"
                      preserveAspectRatio="none"
                    >
                      <path
                        d="M2 9C40 2 160 2 198 9"
                        stroke="currentColor"
                        strokeWidth="5"
                        strokeLinecap="round"
                      />
                    </svg>
                  </span>
                  ab online hai.
                </h1>
                <p className="mt-6 max-w-lg text-lg font-medium leading-8 text-ink-soft md:text-xl">
                  Grocery, household aur roz-marra ki har cheez — bilkul wahi rate,
                  seedha aapke darwaze par. Naam likhwao, cart bharo, order confirm.
                </p>
                <div className="mt-8 flex flex-wrap gap-4">
                  <a
                    href="#store"
                    className="rounded-full bg-ink px-7 py-3.5 font-display text-base font-bold text-paper shadow-md transition-all hover:-translate-y-0.5 hover:bg-leaf-deep active:translate-y-0"
                  >
                    Store dekhein
                  </a>
                  <span className="flex items-center gap-2 font-mono-tag text-sm font-semibold text-ink-soft">
                    <Leaf className="h-4 w-4 text-leaf" /> Taaza stock, roz update
                  </span>
                </div>
              </div>
            </Reveal>

            <Reveal delay={150}>
              <div className="relative mx-auto w-full max-w-sm animate-drift">
                <div className="rotate-[3deg] rounded-[2rem] border-2 border-dashed border-leaf/40 bg-card p-6 shadow-[0_14px_0_-4px_rgba(23,40,27,0.12)]">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-display text-lg font-bold text-ink">Aaj Ka Rate</p>
                    <span className="flex items-center gap-1 font-mono-tag text-xs font-semibold text-leaf">
                      <Clock className="h-3.5 w-3.5" /> Live
                    </span>
                  </div>
                  <div className="space-y-3">
                    {(products.length
                      ? products.slice(0, 4)
                      : [
                          { name: "Cooking Oil", price: 2850 },
                          { name: "Basmati Rice", price: 1800 },
                          { name: "Washing Powder", price: 650 },
                          { name: "Tea", price: 1650 },
                        ]
                    ).map((p: any, i: number) => (
                      <div
                        key={i}
                        className="flex items-center justify-between border-b border-dashed border-border pb-2.5 last:border-0"
                      >
                        <span className="text-sm font-semibold text-ink">{p.name}</span>
                        <span className="font-mono-tag text-sm font-bold text-chili">
                          Rs. {p.price}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="absolute -bottom-4 -left-4 h-20 w-20 rounded-full bg-haldi/40 blur-2xl" />
              </div>
            </Reveal>
          </div>
        </div>

        <div className="mt-16">
          <RateTicker
            items={
              products.length
                ? products.map((p) => ({ name: p.name, price: p.price }))
                : [
                    { name: "Dalda Cooking Oil", price: 2850 },
                    { name: "Basmati Rice", price: 1800 },
                  ]
            }
          />
        </div>
      </section>

      <div id="store" className="container mx-auto max-w-7xl scroll-mt-24 px-6 md:px-10">
        {/* Category filters */}
        {categories.length > 1 && (
          <div className="scrollbar-none mt-14 flex gap-3 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 rounded-full border-2 px-5 py-2.5 font-mono-tag text-sm font-bold transition-all ${
                  activeCategory === cat
                    ? "border-ink bg-ink text-paper"
                    : "border-border bg-card text-ink-soft hover:border-leaf/50 hover:text-ink"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {offers.length > 0 && (
          <div className="mb-20 mt-16">
            <Reveal>
              <div className="mb-10 flex items-center gap-3">
                <div className="rounded-full border-2 border-chili/20 bg-chili/10 p-3">
                  <Tag className="h-6 w-6 text-chili" />
                </div>
                <h2 className="font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
                  Special Offers
                </h2>
              </div>
            </Reveal>

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {offers.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
          </div>
        )}

        <div className="mt-16">
          <Reveal>
            <h2 className="mb-10 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
              Explore Store
            </h2>
          </Reveal>

          {regularProducts.length === 0 && offers.length === 0 ? (
            <div className="rounded-[1.75rem] border-2 border-dashed border-border bg-card px-8 py-16 text-center">
              <p className="font-display text-xl font-bold text-ink">Koi cheez nahi mili</p>
              <p className="mt-2 text-ink-soft">Search ya category badal kar dobara try karein.</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {visibleRegularProducts.map((product, i) => (
                  <ProductCard key={product.id} product={product} index={i} />
                ))}
              </div>
              {hasMore && (
                <div className="mt-12 flex justify-center">
                  <button
                    onClick={() => setVisibleCount((v) => v + PAGE_SIZE)}
                    className="rounded-full border-2 border-dashed border-border bg-card px-8 py-3.5 font-display font-bold text-ink transition-all hover:border-leaf/50 hover:bg-leaf-light active:scale-95"
                  >
                    Aur Products Dekhein ({regularProducts.length - visibleCount} baaki)
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </main>
  );
}
