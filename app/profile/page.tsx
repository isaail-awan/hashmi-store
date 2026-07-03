"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft, User, Mail, LockKeyhole, LogOut, Package, Clock, Truck,
  CheckCircle, Camera, Phone, MapPin, Save, Settings,
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { OrderTimeline } from "@/components/OrderTimeline";

export default function ProfilePage() {
  const [session, setSession] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSignUp, setIsSignUp] = useState(false);
  const [tab, setTab] = useState<"orders" | "settings">("orders");

  const [myOrders, setMyOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Profile settings state
  const [profile, setProfile] = useState<any>(null);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  useEffect(() => {
    const checkUserAndFetchOrders = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);

      if (session) {
        const { data: orderData } = await supabase
          .from("orders")
          .select("*")
          .eq("user_email", session.user.email)
          .order("created_at", { ascending: false });
        if (orderData) setMyOrders(orderData);
        setIsLoadingOrders(false);

        const { data: profileData } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .maybeSingle();

        if (profileData) {
          setProfile(profileData);
          setFullName(profileData.full_name || "");
          setPhone(profileData.phone || "");
          setAddress(profileData.address || "");
          setAvatarUrl(profileData.avatar_url || "");
        }
      }

      setIsLoading(false);
    };
    checkUserAndFetchOrders();
  }, []);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) toast.error(error.message);
      else {
        toast.success("Account ban gaya! Ab login karein.");
        setIsSignUp(false);
        setPassword("");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) toast.error(error.message);
      else {
        toast.success("Welcome back!");
        window.location.reload();
      }
    }
    setIsSubmitting(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Securely logout ho gaye.");
    window.location.reload();
  };

  const handleAvatarPick = (file: File | null) => {
    setAvatarFile(file);
    if (file) setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session) return;
    setIsSavingProfile(true);

    try {
      let finalAvatarUrl = avatarUrl;

      if (avatarFile) {
        const fileExt = avatarFile.name.split(".").pop();
        // stored under a folder named after the user id, matches the storage RLS policy
        const filePath = `${session.user.id}/${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from("avatars")
          .upload(filePath, avatarFile, { upsert: true });
        if (uploadError) throw new Error(uploadError.message);

        const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(filePath);
        finalAvatarUrl = publicUrl;
      }

      const { error } = await supabase.from("profiles").upsert({
        id: session.user.id,
        full_name: fullName,
        phone,
        address,
        avatar_url: finalAvatarUrl,
        updated_at: new Date().toISOString(),
      });

      if (error) throw new Error(error.message);

      setAvatarUrl(finalAvatarUrl);
      setAvatarFile(null);
      toast.success("Profile update ho gayi!");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSavingProfile(false);
    }
  };

  if (isLoading) return <div className="min-h-screen flex items-center justify-center font-bold bg-paper">Loading...</div>;

  if (session) {
    const displayAvatar = avatarPreview || avatarUrl;

    return (
      <main className="min-h-screen bg-paper py-12 font-sans md:py-20">
        <div className="container mx-auto max-w-5xl px-6">
          <Link href="/" className="mb-10 inline-flex items-center text-ink-soft hover:text-ink font-medium transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
          </Link>

          <div className="rounded-[2.5rem] border-2 border-dashed border-border bg-card p-8 shadow-sm md:p-12">
            <div className="mb-10 flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
              <div className="flex items-center gap-6">
                <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-full border-2 border-border bg-paper">
                  {displayAvatar ? (
                    <Image src={displayAvatar} alt="Avatar" fill sizes="80px" className="object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <User className="h-10 w-10 text-ink-soft" />
                    </div>
                  )}
                </div>
                <div>
                  <h1 className="mb-1 font-display text-3xl font-bold tracking-tight text-ink">
                    {fullName || "My Account"}
                  </h1>
                  <p className="font-medium text-ink-soft">{session.user.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-full bg-chili/10 px-6 py-3 font-bold text-chili transition-colors hover:bg-chili/20"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </div>

            {/* Tabs */}
            <div className="mb-8 flex gap-3">
              <button
                onClick={() => setTab("orders")}
                className={`flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all ${
                  tab === "orders" ? "bg-ink text-paper shadow-md" : "border border-border bg-white text-ink-soft"
                }`}
              >
                <Package className="h-5 w-5" /> Order History
              </button>
              <button
                onClick={() => setTab("settings")}
                className={`flex items-center gap-2 rounded-full px-6 py-3 font-bold transition-all ${
                  tab === "settings" ? "bg-ink text-paper shadow-md" : "border border-border bg-white text-ink-soft"
                }`}
              >
                <Settings className="h-5 w-5" /> Profile Settings
              </button>
            </div>

            {tab === "orders" && (
              <div className="border-t-2 border-dashed border-border pt-8">
                {isLoadingOrders ? (
                  <p className="text-ink-soft">Orders load ho rahe hain...</p>
                ) : myOrders.length === 0 ? (
                  <div className="rounded-[1.75rem] border-2 border-dashed border-border bg-paper p-8 text-center">
                    <p className="font-medium text-ink-soft">Aapne abhi tak koi order nahi kiya.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {myOrders.map((order) => (
                      <div
                        key={order.id}
                        className="flex flex-col gap-6 rounded-[1.75rem] border-2 border-dashed border-border bg-paper p-6 transition-all hover:border-leaf/40"
                      >
                        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                          <div className="w-full flex-1 md:w-auto">
                            <div className="mb-2 flex items-center gap-3">
                              <span className="font-display text-lg font-bold text-ink">Order #{order.id}</span>
                              <span className="text-sm text-ink-soft">
                                {new Date(order.created_at).toLocaleDateString()}
                              </span>
                            </div>
                            <p className="line-clamp-1 text-sm font-medium text-ink-soft">
                              Items: {order.items.map((i: any) => `${i.quantity}x ${i.name}`).join(", ")}
                            </p>
                          </div>

                          <div className="flex w-full items-center justify-between gap-8 md:w-auto md:justify-end">
                            <span className="font-mono-tag text-2xl font-bold text-ink">Rs. {order.total_amount}</span>
                            <div
                              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${
                                order.status === "Pending"
                                  ? "bg-haldi/20 text-haldi-deep"
                                  : order.status === "Dispatched"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-leaf-light text-leaf-deep"
                              }`}
                            >
                              {order.status === "Pending" && <Clock className="h-4 w-4" />}
                              {order.status === "Dispatched" && <Truck className="h-4 w-4" />}
                              {order.status === "Delivered" && <CheckCircle className="h-4 w-4" />}
                              {order.status}
                            </div>
                          </div>
                        </div>

                        <div className="border-t-2 border-dashed border-border pt-5">
                          <OrderTimeline order={order} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {tab === "settings" && (
              <form onSubmit={handleSaveProfile} className="border-t-2 border-dashed border-border pt-8">
                <div className="mb-8 flex items-center gap-6">
                  <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-full border-2 border-border bg-paper">
                    {displayAvatar ? (
                      <Image src={displayAvatar} alt="Avatar" fill sizes="96px" className="object-cover" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        <User className="h-12 w-12 text-ink-soft" />
                      </div>
                    )}
                  </div>
                  <label className="flex cursor-pointer items-center gap-2 rounded-full border-2 border-dashed border-border bg-white px-5 py-2.5 font-bold text-ink-soft transition-colors hover:border-leaf/50 hover:text-ink">
                    <Camera className="h-4 w-4" />
                    Photo badlein
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleAvatarPick(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
                    <input
                      type="text"
                      placeholder="Mukammal Naam"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-white py-4 pl-12 pr-4 outline-none transition-all focus:border-leaf focus:ring-1 focus:ring-leaf"
                    />
                  </div>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full rounded-2xl border border-border bg-white py-4 pl-12 pr-4 outline-none transition-all focus:border-leaf focus:ring-1 focus:ring-leaf"
                    />
                  </div>
                </div>

                <div className="relative mt-5">
                  <MapPin className="absolute left-4 top-4 h-5 w-5 text-ink-soft" />
                  <textarea
                    placeholder="Default Delivery Address (Rawalpindi)"
                    rows={3}
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full resize-none rounded-2xl border border-border bg-white py-4 pl-12 pr-4 outline-none transition-all focus:border-leaf focus:ring-1 focus:ring-leaf"
                  />
                </div>

                <div className="mt-5 rounded-2xl border border-border bg-white px-5 py-4">
                  <p className="mb-0.5 text-xs font-bold uppercase tracking-wide text-ink-soft">Email</p>
                  <p className="font-medium text-ink">{session.user.email}</p>
                  <p className="mt-1 text-xs text-ink-soft">Email account settings se change nahi hoti.</p>
                </div>

                <button
                  type="submit"
                  disabled={isSavingProfile}
                  className="mt-6 flex items-center gap-2 rounded-full bg-ink px-8 py-4 font-display font-bold text-paper shadow-md transition-all hover:bg-leaf-deep active:scale-[0.98] disabled:opacity-70"
                >
                  <Save className="h-5 w-5" />
                  {isSavingProfile ? "Saving..." : "Changes Save Karein"}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-paper p-6 font-sans">
      <div className="w-full max-w-md">
        <Link href="/" className="mb-8 inline-flex items-center text-ink-soft hover:text-ink font-medium transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Store ki taraf wapas
        </Link>
        <div className="rounded-[2.5rem] border-2 border-dashed border-border bg-card p-8 text-center shadow-sm md:p-10">
          <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full border border-border bg-paper">
            {isSignUp ? <User className="h-8 w-8 text-ink" /> : <LockKeyhole className="h-8 w-8 text-ink" />}
          </div>
          <h1 className="mb-2 font-display text-3xl font-bold tracking-tight text-ink">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <form onSubmit={handleAuth} className="mt-8 space-y-4">
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
              <input
                type="email"
                placeholder="Email Address"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-2xl border border-border bg-paper py-4 pl-12 pr-4 text-left outline-none transition-all focus:border-leaf"
              />
            </div>
            <div className="relative">
              <LockKeyhole className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-ink-soft" />
              <input
                type="password"
                placeholder="Password (Min 6 chars)"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-2xl border border-border bg-paper py-4 pl-12 pr-4 text-left outline-none transition-all focus:border-leaf"
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="mt-4 w-full rounded-full bg-ink py-4 font-display text-lg font-bold text-paper shadow-md transition-all hover:bg-leaf-deep active:scale-[0.98] disabled:opacity-70"
            >
              {isSubmitting ? "Processing..." : isSignUp ? "Sign Up" : "Secure Login"}
            </button>
          </form>
          <div className="mt-8 border-t border-border pt-6">
            <p className="font-medium text-ink-soft">
              {isSignUp ? "Pehle se account hai?" : "Naya account banana hai?"}{" "}
              <button
                onClick={() => { setIsSignUp(!isSignUp); setEmail(""); setPassword(""); }}
                className="font-bold text-ink hover:underline"
              >
                {isSignUp ? "Log In" : "Sign Up"}
              </button>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
