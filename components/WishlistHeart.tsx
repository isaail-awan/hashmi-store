"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";
import { useWishlistStore } from "@/lib/store";

interface WishlistHeartProps {
  productId: number;
  size?: "sm" | "md";
  className?: string;
}

export function WishlistHeart({ productId, size = "md", className = "" }: WishlistHeartProps) {
  const wishlist = useWishlistStore((state) => state.wishlist);
  const addWishlistId = useWishlistStore((state) => state.addWishlistId);
  const removeWishlistId = useWishlistStore((state) => state.removeWishlistId);
  const isWishlisted = wishlist.includes(productId);

  const toggle = async (e?: React.MouseEvent) => {
    e?.preventDefault();
    e?.stopPropagation();

    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      toast.error("Wishlist ke liye pehle login karein.");
      return;
    }

    if (isWishlisted) {
      removeWishlistId(productId);
      const { error } = await supabase
        .from("wishlist_items")
        .delete()
        .eq("user_id", session.user.id)
        .eq("product_id", productId);
      if (error) {
        addWishlistId(productId);
        toast.error("Wishlist se hata nahi saka.");
      }
    } else {
      addWishlistId(productId);
      const { error } = await supabase
        .from("wishlist_items")
        .insert({ user_id: session.user.id, product_id: productId });
      if (error) {
        removeWishlistId(productId);
        toast.error("Wishlist mein add nahi hua.");
      } else {
        toast.success("Wishlist mein add ho gaya!");
      }
    }
  };

  const btnSize = size === "sm" ? "h-8 w-8" : "h-11 w-11";
  const iconSize = size === "sm" ? "h-4 w-4" : "h-5 w-5";

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isWishlisted ? "Wishlist se hatayein" : "Wishlist mein add karein"}
      className={`flex ${btnSize} shrink-0 items-center justify-center rounded-full border-2 shadow-sm transition-all active:scale-90 ${
        isWishlisted
          ? "border-chili bg-chili/10 text-chili"
          : "border-border bg-white text-ink-soft hover:border-chili/40 hover:text-chili"
      } ${className}`}
    >
      <Heart className={iconSize} fill={isWishlisted ? "currentColor" : "none"} />
    </button>
  );
}
