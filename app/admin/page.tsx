"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, PackagePlus, ClipboardList, CheckCircle, Clock, Truck, LogOut, UploadCloud, Trash2, Pencil, X, Tag, BarChart3, AlertTriangle, TrendingUp, Package } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { toast } from "sonner";

export default function AdminPage() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<"orders" | "products" | "analytics">("orders");

  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [products, setProducts] = useState<any[]>([]);

  const [productToDelete, setProductToDelete] = useState<{ id: number; name: string } | null>(null);
  
  // Edit Modal States
  const [editingProduct, setEditingProduct] = useState<any | null>(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("50");
  const [editOriginalPrice, setEditOriginalPrice] = useState(""); // 🚀 NAYA: Purani price for edit
  const [editCategory, setEditCategory] = useState("Grocery");
  const [editImage, setEditImage] = useState("");
  const [editImageFile, setEditImageFile] = useState<File | null>(null);
  const [editIsOffer, setEditIsOffer] = useState(false);
  const [isEditSubmitting, setIsEditSubmitting] = useState(false);

  // Add Form States
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("50");
  const [originalPrice, setOriginalPrice] = useState(""); // 🚀 NAYA: Purani price for add
  const [category, setCategory] = useState("Grocery");
  const [image, setImage] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isOffer, setIsOffer] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;

      if (!session) {
        toast.error("Access Denied! Pehle login karein.");
        router.push("/login");
        return;
      }

      if (adminEmail && session.user.email !== adminEmail) {
        toast.error("Ye account admin nahi hai. Access Denied.");
        await supabase.auth.signOut();
        router.push("/login");
        return;
      }

      setIsCheckingAuth(false);
      fetchOrders();
      fetchProducts();
    };
    checkAuth();
  }, [router]);

  const fetchOrders = async () => {
    setIsLoadingOrders(true);
    const { data } = await supabase.from('orders').select('*').order('created_at', { ascending: false });
    if (data) setOrders(data);
    setIsLoadingOrders(false);
  };

  const fetchProducts = async () => {
    const { data } = await supabase.from('products').select('*').order('id', { ascending: false });
    if (data) setProducts(data);
  };

  const executeDelete = async () => {
    if (!productToDelete) return;
    const { error } = await supabase.from('products').delete().eq('id', productToDelete.id);
    if (error) toast.error("Delete fail ho gaya.");
    else { toast.success(`${productToDelete.name} remove ho gaya!`); fetchProducts(); }
    setProductToDelete(null);
  };

  const updateOrderStatus = async (orderId: number, newStatus: string) => {
    // Tracking timeline ke liye jis stage pe pohanchay uska timestamp bhi save karo
    const updatePayload: Record<string, any> = { status: newStatus };
    if (newStatus === "Dispatched") updatePayload.dispatched_at = new Date().toISOString();
    if (newStatus === "Delivered") updatePayload.delivered_at = new Date().toISOString();

    const { error } = await supabase.from('orders').update(updatePayload).eq('id', orderId);
    if (error) toast.error("Status update fail ho gaya.");
    else { toast.success(`Order #${orderId} update ho gaya!`); fetchOrders(); }
  };

  const handleProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      let finalImageUrl = image || "https://placehold.co/400x300/e2e8f0/1e293b?text=New+Product";
      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(fileName, imageFile);
        if (uploadError) throw new Error("Image upload error: " + uploadError.message);
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }
      
      const { error } = await supabase.from("products").insert([{ 
        name, 
        price: Number(price), // Yeh final sale price hogi
        original_price: isOffer && originalPrice ? Number(originalPrice) : null, // Yeh bari price uspe cut lagega
        category, 
        image: finalImageUrl,
        is_offer: isOffer,
        stock: Number(stock) || 0
      }]);
      if (error) throw new Error(error.message);

      toast.success("Product Add Ho Gaya!");
      setName(""); setPrice(""); setOriginalPrice(""); setCategory("Grocery"); setImage(""); setImageFile(null); setIsOffer(false); setStock("50");
      fetchProducts();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openEditModal = (product: any) => {
    setEditingProduct(product);
    setEditName(product.name);
    setEditPrice(product.price.toString());
    setEditOriginalPrice(product.original_price ? product.original_price.toString() : ""); // Purani price uthao
    setEditCategory(product.category || "Grocery");
    setEditImage(product.image);
    setEditIsOffer(product.is_offer || false);
    setEditStock(product.stock != null ? product.stock.toString() : "50");
    setEditImageFile(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsEditSubmitting(true);

    try {
      let finalImageUrl = editImage;
      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('products').upload(fileName, editImageFile);
        if (uploadError) throw new Error(uploadError.message);
        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(fileName);
        finalImageUrl = publicUrl;
      }

      const { error } = await supabase.from('products').update({
        name: editName,
        price: Number(editPrice),
        original_price: editIsOffer && editOriginalPrice ? Number(editOriginalPrice) : null,
        category: editCategory,
        image: finalImageUrl,
        is_offer: editIsOffer,
        stock: Number(editStock) || 0
      }).eq('id', editingProduct.id);

      if (error) throw new Error(error.message);

      toast.success("Product update ho gaya!");
      setEditingProduct(null); 
      fetchProducts(); 
      
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsEditSubmitting(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast.success("Securely logged out.");
    router.push("/login");
  };

  // ---- Analytics derivations ----
  const lowStockProducts = products.filter((p: any) => (p.stock ?? 0) > 0 && (p.stock ?? 0) <= 5);
  const outOfStockProducts = products.filter((p: any) => (p.stock ?? 0) <= 0);

  const deliveredOrders = orders.filter((o: any) => o.status === "Delivered");
  const totalRevenue = deliveredOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
  const pendingRevenue = orders
    .filter((o: any) => o.status !== "Delivered")
    .reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);
  const avgOrderValue = orders.length ? Math.round(orders.reduce((s: number, o: any) => s + (o.total_amount || 0), 0) / orders.length) : 0;

  const itemSalesMap: Record<string, { name: string; qty: number; revenue: number }> = {};
  orders.forEach((o: any) => {
    (o.items || []).forEach((item: any) => {
      const key = item.name;
      if (!itemSalesMap[key]) itemSalesMap[key] = { name: item.name, qty: 0, revenue: 0 };
      itemSalesMap[key].qty += item.quantity;
      itemSalesMap[key].revenue += item.price * item.quantity;
    });
  });
  const topProducts = Object.values(itemSalesMap).sort((a, b) => b.qty - a.qty).slice(0, 5);
  const maxTopQty = topProducts[0]?.qty || 1;

  const statusCounts = {
    Pending: orders.filter((o: any) => o.status === "Pending").length,
    Dispatched: orders.filter((o: any) => o.status === "Dispatched").length,
    Delivered: deliveredOrders.length,
  };

  if (isCheckingAuth) return <div className="min-h-screen bg-[#F9F9F6] flex items-center justify-center"><p className="font-bold animate-pulse">Securing Portal...</p></div>;

  return (
    <main className="min-h-screen bg-[#F9F9F6] py-12 font-sans relative">
      <div className="container mx-auto px-4 md:px-8 max-w-6xl">
        <div className="flex justify-between items-center mb-8">
          <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-zinc-900 font-medium transition-colors">
            <ArrowLeft className="mr-2 h-4 w-4" /> Store ki taraf wapas
          </Link>
          <button onClick={handleLogout} className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 rounded-full font-bold text-sm">
            <LogOut className="h-4 w-4" /> Logout
          </button>
        </div>

        <h1 className="text-4xl md:text-5xl font-black text-zinc-900 mb-6 tracking-tight">Business Portal.</h1>

        {lowStockProducts.length > 0 && (
          <div className="mb-8 flex items-start gap-3 rounded-[1.5rem] border border-amber-200 bg-amber-50 p-5">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold text-amber-900">
                {lowStockProducts.length} product{lowStockProducts.length > 1 ? "s" : ""} ka stock kam hai!
              </p>
              <p className="text-sm text-amber-800">
                {lowStockProducts.map((p: any) => `${p.name} (${p.stock})`).join(", ")}
              </p>
            </div>
          </div>
        )}

        <div className="flex gap-4 mb-8 flex-wrap">
          <button onClick={() => setActiveTab("orders")} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === "orders" ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-500 border border-zinc-200"}`}>
            <ClipboardList className="h-5 w-5" /> Live Orders
          </button>
          <button onClick={() => setActiveTab("products")} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === "products" ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-500 border border-zinc-200"}`}>
            <PackagePlus className="h-5 w-5" /> Manage Inventory
          </button>
          <button onClick={() => setActiveTab("analytics")} className={`flex items-center gap-2 px-6 py-3 rounded-full font-bold transition-all ${activeTab === "analytics" ? "bg-zinc-900 text-white shadow-md" : "bg-white text-zinc-500 border border-zinc-200"}`}>
            <BarChart3 className="h-5 w-5" /> Analytics
          </button>
        </div>

        {activeTab === "orders" && ( /* Puranay orders wala hissa bilkul same rahay ga... */ 
           <div className="space-y-6">
             {/* OMITTED FOR BREVITY, THIS IS YOUR EXISTING ORDERS RENDER LOGIC */}
             {orders.map((order) => (
                <div key={order.id} className="bg-white p-6 md:p-8 rounded-[2rem] border border-zinc-200 shadow-sm flex flex-col md:flex-row gap-8 justify-between">
                  <div className="flex-1">
                    <h2 className="text-2xl font-bold text-zinc-900 mb-1">Order #{order.id} - {order.customer_name}</h2>
                    <p className="text-zinc-600 font-medium mb-1">📞 {order.customer_phone}</p>
                    <p className="text-zinc-500 mb-1">📍 {order.customer_address}</p>
                    {order.delivery_slot && (
                      <p className="text-zinc-500 mb-4">🕒 {order.delivery_slot}</p>
                    )}
                  </div>
                  <div className="md:w-72 bg-[#F9F9F6] p-6 rounded-[1.5rem] border border-zinc-100">
                      <p className="text-3xl font-black text-zinc-900 mb-2">Rs. {order.total_amount}</p>
                      <p className="font-bold text-sm mb-4">Status: {order.status}</p>
                      <div className="grid grid-cols-2 gap-2">
                        <button onClick={() => updateOrderStatus(order.id, 'Dispatched')} className="bg-white border border-zinc-200 font-bold py-2 rounded-xl text-sm">Dispatch</button>
                        <button onClick={() => updateOrderStatus(order.id, 'Delivered')} className="bg-zinc-900 text-white font-bold py-2 rounded-xl text-sm">Deliver</button>
                      </div>
                  </div>
                </div>
              ))}
           </div>
        )}

        {/* TAB 2: MANAGE INVENTORY */}
        {activeTab === "products" && (
          <div className="grid lg:grid-cols-2 gap-8">
            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-zinc-200 shadow-sm h-fit">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Add New Essential</h2>
              <form onSubmit={handleProductSubmit} className="space-y-5">
                <input placeholder="Product Name (e.g. Tapal Danedar)" value={name} onChange={(e) => setName(e.target.value)} required className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-zinc-900" />
                
                <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-zinc-900">
                  <option value="Grocery">Grocery</option><option value="Household">Household</option>
                  <option value="Snacks & Cold Drinks">Snacks & Cold Drinks</option><option value="Electronics">Electronics</option>
                  <option value="Crockery">Crockery</option><option value="Toys">Toys</option>
                  <option value="Sports Items">Sports Items</option><option value="Stationery">Stationery</option>
                  <option value="Cigarettes">Cigarettes</option>
                </select>

                <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200 cursor-pointer" onClick={() => setIsOffer(!isOffer)}>
                  <input type="checkbox" checked={isOffer} onChange={() => {}} className="w-5 h-5 accent-amber-500 cursor-pointer pointer-events-none" />
                  <div>
                    <p className="text-amber-900 font-bold text-sm">Add to "Offers & Discounts"</p>
                  </div>
                </div>

                {/* 🚀 NAYA: Agar offer hai toh do prices poocho, warna ek */}
                {isOffer ? (
                  <div className="grid grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                    <div>
                      <label className="text-xs font-bold text-amber-900 mb-1 block">Original Price (Line lagegi)</label>
                      <input type="number" placeholder="Bari Keemat" value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} required className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-green-700 mb-1 block">Discounted Price (Asal)</label>
                      <input type="number" placeholder="Sasti Keemat" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full bg-white border border-green-200 rounded-lg px-3 py-2 outline-none focus:border-green-500 text-green-700 font-bold" />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="text-xs font-bold text-zinc-700 mb-1 block">Sale Price (Rs.)</label>
                    <input type="number" placeholder="Price (Rs.)" value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-zinc-900" />
                  </div>
                )}

                <div>
                  <label className="text-xs font-bold text-zinc-700 mb-1 block">Stock (kitni quantity available hai)</label>
                  <input type="number" min="0" placeholder="Stock Quantity" value={stock} onChange={(e) => setStock(e.target.value)} required className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:border-zinc-900" />
                </div>

                <div className="p-5 bg-[#F9F9F6] border border-zinc-200 rounded-xl space-y-4">
                  <p className="text-sm font-bold text-zinc-700">Product Image</p>
                  <input type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} className="w-full text-sm text-zinc-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-zinc-900 file:text-white cursor-pointer" />
                  <input placeholder="Ya Image URL Paste Karein" value={image} onChange={(e) => setImage(e.target.value)} disabled={imageFile !== null} className="w-full bg-white border border-zinc-200 rounded-xl px-4 py-3 outline-none disabled:opacity-50 mt-2" />
                </div>
                <button type="submit" disabled={isSubmitting} className="w-full bg-zinc-900 text-white font-bold text-lg py-4 rounded-full mt-4 disabled:opacity-70 flex items-center justify-center gap-2">
                  {isSubmitting ? "Uploading..." : <><UploadCloud className="h-5 w-5" /> Add to Store</>}
                </button>
              </form>
            </div>

            <div className="bg-white p-8 md:p-10 rounded-[2rem] border border-zinc-200 shadow-sm">
              <h2 className="text-2xl font-bold text-zinc-900 mb-6">Existing Inventory</h2>
              <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {products.map((product) => (
                  <div key={product.id} className="flex items-center justify-between p-4 bg-[#F9F9F6] rounded-2xl border border-zinc-100">
                    <div className="flex items-center gap-4">
                      <div className="w-14 h-14 bg-white rounded-xl border border-zinc-100 p-1 flex-shrink-0 relative">
                        <img src={product.image} alt={product.name} className="w-full h-full object-contain mix-blend-multiply" />
                        {product.is_offer && <div className="absolute -top-2 -right-2 bg-amber-500 text-white p-1 rounded-full"><Tag className="h-3 w-3" /></div>}
                      </div>
                      <div>
                        <p className="font-bold text-zinc-900 line-clamp-1">{product.name}</p>
                        {/* 🚀 NAYA: Inventory list mein bhi cut lagi price dikhayen */}
                        {product.is_offer ? (
                           <div className="flex items-center gap-2">
                             <span className="text-xs text-zinc-400 line-through">Rs. {product.original_price}</span>
                             <span className="text-sm font-bold text-green-600">Rs. {product.price}</span>
                           </div>
                        ) : (
                          <p className="text-sm text-zinc-500 font-medium">Rs. {product.price}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button onClick={() => openEditModal(product)} className="p-3 text-zinc-400 hover:text-blue-600 rounded-full"><Pencil className="h-5 w-5" /></button>
                      <button onClick={() => setProductToDelete({ id: product.id, name: product.name })} className="p-3 text-zinc-400 hover:text-red-500 rounded-full"><Trash2 className="h-5 w-5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: ANALYTICS */}
        {activeTab === "analytics" && (
          <div className="space-y-8">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <div className="bg-white p-6 rounded-[1.75rem] border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-zinc-500">
                  <TrendingUp className="h-4 w-4" /> <p className="text-xs font-bold uppercase tracking-wide">Delivered Revenue</p>
                </div>
                <p className="text-3xl font-black text-zinc-900">Rs. {totalRevenue}</p>
              </div>
              <div className="bg-white p-6 rounded-[1.75rem] border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-zinc-500">
                  <Clock className="h-4 w-4" /> <p className="text-xs font-bold uppercase tracking-wide">Pending Revenue</p>
                </div>
                <p className="text-3xl font-black text-zinc-900">Rs. {pendingRevenue}</p>
              </div>
              <div className="bg-white p-6 rounded-[1.75rem] border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-zinc-500">
                  <ClipboardList className="h-4 w-4" /> <p className="text-xs font-bold uppercase tracking-wide">Total Orders</p>
                </div>
                <p className="text-3xl font-black text-zinc-900">{orders.length}</p>
              </div>
              <div className="bg-white p-6 rounded-[1.75rem] border border-zinc-200 shadow-sm">
                <div className="flex items-center gap-2 mb-2 text-zinc-500">
                  <BarChart3 className="h-4 w-4" /> <p className="text-xs font-bold uppercase tracking-wide">Avg Order Value</p>
                </div>
                <p className="text-3xl font-black text-zinc-900">Rs. {avgOrderValue}</p>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              {/* Order status breakdown */}
              <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 mb-6">Order Status</h2>
                <div className="space-y-4">
                  {Object.entries(statusCounts).map(([status, count]) => {
                    const pct = orders.length ? Math.round((count / orders.length) * 100) : 0;
                    const color = status === "Pending" ? "bg-amber-400" : status === "Dispatched" ? "bg-blue-500" : "bg-emerald-500";
                    return (
                      <div key={status}>
                        <div className="flex justify-between text-sm font-bold text-zinc-700 mb-1.5">
                          <span>{status}</span>
                          <span>{count} orders</span>
                        </div>
                        <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Best sellers */}
              <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
                <h2 className="text-xl font-bold text-zinc-900 mb-6 flex items-center gap-2">
                  <Package className="h-5 w-5 text-zinc-400" /> Best-Selling Items
                </h2>
                {topProducts.length === 0 ? (
                  <p className="text-zinc-500">Abhi tak koi order nahi hua.</p>
                ) : (
                  <div className="space-y-4">
                    {topProducts.map((item) => (
                      <div key={item.name}>
                        <div className="flex justify-between text-sm font-bold text-zinc-700 mb-1.5">
                          <span className="truncate pr-2">{item.name}</span>
                          <span className="shrink-0">{item.qty} sold</span>
                        </div>
                        <div className="h-3 w-full bg-zinc-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-zinc-900 rounded-full transition-all"
                            style={{ width: `${(item.qty / maxTopQty) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Stock health */}
            <div className="bg-white p-8 rounded-[2rem] border border-zinc-200 shadow-sm">
              <h2 className="text-xl font-bold text-zinc-900 mb-6">Stock Health</h2>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="p-5 bg-[#F9F9F6] rounded-2xl border border-zinc-100">
                  <p className="text-2xl font-black text-zinc-900">{products.length}</p>
                  <p className="text-sm text-zinc-500 font-medium">Total Products</p>
                </div>
                <div className="p-5 bg-amber-50 rounded-2xl border border-amber-100">
                  <p className="text-2xl font-black text-amber-700">{lowStockProducts.length}</p>
                  <p className="text-sm text-amber-700 font-medium">Low Stock (≤5)</p>
                </div>
                <div className="p-5 bg-red-50 rounded-2xl border border-red-100">
                  <p className="text-2xl font-black text-red-700">{outOfStockProducts.length}</p>
                  <p className="text-sm text-red-700 font-medium">Out of Stock</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 🚀 NAYA: PREMIUM EDIT MODAL WITH DOUBLE PRICE */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm px-4">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-lg w-full border border-zinc-200 relative max-h-[90vh] overflow-y-auto">
            <button onClick={() => setEditingProduct(null)} className="absolute top-6 right-6 p-2 bg-zinc-100 rounded-full"><X className="h-5 w-5" /></button>
            <h3 className="text-2xl font-black text-zinc-900 mb-6 flex items-center gap-2"><Pencil className="h-6 w-6 text-zinc-400" /> Edit Product</h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-5">
              <div><input value={editName} onChange={(e) => setEditName(e.target.value)} required className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl px-4 py-3 outline-none" /></div>
              <select value={editCategory} onChange={(e) => setEditCategory(e.target.value)} className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl px-4 py-3 outline-none">
                <option value="Grocery">Grocery</option><option value="Household">Household</option><option value="Snacks & Cold Drinks">Snacks & Cold Drinks</option><option value="Electronics">Electronics</option><option value="Crockery">Crockery</option><option value="Toys">Toys</option><option value="Sports Items">Sports Items</option><option value="Stationery">Stationery</option><option value="Cigarettes">Cigarettes</option>
              </select>

              <div className="flex items-center gap-3 bg-amber-50 p-4 rounded-xl border border-amber-200 cursor-pointer mt-2" onClick={() => setEditIsOffer(!editIsOffer)}>
                <input type="checkbox" checked={editIsOffer} onChange={() => {}} className="w-5 h-5 accent-amber-500 cursor-pointer pointer-events-none" />
                <p className="text-amber-900 font-bold text-sm">Add to "Offers & Discounts"</p>
              </div>

              {/* Edit Modal Double Price Logic */}
              {editIsOffer ? (
                  <div className="grid grid-cols-2 gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
                    <div>
                      <label className="text-xs font-bold text-amber-900 mb-1 block">Original Price</label>
                      <input type="number" value={editOriginalPrice} onChange={(e) => setEditOriginalPrice(e.target.value)} required className="w-full bg-white border border-amber-200 rounded-lg px-3 py-2 outline-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-green-700 mb-1 block">Discount Price</label>
                      <input type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required className="w-full bg-white border border-green-200 rounded-lg px-3 py-2 outline-none text-green-700 font-bold" />
                    </div>
                  </div>
                ) : (
                  <div><input type="number" placeholder="Price (Rs.)" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} required className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl px-4 py-3 outline-none" /></div>
              )}

              <div>
                <label className="text-xs font-bold text-zinc-700 mb-1 block">Stock (kitni quantity available hai)</label>
                <input type="number" min="0" placeholder="Stock Quantity" value={editStock} onChange={(e) => setEditStock(e.target.value)} required className="w-full bg-[#F9F9F6] border border-zinc-200 rounded-xl px-4 py-3 outline-none" />
              </div>

              <button type="submit" disabled={isEditSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg py-4 rounded-full transition-all mt-6 shadow-md">
                {isEditSubmitting ? "Saving..." : "Save Changes"}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* DELETE MODAL (Same as before) */}
      {productToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/60 backdrop-blur-sm px-4">
          <div className="bg-white p-8 md:p-10 rounded-[2.5rem] shadow-2xl max-w-sm w-full text-center border border-zinc-200">
            <h3 className="text-2xl font-black text-zinc-900 mb-2">Delete Product?</h3>
            <div className="flex gap-4 mt-6">
              <button onClick={() => setProductToDelete(null)} className="flex-1 bg-[#F9F9F6] border border-zinc-200 hover:bg-zinc-100 text-zinc-600 font-bold py-4 rounded-full transition-all">Cancel</button>
              <button onClick={executeDelete} className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-4 rounded-full transition-all shadow-md">Delete</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}