"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { useWishlistStore } from "@/lib/store";

// Layout mein ek dafa mount hota hai — session change hone par
// wishlist product IDs ko store mein sync rakhta hai.
export function WishlistSync() {
  const setWishlist = useWishlistStore((state) => state.setWishlist);

  useEffect(() => {
    const loadWishlist = async (userId?: string) => {
      if (!userId) {
        setWishlist([]);
        return;
      }
      const { data } = await supabase
        .from("wishlist_items")
        .select("product_id")
        .eq("user_id", userId);
      if (data) setWishlist(data.map((row: any) => row.product_id));
    };

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadWishlist(session?.user?.id);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      loadWishlist(session?.user?.id);
    });

    return () => listener.subscription.unsubscribe();
  }, [setWishlist]);

  return null;
}
