"use client";

import { useEffect, useState } from "react";
import { MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { StarRating } from "@/components/StarRating";
import { Reveal } from "@/components/Reveal";

interface ReviewSectionProps {
  productId: number;
}

export function ReviewSection({ productId }: ReviewSectionProps) {
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<any>(null);

  const [myRating, setMyRating] = useState(0);
  const [myComment, setMyComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchReviews = async () => {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });
    if (data) setReviews(data);
    if (error) toast.error("Reviews load nahi ho sakay.");
    setIsLoading(false);
  };

  useEffect(() => {
    fetchReviews();
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

  useEffect(() => {
    if (!session) return;
    const mine = reviews.find((r) => r.user_id === session.user.id);
    if (mine) {
      setMyRating(mine.rating);
      setMyComment(mine.comment || "");
    }
  }, [session, reviews]);

  const avgRating = reviews.length
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) {
      toast.error("Review dene ke liye pehle login karein.");
      return;
    }
    if (myRating < 1) {
      toast.error("Pehle stars select karein.");
      return;
    }
    setIsSubmitting(true);
    const { error } = await supabase.from("reviews").upsert(
      {
        product_id: productId,
        user_id: session.user.id,
        user_name: session.user.email?.split("@")[0] || "Customer",
        rating: myRating,
        comment: myComment,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "product_id,user_id" }
    );
    setIsSubmitting(false);

    if (error) toast.error("Review save nahi hua: " + error.message);
    else {
      toast.success("Review save ho gaya, shukriya!");
      fetchReviews();
    }
  };

  return (
    <div className="mt-16">
      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="rounded-full border-2 border-leaf/20 bg-leaf-light p-3">
          <MessageSquare className="h-6 w-6 text-leaf" />
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-ink md:text-3xl">
            Customer Reviews
          </h2>
          {reviews.length > 0 && (
            <div className="mt-1 flex items-center gap-2">
              <StarRating value={avgRating} size="sm" />
              <span className="text-sm font-semibold text-ink-soft">
                {avgRating.toFixed(1)} ({reviews.length} review{reviews.length > 1 ? "s" : ""})
              </span>
            </div>
          )}
        </div>
      </div>

      {session && (
        <Reveal>
          <form
            onSubmit={handleSubmit}
            className="mb-10 rounded-[1.75rem] border-2 border-dashed border-border bg-card p-6 md:p-8"
          >
            <p className="mb-3 font-bold text-ink">
              {reviews.some((r) => r.user_id === session.user.id)
                ? "Apna review update karein"
                : "Apna review likhein"}
            </p>
            <StarRating value={myRating} size="lg" interactive onChange={setMyRating} />
            <textarea
              placeholder="Product kaisa raha? (optional)"
              rows={3}
              value={myComment}
              onChange={(e) => setMyComment(e.target.value)}
              className="mt-4 w-full resize-none rounded-xl border border-border bg-white px-4 py-3 outline-none transition-all focus:border-leaf focus:ring-1 focus:ring-leaf"
            />
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 rounded-full bg-ink px-6 py-3 font-bold text-paper shadow-sm transition-all hover:bg-leaf-deep active:scale-95 disabled:opacity-60"
            >
              {isSubmitting ? "Saving..." : "Review Submit Karein"}
            </button>
          </form>
        </Reveal>
      )}

      {isLoading ? (
        <p className="text-ink-soft">Reviews load ho rahe hain...</p>
      ) : reviews.length === 0 ? (
        <div className="rounded-[1.75rem] border-2 border-dashed border-border bg-card px-8 py-12 text-center">
          <p className="font-medium text-ink-soft">Abhi tak koi review nahi. Sabse pehle review dein!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <Reveal key={r.id} delay={i * 60}>
              <div className="rounded-[1.5rem] border-2 border-dashed border-border bg-card p-5 md:p-6">
                <div className="mb-2 flex items-center justify-between gap-3">
                  <span className="font-bold capitalize text-ink">{r.user_name}</span>
                  <span className="shrink-0 text-xs text-ink-soft">
                    {new Date(r.created_at).toLocaleDateString()}
                  </span>
                </div>
                <StarRating value={r.rating} size="sm" />
                {r.comment && <p className="mt-2 leading-relaxed text-ink-soft">{r.comment}</p>}
              </div>
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
