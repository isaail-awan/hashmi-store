"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Trash2, ArrowLeft, MapPin, ShoppingBasket, MessageCircle, Clock3 } from "lucide-react";
import { useCartStore } from "@/lib/store";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";
import { Reveal } from "@/components/Reveal";
import { QuantityStepper } from "@/components/QuantityStepper";
import { buildWhatsAppOrderLink } from "@/lib/whatsapp";

export default function CartPage() {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, clearCart } = useCartStore();

  const totalAmount = cart.reduce((total, item) => total + item.price * item.quantity, 0);

  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [deliverySlot, setDeliverySlot] = useState("Jaldi se jaldi");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<any>(null);

  const DELIVERY_SLOTS = ["Jaldi se jaldi", "Aaj Shaam (4pm-8pm)", "Kal Subah (9am-12pm)"];

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.toLowerCase().includes("pindi") && !address.toLowerCase().includes("rawalpindi")) {
      toast.error("Sorry! Delivery is only in Rawalpindi");
      return;
    }

    setIsSubmitting(true);

    const {
      data: { session },
    } = await supabase.auth.getSession();

    const customerEmail = session ? session.user.email : "Guest Order";

    const orderData = {
      customer_name: name,
      customer_phone: phone,
      customer_address: address,
      total_amount: totalAmount,
      items: cart,
      status: "Pending",
      user_email: customerEmail,
      delivery_slot: deliverySlot,
    };

    const { data, error } = await supabase.from("orders").insert([orderData]).select().single();

    setIsSubmitting(false);

    if (error) {
      toast.error("order could not be Saved: " + error.message);
    } else {
      toast.success("Order Confirmed");
      setConfirmedOrder(data);
      clearCart();
    }
  };

  // Order confirmed screen — WhatsApp confirmation + link to profile
  if (confirmedOrder) {
    const waLink = buildWhatsAppOrderLink(confirmedOrder);
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-paper px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-leaf/40 bg-leaf-light">
          <ShoppingBasket className="h-9 w-9 text-leaf" />
        </div>
        <h1 className="mb-3 font-display text-3xl font-bold tracking-tight text-ink md:text-4xl">
          Order #{confirmedOrder.id} confirm ho gaya!
        </h1>
        <p className="mb-8 max-w-md text-lg font-medium text-ink-soft">
          Hamari team jald hi aapse rabta karegi. Chaho to WhatsApp par bhi order confirm
          bhej sakte ho takay record turant ban jaye.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-full bg-[#25D366] px-6 py-3.5 font-display font-bold text-white shadow-md transition-all hover:-translate-y-0.5 active:translate-y-0"
          >
            <MessageCircle className="h-5 w-5" /> WhatsApp par bhejein
          </a>
          <button
            onClick={() => router.push("/profile")}
            className="rounded-full bg-ink px-6 py-3.5 font-display font-bold text-paper shadow-md transition-all hover:-translate-y-0.5 hover:bg-leaf-deep active:translate-y-0"
          >
            Order History dekhein
          </button>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center bg-paper px-4 text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed border-leaf/40 bg-leaf-light">
          <ShoppingBasket className="h-9 w-9 text-leaf" />
        </div>
        <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-ink">
          Aapki tokri khali hai.
        </h1>
        <p className="mb-8 text-lg font-medium text-ink-soft">
          Chaliye isme kuch premium essentials add karte hain.
        </p>
        <Link href="/">
          <button className="rounded-full bg-ink px-8 py-4 font-display font-bold text-paper transition-all hover:bg-leaf-deep active:scale-[0.98]">
            Continue Shopping
          </button>
        </Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-paper py-12 font-sans md:py-20">
      <div className="container mx-auto max-w-6xl px-6 md:px-10">
        <Link
          href="/"
          className="mb-10 inline-flex items-center font-medium text-ink-soft transition-colors hover:text-ink"
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Store
        </Link>

        <h1 className="mb-12 font-display text-4xl font-bold tracking-tight text-ink md:text-5xl">
          Shopping Cart.
        </h1>

        <div className="grid gap-12 lg:grid-cols-3">
          <div className="space-y-5 lg:col-span-2">
            {cart.map((item, i) => (
              <Reveal key={item.id} delay={i * 60}>
                <div className="flex flex-col items-center gap-6 rounded-[1.75rem] border-2 border-dashed border-border bg-card p-4 shadow-sm transition-colors hover:border-leaf/40 sm:flex-row">
                  <div className="relative h-32 w-full flex-shrink-0 rounded-[1.25rem] border border-border bg-white p-3 sm:w-32">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      sizes="128px"
                      className="object-contain p-3 mix-blend-multiply"
                    />
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="mb-1 font-display text-xl font-bold text-ink">{item.name}</h3>
                    <p className="mb-3 font-mono-tag font-medium text-ink-soft">
                      Rs. {item.price} each
                    </p>
                    <div className="flex justify-center sm:justify-start">
                      <QuantityStepper
                        value={item.quantity}
                        onChange={(q) => updateQuantity(item.id, q)}
                        max={item.stock ?? Infinity}
                        size="sm"
                      />
                    </div>
                  </div>
                  <div className="flex w-full items-center justify-between gap-4 px-4 sm:w-auto sm:flex-col sm:justify-center sm:px-0">
                    <p className="font-mono-tag text-xl font-bold text-ink">
                      Rs. {item.price * item.quantity}
                    </p>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="rounded-full p-3 text-ink-soft transition-all hover:bg-chili/10 hover:text-chili"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="lg:col-span-1">
            <Reveal delay={100}>
              <div className="sticky top-32 rounded-[1.75rem] border-2 border-dashed border-border bg-card p-8">
                <h2 className="mb-6 font-display text-2xl font-bold tracking-tight text-ink">
                  Checkout Details
                </h2>
                <form onSubmit={handleCheckout} className="mb-2 space-y-4">
                  <input
                    type="text"
                    placeholder="Aapka Mukammal Naam"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none transition-all focus:border-leaf focus:ring-1 focus:ring-leaf"
                  />
                  <input
                    type="tel"
                    placeholder="Phone Number (e.g. 03001234567)"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full rounded-xl border border-border bg-white px-4 py-3 outline-none transition-all focus:border-leaf focus:ring-1 focus:ring-leaf"
                  />
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-5 w-5 text-ink-soft" />
                    <textarea
                      placeholder="Delivery Address (Sirf Rawalpindi/Pindi)"
                      required
                      rows={3}
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full resize-none rounded-xl border border-border bg-white py-3 pl-10 pr-4 outline-none transition-all focus:border-leaf focus:ring-1 focus:ring-leaf"
                    />
                  </div>

                  <div>
                    <label className="mb-2 flex items-center gap-1.5 text-sm font-bold text-ink">
                      <Clock3 className="h-4 w-4 text-leaf" /> Delivery Time
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {DELIVERY_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setDeliverySlot(slot)}
                          className={`rounded-xl border-2 px-4 py-2.5 text-left text-sm font-semibold transition-all ${
                            deliverySlot === slot
                              ? "border-leaf bg-leaf-light text-leaf-deep"
                              : "border-border bg-white text-ink-soft hover:border-leaf/40"
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 flex items-end justify-between border-t-2 border-dashed border-border pt-4">
                    <span className="font-bold text-ink">Total Bill</span>
                    <span className="font-mono-tag text-3xl font-bold text-chili">
                      Rs. {totalAmount}
                    </span>
                  </div>

                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="mt-6 w-full rounded-full bg-ink py-4 font-display text-lg font-bold text-paper shadow-md transition-all hover:bg-leaf-deep active:scale-[0.98] disabled:opacity-70"
                  >
                    {isSubmitting ? "Processing..." : "Confirm Order (COD)"}
                  </button>
                </form>
              </div>
            </Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}
