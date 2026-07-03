"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ShieldCheck, Truck, Plus, PackageX } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";
import { QuantityStepper } from "@/components/QuantityStepper";
import { WishlistHeart } from "@/components/WishlistHeart";
import { ReviewSection } from "@/components/ReviewSection";
import { StarRating } from "@/components/StarRating";

export default function ProductDetails() {
  const params = useParams();
  const productId = Number(params.id);
  const addToCart = useCartStore((state) => state.addToCart);

  const [product, setProduct] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [justAdded, setJustAdded] = useState(false);
  const [qty, setQty] = useState(1);
  const [ratingStats, setRatingStats] = useState<{ avg: number; count: number }>({ avg: 0, count: 0 });

  useEffect(() => {
    async function fetchSingleProduct() {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", productId)
        .single();

      if (data) setProduct(data);
      if (error) console.error("Error fetching single product:", error);
      setIsLoading(false);
    }

    async function fetchRatingStats() {
      const { data } = await supabase.from("reviews").select("rating").eq("product_id", productId);
      if (data && data.length) {
        const avg = data.reduce((sum: number, r: any) => sum + r.rating, 0) / data.length;
        setRatingStats({ avg, count: data.length });
      } else {
        setRatingStats({ avg: 0, count: 0 });
      }
    }

    if (productId) {
      fetchSingleProduct();
      fetchRatingStats();
    }
  }, [productId]);

  const outOfStock = !!product && (product.stock ?? 0) <= 0;
  const lowStock = !!product && !outOfStock && (product.stock ?? 0) <= 5;

  const handleAdd = () => {
    if (!product || outOfStock) return;
    addToCart(product, qty);
    toast.success(`${qty}x ${product.name} cart mein add ho gaya!`);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 350);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-leaf/20 border-t-leaf" />
        <p className="font-mono-tag text-sm font-medium text-ink-soft">
          Product tag dhoond rahe hain...
        </p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-paper px-6 text-center">
        <h1 className="font-display text-3xl font-bold text-ink">Product Nahi Mila</h1>
        <p className="max-w-sm text-ink-soft">
          Ho sakta hai ye item ab store mein na ho, ya link galat ho.
        </p>
        <Link href="/">
          <Button className="mt-2 rounded-full bg-ink px-6 text-paper hover:bg-leaf-deep">
            Store par wapas jayein
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-paper py-12 font-sans">
      <div className="container mx-auto max-w-5xl px-4 md:px-6">
        <Link
          href="/"
          className="mb-8 inline-flex items-center font-medium text-leaf hover:text-leaf-deep"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Store ki taraf wapas
        </Link>

        <Reveal>
          <div className="flex flex-col overflow-hidden rounded-[2rem] border-2 border-dashed border-border bg-card shadow-sm md:flex-row">
            <div className="relative flex aspect-square items-center justify-center bg-white p-8 md:w-1/2">
              {product.is_offer && (
                <div className="absolute left-6 top-6 z-10 animate-stamp rotate-[-8deg] rounded-full border-2 border-chili bg-paper px-3 py-1.5 text-xs font-black uppercase tracking-wider text-chili shadow-sm">
                  Sale
                </div>
              )}
              {outOfStock && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                  <span className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-sm font-bold text-paper">
                    <PackageX className="h-4 w-4" /> Out of Stock
                  </span>
                </div>
              )}
              <Image
                src={product.image}
                alt={product.name}
                fill
                sizes="(max-width: 768px) 90vw, 45vw"
                className="object-contain p-8 mix-blend-multiply"
              />
            </div>

            <div className="flex flex-col justify-center p-8 md:w-1/2 md:p-12">
              <span className="mb-4 w-fit rounded-full border border-leaf/30 bg-leaf-light px-3 py-1 font-mono-tag text-xs font-bold uppercase tracking-wider text-leaf-deep">
                {product.category}
              </span>

              <h1 className="mb-2 font-display text-3xl font-bold leading-tight text-ink md:text-4xl">
                {product.name}
              </h1>

              {ratingStats.count > 0 && (
                <div className="mb-4 flex items-center gap-2">
                  <StarRating value={ratingStats.avg} size="sm" />
                  <span className="text-sm font-semibold text-ink-soft">
                    {ratingStats.avg.toFixed(1)} ({ratingStats.count} review{ratingStats.count > 1 ? "s" : ""})
                  </span>
                </div>
              )}

              <div className="mb-2 font-mono-tag">
                {product.is_offer && product.original_price ? (
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-medium text-ink-soft line-through">
                      Rs. {product.original_price}
                    </span>
                    <span className="text-3xl font-bold text-chili">Rs. {product.price}</span>
                  </div>
                ) : (
                  <span className="text-3xl font-bold text-ink">Rs. {product.price}</span>
                )}
              </div>

              {lowStock && (
                <p className="mb-4 text-sm font-bold text-haldi-deep">
                  Jaldi karein — sirf {product.stock} bache hain!
                </p>
              )}

              <p className="mb-8 text-lg leading-relaxed text-ink-soft">
                Hashmi Cash &amp; Carry par aapko milti hai 100% original products ki
                guarantee. Yeh {product.name} behtareen quality ke sath aapke ghar tak
                deliver ki jayegi.
              </p>

              <div className="mb-8 flex flex-wrap gap-4 font-mono-tag text-xs font-semibold text-ink-soft">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-leaf" /> Original guarantee
                </span>
                <span className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4 text-leaf" /> Rawalpindi delivery
                </span>
              </div>

              <div className="flex items-center gap-4">
                {!outOfStock && (
                  <QuantityStepper value={qty} onChange={setQty} max={product.stock ?? Infinity} />
                )}
                <Button
                  size="lg"
                  onClick={handleAdd}
                  disabled={outOfStock}
                  className={`h-14 flex-1 rounded-full bg-ink text-lg font-bold text-paper shadow-md hover:bg-leaf-deep disabled:opacity-40 ${
                    justAdded ? "animate-thump" : ""
                  }`}
                >
                  <Plus className="h-5 w-5" />
                  {outOfStock ? "Out of Stock" : "Cart Mein Add Karein"}
                </Button>
                <WishlistHeart productId={product.id} className="h-14 w-14" />
              </div>
            </div>
          </div>
        </Reveal>

        <ReviewSection productId={product.id} />
      </div>
    </main>
  );
}
