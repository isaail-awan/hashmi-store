"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, LockKeyhole } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Supabase se Auth check kar rahe hain
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    setIsLoading(false);

    if (error) {
      toast.error("Login Failed: " + error.message);
      return;
    }

    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (adminEmail && data.user?.email !== adminEmail) {
      toast.error("Ye admin account nahi hai. Access Denied.");
      await supabase.auth.signOut();
      return;
    }

    toast.success("Welcome back! Admin Portal is opening...");
    router.push("/admin"); // Agar password theek ho toh admin page par bhej do
  };

  return (
    <main className="min-h-screen bg-[#F9F9F6] flex flex-col justify-center items-center p-4 font-sans">
      
      <div className="w-full max-w-md">
        <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 mb-8 font-medium transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" /> Store ki taraf wapas
        </Link>

        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-zinc-200 shadow-sm text-center">
          <div className="bg-[#F9F9F6] w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-100">
            <LockKeyhole className="h-8 w-8 text-zinc-900" />
          </div>
          
          <h1 className="text-3xl font-black text-zinc-900 mb-2 tracking-tight">Admin Portal</h1>
          <p className="text-zinc-500 font-medium mb-8">Authorized access only.</p>

          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="email" 
              placeholder="Admin Email" 
              required 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-2xl px-5 py-4 outline-none focus:border-zinc-900 transition-all text-left"
            />
            <input 
              type="password" 
              placeholder="Password" 
              required 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-2xl px-5 py-4 outline-none focus:border-zinc-900 transition-all text-left"
            />
            
            <button 
              type="submit"
              disabled={isLoading}
              className="w-full bg-zinc-900 text-white font-bold text-lg py-4 mt-4 rounded-full transition-all hover:bg-zinc-800 active:scale-[0.98] shadow-md disabled:opacity-70"
            >
              {isLoading ? "Checking..." : "Secure Login"}
            </button>
          </form>
        </div>
      </div>
      
    </main>
  );
}