"use client";

import { useState, useEffect, useCallback } from "react";
import { Order, OrderStatus, Product } from "@/lib/types";
import { ORDER_STATUSES, ORDER_STATUS_LABELS, ORDER_STATUS_COLORS } from "@/lib/orderStatus";
import { updateSiteSettings, DEFAULT_SITE_SETTINGS, SiteSettings } from "@/lib/siteSettings";

const DEFAULT_GALLERY = [
  "/images/gallery/hero.jpg",
  "/images/gallery/photo1.jpg",
  "/images/gallery/photo2.jpg",
  "/images/gallery/photo3.jpg",
  "/images/gallery/photo4.jpg",
];

const DEFAULT_SETTINGS: SiteSettings = { ...DEFAULT_SITE_SETTINGS };

type Tab = "dashboard" | "products" | "gallery" | "orders" | "settings";

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersError, setOrdersError] = useState("");
  const [gallery, setGallery] = useState<string[]>(DEFAULT_GALLERY);
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [newGalleryUrl, setNewGalleryUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [settingsSaved, setSettingsSaved] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [newSize, setNewSize] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    price: 0,
    images: [""],
    sizes: ["S", "M", "L", "XL"],
    category: "T-shirts",
    inStock: true,
    stock: {} as Record<string, number>,
    sortOrder: 0,
  });

  const EMPTY_FORM = {
    name: "",
    description: "",
    price: 0,
    images: [""],
    sizes: ["S", "M", "L", "XL"],
    category: "T-shirts",
    inStock: true,
    stock: {} as Record<string, number>,
    sortOrder: 0,
  };

  // An expired session used to make every button fail silently.
  const apiWrite = useCallback(
    async (url: string, method: string, body?: unknown) => {
      const res = await fetch(url, {
        method,
        headers: body === undefined ? undefined : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      }).catch(() => null);
      if (res && res.status === 401) {
        setAuthenticated(false);
        return null;
      }
      return res;
    },
    []
  );

  const fetchProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/products", { cache: "no-store" });
      if (res.ok) setProducts(await res.json());
    } catch {}
  }, []);

  // Restore an existing session so a reload does not log the admin out.
  useEffect(() => {
    fetch("/api/admin/session", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: { authenticated?: boolean }) => setAuthenticated(Boolean(d.authenticated)))
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, []);

  const fetchOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders", { cache: "no-store" });
      if (res.status === 401) { setAuthenticated(false); return; }
      if (res.ok) {
        setOrders(await res.json());
        setOrdersError("");
      } else {
        const body = await res.json().catch(() => ({}));
        setOrdersError(body.error || "Impossible de charger les commandes.");
      }
    } catch {
      setOrdersError("Impossible de charger les commandes.");
    }
  }, []);

  // Gallery and settings live in Supabase, not in this browser's localStorage.
  useEffect(() => {
    if (!authenticated) return;
    fetchProducts();
    fetchOrders();
    fetch("/api/gallery", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: string[]) => Array.isArray(d) && setGallery(d))
      .catch(() => {});
    fetch("/api/settings", { cache: "no-store" })
      .then((r) => r.json())
      .then((d: SiteSettings) => setSettings({ ...DEFAULT_SETTINGS, ...d }))
      .catch(() => {});
  }, [authenticated, fetchProducts, fetchOrders]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        setAuthenticated(true);
        setLoginError(false);
        setPassword("");
      } else {
        setLoginError(true);
      }
    } catch {
      setLoginError(true);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/admin/login", { method: "DELETE" }).catch(() => {});
    setAuthenticated(false);
  };

  const handleSave = async () => {
    const method = editing ? "PUT" : "POST";
    const body = editing ? { ...form, id: editing.id } : form;
    const res = await apiWrite("/api/products", method, body);
    if (!res || !res.ok) return;
    setShowForm(false);
    setEditing(null);
    setForm({ ...EMPTY_FORM });
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Supprimer ce produit ?")) return;
    await apiWrite("/api/products", "DELETE", { id });
    fetchProducts();
  };

  const handleEdit = (product: Product) => {
    setEditing(product);
    setForm({
      name: product.name,
      description: product.description,
      price: product.price,
      images: product.images,
      sizes: product.sizes,
      category: product.category,
      inStock: product.inStock,
      stock: product.stock ?? {},
      sortOrder: product.sortOrder ?? 0,
    });
    setShowForm(true);
  };

  const handleToggleStock = async (product: Product) => {
    await apiWrite("/api/products", "PUT", {
      id: product.id,
      inStock: !product.inStock,
    });
    fetchProducts();
  };

  const setOrderStatus = async (id: string, status: OrderStatus) => {
    setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, status } : o)));
    const res = await apiWrite("/api/orders", "PUT", { id, status });
    if (!res || !res.ok) fetchOrders(); // revert to whatever the server has
  };

  const removeOrder = async (id: string, reference: string) => {
    if (!confirm(`Supprimer définitivement la commande ${reference} ?`)) return;
    await apiWrite("/api/orders", "DELETE", { id });
    fetchOrders();
  };

  const saveGallery = async (photos: string[]) => {
    setGallery(photos);
    await apiWrite("/api/gallery", "PUT", photos);
  };

  const uploadFile = async (file: File, folder: string): Promise<string | null> => {
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      if (res.status === 401) {
        setAuthenticated(false);
        return null;
      }
      const data = await res.json();
      if (data.path) return data.path;
      alert(data.error || "Échec de l'upload");
      return null;
    } catch {
      alert("Échec de l'upload");
      return null;
    } finally {
      setUploading(false);
    }
  };

  const saveSettings = async () => {
    const res = await apiWrite("/api/settings", "PUT", settings);
    if (!res || !res.ok) return;
    // Reflect the change in this tab straight away; other visitors get it
    // from the server on their next page load.
    updateSiteSettings(settings);
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 2000);
  };

  // ─── LOGIN ──────────────────────────────────────────────────────
  if (checkingSession) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, -apple-system, sans-serif", color: "#aaa", fontSize: 13 }}>
        Chargement…
      </div>
    );
  }

  if (!authenticated) {
    return (
      <div style={{ minHeight: "100vh", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Inter, -apple-system, sans-serif" }}>
        <div style={{ width: "100%", maxWidth: 400, padding: "0 24px" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: "48px 36px", boxShadow: "0 1px 3px rgba(0,0,0,0.08), 0 8px 30px rgba(0,0,0,0.04)" }}>
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ width: 48, height: 48, background: "#111", borderRadius: 12, display: "inline-flex", alignItems: "center", justifyContent: "center", marginBottom: 16 }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 18 }}>C</span>
              </div>
              <h1 style={{ fontSize: 20, fontWeight: 600, color: "#111", margin: 0 }}>Corbus Admin</h1>
              <p style={{ fontSize: 13, color: "#888", marginTop: 6 }}>Connectez-vous pour gérer votre boutique</p>
            </div>
            <form onSubmit={handleLogin}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 500, color: "#444", marginBottom: 6 }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setLoginError(false); }}
                placeholder="Entrez le mot de passe"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontSize: 14,
                  border: `1px solid ${loginError ? "#ef4444" : "#e0e0e0"}`,
                  borderRadius: 8,
                  outline: "none",
                  background: "#fff",
                  color: "#111",
                  boxSizing: "border-box",
                }}
              />
              {loginError && <p style={{ fontSize: 12, color: "#ef4444", marginTop: 6 }}>Mot de passe incorrect</p>}
              <button
                type="submit"
                style={{
                  width: "100%",
                  padding: "10px 0",
                  marginTop: 16,
                  background: "#111",
                  color: "#fff",
                  border: "none",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                Se connecter
              </button>
            </form>
          </div>
          <p style={{ textAlign: "center", fontSize: 11, color: "#aaa", marginTop: 24 }}>CORBUS Admin Panel v2.0</p>
        </div>
      </div>
    );
  }

  const inStock = products.filter((p) => p.inStock).length;
  const outOfStock = products.filter((p) => !p.inStock).length;

  const tabs: { key: Tab; label: string; icon: string }[] = [
    { key: "dashboard", label: "Tableau de bord", icon: "📊" },
    { key: "products", label: "Produits", icon: "👕" },
    { key: "gallery", label: "Galerie", icon: "🖼" },
    { key: "orders", label: "Commandes", icon: "📦" },
    { key: "settings", label: "Paramètres", icon: "⚙️" },
  ];

  // ─── Shared styles ──────────────────────────────────────────────
  const s = {
    page: { minHeight: "100vh", background: "#f5f5f5", display: "flex", fontFamily: "Inter, -apple-system, sans-serif", color: "#111" } as React.CSSProperties,
    sidebar: {
      width: 220,
      minWidth: 220,
      background: "#fff",
      borderRight: "1px solid #eee",
      display: "flex",
      flexDirection: "column" as const,
      position: "fixed" as const,
      top: 0,
      left: 0,
      bottom: 0,
      zIndex: 40,
      overflowY: "auto" as const,
    } as React.CSSProperties,
    main: { flex: 1, marginLeft: 220, minHeight: "100vh", minWidth: 0, overflowX: "hidden" as const } as React.CSSProperties,
    card: { background: "#fff", borderRadius: 12, border: "1px solid #eee", padding: 24 } as React.CSSProperties,
    btn: { padding: "8px 16px", borderRadius: 8, border: "none", fontSize: 13, fontWeight: 500 as const, cursor: "pointer" },
    input: {
      width: "100%",
      padding: "10px 14px",
      fontSize: 14,
      border: "1px solid #e0e0e0",
      borderRadius: 8,
      outline: "none",
      background: "#fff",
      color: "#111",
      boxSizing: "border-box" as const,
    },
    label: { display: "block", fontSize: 12, fontWeight: 500 as const, color: "#666", marginBottom: 6 },
    badge: (active: boolean) => ({
      display: "inline-block",
      padding: "3px 10px",
      borderRadius: 20,
      fontSize: 11,
      fontWeight: 500 as const,
      background: active ? "#dcfce7" : "#fee2e2",
      color: active ? "#166534" : "#991b1b",
    }),
  };

  return (
    <div style={s.page}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 35 }}
        />
      )}

      {/* Sidebar */}
      <aside
        style={{
          ...s.sidebar,
          ...(typeof window !== "undefined" && window.innerWidth < 768
            ? { transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.2s" }
            : {}),
        }}
      >
        <div style={{ padding: "24px 20px", borderBottom: "1px solid #eee" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ width: 36, height: 36, background: "#111", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ color: "#fff", fontWeight: 700, fontSize: 15 }}>C</span>
            </div>
            <div>
              <p style={{ fontWeight: 600, fontSize: 15, margin: 0 }}>CORBUS</p>
              <p style={{ fontSize: 11, color: "#999", margin: 0 }}>Administration</p>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: "12px 10px" }}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSidebarOpen(false); }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                width: "100%",
                padding: "10px 14px",
                borderRadius: 8,
                border: "none",
                background: activeTab === tab.key ? "#f0f0f0" : "transparent",
                color: activeTab === tab.key ? "#111" : "#666",
                fontWeight: activeTab === tab.key ? 500 : 400,
                fontSize: 14,
                cursor: "pointer",
                marginBottom: 2,
                textAlign: "left" as const,
              }}
            >
              <span style={{ fontSize: 16 }}>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div style={{ padding: "16px 10px", borderTop: "1px solid #eee" }}>
          <button
            onClick={() => setAuthenticated(false)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              width: "100%",
              padding: "10px 14px",
              borderRadius: 8,
              border: "none",
              background: "transparent",
              color: "#999",
              fontSize: 14,
              cursor: "pointer",
              textAlign: "left" as const,
            }}
          >
            🚪 Déconnexion
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={s.main}>
        {/* Top bar */}
        <header style={{ padding: "16px 24px", borderBottom: "1px solid #eee", background: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, zIndex: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <button onClick={() => setSidebarOpen(true)} className="admin-menu-btn" style={{ background: "none", border: "none", fontSize: 22, cursor: "pointer", padding: 4 }}>☰</button>
            <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>
              {tabs.find((t) => t.key === activeTab)?.label}
            </h1>
          </div>
          <p style={{ fontSize: 12, color: "#999" }}>
            {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
          </p>
        </header>

        <div style={{ padding: "24px 24px", maxWidth: "100%", boxSizing: "border-box" as const }}>

          {/* ─── DASHBOARD ──────────────────────────────────────── */}
          {activeTab === "dashboard" && (
            <div>
              {/* Stats */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12, marginBottom: 24 }}>
                {[
                  { label: "Produits", value: products.length, color: "#3b82f6", bg: "#eff6ff" },
                  { label: "En stock", value: inStock, color: "#16a34a", bg: "#f0fdf4" },
                  { label: "Épuisés", value: outOfStock, color: "#dc2626", bg: "#fef2f2" },
                  { label: "Photos galerie", value: gallery.length, color: "#8b5cf6", bg: "#faf5ff" },
                  { label: "Commandes", value: orders.length, color: "#0891b2", bg: "#ecfeff" },
                  {
                    label: "À traiter",
                    value: orders.filter((o) => o.status === "received").length,
                    color: "#ea580c",
                    bg: "#fff7ed",
                  },
                ].map((stat) => (
                  <div key={stat.label} style={s.card}>
                    <p style={{ fontSize: 12, color: "#888", fontWeight: 500, textTransform: "uppercase", letterSpacing: 0.5, margin: "0 0 8px" }}>{stat.label}</p>
                    <p style={{ fontSize: 36, fontWeight: 700, margin: 0, color: stat.color }}>{stat.value}</p>
                  </div>
                ))}
              </div>

              {/* Recent products */}
              <div style={s.card}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, margin: 0 }}>Produits récents</h3>
                  <button onClick={() => setActiveTab("products")} style={{ ...s.btn, background: "transparent", color: "#3b82f6", padding: 0, fontSize: 13 }}>Voir tout →</button>
                </div>
                <div style={{ overflowX: "auto" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <th style={{ textAlign: "left", padding: "8px 8px 8px 0", fontSize: 11, color: "#999", fontWeight: 500, textTransform: "uppercase", width: "40%" }}>Produit</th>
                      <th style={{ textAlign: "left", padding: "8px", fontSize: 11, color: "#999", fontWeight: 500, textTransform: "uppercase", width: "22%" }}>Prix</th>
                      <th style={{ textAlign: "left", padding: "8px", fontSize: 11, color: "#999", fontWeight: 500, textTransform: "uppercase", width: "18%" }}>Catégorie</th>
                      <th style={{ textAlign: "right", padding: "8px 0 8px 8px", fontSize: 11, color: "#999", fontWeight: 500, textTransform: "uppercase", width: "20%" }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map((p) => (
                      <tr key={p.id} style={{ borderBottom: "1px solid #f8f8f8" }}>
                        <td style={{ padding: "12px 8px 12px 0" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                            <img src={p.images[0]} alt="" style={{ width: 36, height: 36, borderRadius: 6, objectFit: "cover", background: "#f5f5f5", flexShrink: 0 }} />
                            <span style={{ fontSize: 13, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</span>
                          </div>
                        </td>
                        <td style={{ padding: "12px 8px", fontSize: 13, color: "#666" }}>{p.price.toLocaleString()} FCFA</td>
                        <td style={{ padding: "12px 8px", fontSize: 12, color: "#888" }}>{p.category}</td>
                        <td style={{ padding: "12px 0 12px 8px", textAlign: "right" }}>
                          <span style={s.badge(p.inStock)}>{p.inStock ? "En stock" : "Épuisé"}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                </div>
                {products.length === 0 && <p style={{ textAlign: "center", color: "#ccc", padding: 32 }}>Aucun produit</p>}
              </div>
            </div>
          )}

          {/* ─── PRODUCTS ──────────────────────────────────────── */}
          {activeTab === "products" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                <p style={{ fontSize: 14, color: "#888", margin: 0 }}>{products.length} produit{products.length !== 1 ? "s" : ""}</p>
                <button
                  onClick={() => {
                    setEditing(null);
                    setForm({ ...EMPTY_FORM });
                    setShowForm(true);
                  }}
                  style={{ ...s.btn, background: "#111", color: "#fff", display: "flex", alignItems: "center", gap: 6 }}
                >
                  + Ajouter un produit
                </button>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {products.map((p) => (
                  <div key={p.id} style={{ ...s.card, padding: "16px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <img src={p.images[0]} alt="" style={{ width: 50, height: 50, borderRadius: 8, objectFit: "cover", background: "#f5f5f5", flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <h3 style={{ fontSize: 14, fontWeight: 600, margin: "0 0 4px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</h3>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#333" }}>{p.price.toLocaleString()} FCFA</span>
                          <span style={{ fontSize: 12, color: "#999" }}>{p.category}</span>
                          <span style={s.badge(p.inStock)}>{p.inStock ? "En stock" : "Épuisé"}</span>
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 12, flexWrap: "wrap", alignItems: "center" }}>
                      <div style={{ display: "flex", gap: 4, marginRight: "auto" }}>
                        {p.sizes.map((sz) => (
                          <span key={sz} style={{ padding: "2px 8px", borderRadius: 4, background: "#f5f5f5", fontSize: 11, color: "#666" }}>{sz}</span>
                        ))}
                      </div>
                      <button onClick={() => handleToggleStock(p)} style={{ ...s.btn, background: p.inStock ? "#fef2f2" : "#f0fdf4", color: p.inStock ? "#dc2626" : "#16a34a", fontSize: 12 }}>
                        {p.inStock ? "Épuiser" : "En stock"}
                      </button>
                      <button onClick={() => handleEdit(p)} style={{ ...s.btn, background: "#f5f5f5", color: "#333", fontSize: 12 }}>Modifier</button>
                      <button onClick={() => handleDelete(p.id)} style={{ ...s.btn, background: "#fef2f2", color: "#dc2626", fontSize: 12 }}>✕</button>
                    </div>
                  </div>
                ))}
              </div>

              {products.length === 0 && (
                <div style={{ ...s.card, textAlign: "center", padding: 60, color: "#ccc" }}>
                  <p style={{ fontSize: 40, margin: "0 0 12px" }}>👕</p>
                  <p>Aucun produit pour le moment</p>
                </div>
              )}
            </div>
          )}

          {/* ─── GALLERY ──────────────────────────────────────── */}
          {activeTab === "gallery" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 12 }}>
                <p style={{ fontSize: 14, color: "#888", margin: 0 }}>{gallery.length} photo{gallery.length !== 1 ? "s" : ""}</p>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <label style={{ ...s.btn, background: "#111", color: "#fff", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      style={{ display: "none" }}
                      onChange={async (e) => {
                        const files = Array.from(e.target.files || []);
                        for (const file of files) {
                          const path = await uploadFile(file, "gallery");
                          if (path) saveGallery([...gallery, path]);
                        }
                        e.target.value = "";
                      }}
                    />
                    📸 {uploading ? "Upload..." : "Uploader"}
                  </label>
                </div>
              </div>
              <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                <input
                  type="text"
                  value={newGalleryUrl}
                  onChange={(e) => setNewGalleryUrl(e.target.value)}
                  placeholder="Ou coller un chemin d'image..."
                  style={{ ...s.input, flex: 1 }}
                />
                <button
                  onClick={() => {
                    if (newGalleryUrl.trim()) {
                      saveGallery([...gallery, newGalleryUrl.trim()]);
                      setNewGalleryUrl("");
                    }
                  }}
                  style={{ ...s.btn, background: "#f5f5f5", color: "#333" }}
                >
                  Ajouter
                </button>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: 16 }}>
                {gallery.map((photo, i) => (
                  <div key={i} style={{ ...s.card, padding: 0, overflow: "hidden", position: "relative" }}>
                    <img src={photo} alt="" style={{ width: "100%", height: 200, objectFit: "cover" }} />
                    <div style={{ padding: "10px 12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <span style={{ fontSize: 11, color: "#999", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "70%" }}>{photo}</span>
                      <button
                        onClick={() => saveGallery(gallery.filter((_, j) => j !== i))}
                        style={{ ...s.btn, background: "#fef2f2", color: "#dc2626", padding: "4px 10px", fontSize: 12 }}
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── ORDERS ──────────────────────────────────────── */}
          {activeTab === "orders" && (
            <div>
              {ordersError && (
                <div style={{ ...s.card, border: "1px solid #fecaca", marginBottom: 16 }}>
                  <p style={{ fontSize: 13, color: "#dc2626", margin: 0 }}>{ordersError}</p>
                </div>
              )}

              {orders.length === 0 && !ordersError && (
                <div style={{ ...s.card, textAlign: "center", padding: 80 }}>
                  <p style={{ fontSize: 48, margin: "0 0 16px" }}>📦</p>
                  <h3 style={{ fontSize: 18, fontWeight: 600, margin: "0 0 8px" }}>Aucune commande</h3>
                  <p style={{ fontSize: 14, color: "#888", maxWidth: 420, margin: "0 auto" }}>
                    Chaque commande validée au panier est enregistrée ici, même si
                    le client n&apos;envoie jamais son message WhatsApp.
                  </p>
                </div>
              )}

              {orders.map((o) => {
                const c = ORDER_STATUS_COLORS[o.status] ?? { bg: "#f5f5f5", fg: "#666" };
                return (
                  <div key={o.id} style={{ ...s.card, marginBottom: 12 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
                      <div style={{ minWidth: 200 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                          <strong style={{ fontSize: 15 }}>{o.reference}</strong>
                          <span style={{ background: c.bg, color: c.fg, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 999 }}>
                            {ORDER_STATUS_LABELS[o.status] ?? o.status}
                          </span>
                        </div>
                        <p style={{ fontSize: 13, color: "#444", margin: "0 0 2px" }}>
                          {o.customerName} — <a href={`tel:${o.customerPhone}`} style={{ color: "#2563eb" }}>{o.customerPhone}</a>
                        </p>
                        <p style={{ fontSize: 12, color: "#999", margin: 0 }}>
                          {[o.address, o.city, o.country].filter(Boolean).join(", ")}
                        </p>
                        <p style={{ fontSize: 12, color: "#bbb", margin: "4px 0 0" }}>
                          {new Date(o.createdAt).toLocaleString("fr-FR")}
                        </p>
                      </div>

                      <div style={{ flex: 1, minWidth: 220 }}>
                        {o.items.map((it, i) => (
                          <p key={i} style={{ fontSize: 13, color: "#444", margin: "0 0 4px" }}>
                            {it.quantity} × {it.name}
                            {it.size ? ` (${it.size})` : ""} — {(it.price * it.quantity).toLocaleString()} {o.currency}
                          </p>
                        ))}
                        <p style={{ fontSize: 14, fontWeight: 600, margin: "8px 0 0" }}>
                          Total : {o.total.toLocaleString()} {o.currency}
                        </p>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: 8, alignItems: "flex-end" }}>
                        <select
                          value={o.status}
                          onChange={(e) => setOrderStatus(o.id, e.target.value as OrderStatus)}
                          style={{ ...s.input, padding: "6px 10px", width: 150 }}
                        >
                          {ORDER_STATUSES.map((st) => (
                            <option key={st} value={st}>{ORDER_STATUS_LABELS[st]}</option>
                          ))}
                        </select>
                        <div style={{ display: "flex", gap: 8 }}>
                          <a
                            href={`https://wa.me/${o.customerPhone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ ...s.btn, background: "#ecfdf5", color: "#047857", textDecoration: "none", fontSize: 12 }}
                          >
                            WhatsApp
                          </a>
                          <button
                            onClick={() => removeOrder(o.id, o.reference)}
                            style={{ ...s.btn, background: "#fef2f2", color: "#dc2626", fontSize: 12 }}
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ─── SETTINGS ──────────────────────────────────────── */}
          {activeTab === "settings" && (
            <div style={{ maxWidth: 600 }}>
              {/* Contact */}
              <div style={{ ...s.card, marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 20px" }}>Informations de contact</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={s.label}>Numéro WhatsApp</label>
                    <input
                      type="text"
                      value={settings.whatsapp}
                      onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Instagram</label>
                    <input
                      type="text"
                      value={settings.instagram}
                      onChange={(e) => setSettings({ ...settings, instagram: e.target.value })}
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Email</label>
                    <input
                      type="text"
                      value={settings.email}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Slogan</label>
                    <input
                      type="text"
                      value={settings.tagline}
                      onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                      style={s.input}
                    />
                  </div>
                  <button onClick={saveSettings} style={{ ...s.btn, background: "#111", color: "#fff", alignSelf: "flex-start" }}>
                    {settingsSaved ? "✓ Enregistré" : "Enregistrer"}
                  </button>
                </div>
              </div>

              {/* Site Content */}
              <div style={{ ...s.card, marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 20px" }}>Contenu du site</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  <div>
                    <label style={s.label}>Image hero</label>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", marginBottom: 8 }}>
                      {settings.heroImage && (
                        <img src={settings.heroImage} alt="" style={{ width: 80, height: 50, objectFit: "cover", borderRadius: 6, border: "1px solid #eee" }} />
                      )}
                      <label style={{ ...s.btn, background: "#f5f5f5", color: "#333", cursor: "pointer", fontSize: 12, display: "flex", alignItems: "center", gap: 4 }}>
                        <input
                          type="file"
                          accept="image/*"
                          style={{ display: "none" }}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const path = await uploadFile(file, "gallery");
                              if (path) setSettings({ ...settings, heroImage: path });
                            }
                            e.target.value = "";
                          }}
                        />
                        📸 Changer
                      </label>
                    </div>
                    <input
                      type="text"
                      value={settings.heroImage}
                      onChange={(e) => setSettings({ ...settings, heroImage: e.target.value })}
                      placeholder="/images/gallery/photo4.jpg"
                      style={{ ...s.input, fontSize: 12 }}
                    />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <button
                      type="button"
                      onClick={() => setSettings({ ...settings, heroLogoVisible: !settings.heroLogoVisible })}
                      style={{
                        width: 44,
                        height: 24,
                        borderRadius: 12,
                        border: "none",
                        background: settings.heroLogoVisible ? "#16a34a" : "#e0e0e0",
                        position: "relative",
                        cursor: "pointer",
                        transition: "background 0.2s",
                      }}
                    >
                      <div style={{
                        width: 18,
                        height: 18,
                        borderRadius: 9,
                        background: "#fff",
                        position: "absolute",
                        top: 3,
                        left: settings.heroLogoVisible ? 23 : 3,
                        transition: "left 0.2s",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                      }} />
                    </button>
                    <span style={{ fontSize: 14, color: "#444" }}>Logo visible sur le hero</span>
                  </div>
                  <div>
                    <label style={s.label}>Citation / Quote</label>
                    <input
                      type="text"
                      value={settings.quoteText}
                      onChange={(e) => setSettings({ ...settings, quoteText: e.target.value })}
                      placeholder="Fashion with Spirit, Style with Meaning"
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Titre de bienvenue</label>
                    <input
                      type="text"
                      value={settings.welcomeTitle}
                      onChange={(e) => setSettings({ ...settings, welcomeTitle: e.target.value })}
                      placeholder="Welcome to the Corbusland"
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Sous-titre de bienvenue</label>
                    <input
                      type="text"
                      value={settings.welcomeSubtitle}
                      onChange={(e) => setSettings({ ...settings, welcomeSubtitle: e.target.value })}
                      placeholder="Sous-titre optionnel"
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Titre carte RAVEN</label>
                    <input
                      type="text"
                      value={settings.ravenTitle}
                      onChange={(e) => setSettings({ ...settings, ravenTitle: e.target.value })}
                      placeholder="RAVEN"
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Titre carte CROW</label>
                    <input
                      type="text"
                      value={settings.crowTitle}
                      onChange={(e) => setSettings({ ...settings, crowTitle: e.target.value })}
                      placeholder="CROW"
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Titre carte BLACKBIRDS</label>
                    <input
                      type="text"
                      value={settings.blackbirdTitle}
                      onChange={(e) => setSettings({ ...settings, blackbirdTitle: e.target.value })}
                      placeholder="BLACKBIRDS"
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Titre page « Qui sommes-nous »</label>
                    <input
                      type="text"
                      value={settings.aboutTitle}
                      onChange={(e) => setSettings({ ...settings, aboutTitle: e.target.value })}
                      placeholder="Who & What We Are?"
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Sous-titre page « Qui sommes-nous »</label>
                    <input
                      type="text"
                      value={settings.aboutSubtitle}
                      onChange={(e) => setSettings({ ...settings, aboutSubtitle: e.target.value })}
                      placeholder="Fashion with Spirit, Style with Meaning"
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Titre du catalogue</label>
                    <input
                      type="text"
                      value={settings.catalogTitle}
                      onChange={(e) => setSettings({ ...settings, catalogTitle: e.target.value })}
                      placeholder="All Products"
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Surtitre de la galerie</label>
                    <input
                      type="text"
                      value={settings.galleryEyebrow}
                      onChange={(e) => setSettings({ ...settings, galleryEyebrow: e.target.value })}
                      placeholder="Lookbook"
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Titre de la galerie</label>
                    <input
                      type="text"
                      value={settings.galleryTitle}
                      onChange={(e) => setSettings({ ...settings, galleryTitle: e.target.value })}
                      placeholder="Gallery"
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Sous-titre de la galerie</label>
                    <input
                      type="text"
                      value={settings.gallerySubtitle}
                      onChange={(e) => setSettings({ ...settings, gallerySubtitle: e.target.value })}
                      placeholder="The Corbus Collective"
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Mention du pied de page</label>
                    <input
                      type="text"
                      value={settings.footerNote}
                      onChange={(e) => setSettings({ ...settings, footerNote: e.target.value })}
                      placeholder="© 2026 CORBUS. All rights reserved."
                      style={s.input}
                    />
                  </div>
                  <div>
                    <label style={s.label}>Durée écran de chargement (ms)</label>
                    <input
                      type="number"
                      value={settings.loadingDuration}
                      onChange={(e) => setSettings({ ...settings, loadingDuration: Number(e.target.value) })}
                      style={s.input}
                    />
                  </div>

                  {/* Font settings */}
                  <div style={{ borderTop: "1px solid #eee", paddingTop: 20, marginTop: 8 }}>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#333", marginBottom: 16 }}>Polices</p>
                  </div>
                  <div>
                    <label style={s.label}>Police du corps (texte)</label>
                    <select
                      value={settings.bodyFont || "Inter"}
                      onChange={(e) => setSettings({ ...settings, bodyFont: e.target.value })}
                      style={{ ...s.input, fontFamily: settings.bodyFont }}
                    >
                      <optgroup label="Sans-Serif">
                        <option value="Inter">Inter</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Raleway">Raleway</option>
                        <option value="Lato">Lato</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                        <option value="DM Sans">DM Sans</option>
                        <option value="Josefin Sans">Josefin Sans</option>
                        <option value="Space Grotesk">Space Grotesk</option>
                        <option value="Syne">Syne</option>
                        <option value="Outfit">Outfit</option>
                        <option value="Oswald">Oswald</option>
                      </optgroup>
                      <optgroup label="Serif">
                        <option value="Cormorant Garamond">Cormorant Garamond</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="Merriweather">Merriweather</option>
                        <option value="Lora">Lora</option>
                        <option value="Source Serif 4">Source Serif 4</option>
                        <option value="Crimson Text">Crimson Text</option>
                        <option value="Libre Baskerville">Libre Baskerville</option>
                        <option value="DM Serif Display">DM Serif Display</option>
                        <option value="Bodoni Moda">Bodoni Moda</option>
                        <option value="Cinzel">Cinzel</option>
                      </optgroup>
                      <optgroup label="Display">
                        <option value="Bebas Neue">Bebas Neue</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Police des titres</label>
                    <select
                      value={settings.headingFont || "Cormorant Garamond"}
                      onChange={(e) => setSettings({ ...settings, headingFont: e.target.value })}
                      style={{ ...s.input, fontFamily: settings.headingFont }}
                    >
                      <optgroup label="Serif (recommandé)">
                        <option value="Cormorant Garamond">Cormorant Garamond</option>
                        <option value="Playfair Display">Playfair Display</option>
                        <option value="DM Serif Display">DM Serif Display</option>
                        <option value="Bodoni Moda">Bodoni Moda</option>
                        <option value="Cinzel">Cinzel</option>
                        <option value="Merriweather">Merriweather</option>
                        <option value="Lora">Lora</option>
                        <option value="Source Serif 4">Source Serif 4</option>
                        <option value="Crimson Text">Crimson Text</option>
                        <option value="Libre Baskerville">Libre Baskerville</option>
                      </optgroup>
                      <optgroup label="Sans-Serif">
                        <option value="Inter">Inter</option>
                        <option value="Montserrat">Montserrat</option>
                        <option value="Poppins">Poppins</option>
                        <option value="Raleway">Raleway</option>
                        <option value="Oswald">Oswald</option>
                        <option value="DM Sans">DM Sans</option>
                        <option value="Josefin Sans">Josefin Sans</option>
                        <option value="Space Grotesk">Space Grotesk</option>
                        <option value="Syne">Syne</option>
                        <option value="Outfit">Outfit</option>
                        <option value="Lato">Lato</option>
                        <option value="Roboto">Roboto</option>
                        <option value="Open Sans">Open Sans</option>
                      </optgroup>
                      <optgroup label="Display">
                        <option value="Bebas Neue">Bebas Neue</option>
                      </optgroup>
                    </select>
                  </div>
                  <div>
                    <label style={s.label}>Police gothique (logo / brand)</label>
                    <select
                      value={settings.gothicFont || "UnifrakturCook"}
                      onChange={(e) => setSettings({ ...settings, gothicFont: e.target.value })}
                      style={{ ...s.input, fontFamily: settings.gothicFont }}
                    >
                      <option value="UnifrakturCook">UnifrakturCook (blackletter)</option>
                      <option value="UnifrakturMaguntia">UnifrakturMaguntia (old english)</option>
                    </select>
                  </div>

                  <button onClick={saveSettings} style={{ ...s.btn, background: "#111", color: "#fff", alignSelf: "flex-start" }}>
                    {settingsSaved ? "✓ Enregistré" : "Enregistrer"}
                  </button>
                </div>
              </div>

              {/* Password */}
              <div style={{ ...s.card, marginBottom: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px" }}>Mot de passe</h3>
                <p style={{ fontSize: 13, color: "#888", margin: "0 0 16px", lineHeight: 1.6 }}>
                  Le mot de passe est maintenant vérifié côté serveur et stocké dans la
                  variable d&apos;environnement <code>ADMIN_PASSWORD</code>. Pour le changer,
                  modifie-la dans Cloudflare (Workers &amp; Pages → Settings → Variables and
                  Secrets) puis redéploie.
                </p>
                <button
                  onClick={handleLogout}
                  style={{ ...s.btn, background: "#f5f5f5", color: "#111", alignSelf: "flex-start" }}
                >
                  Se déconnecter
                </button>
              </div>

              {/* Danger zone */}
              <div style={{ ...s.card, border: "1px solid #fecaca" }}>
                <h3 style={{ fontSize: 15, fontWeight: 600, margin: "0 0 8px", color: "#dc2626" }}>Zone dangereuse</h3>
                <p style={{ fontSize: 13, color: "#888", margin: "0 0 16px" }}>Réinitialiser tous les paramètres aux valeurs par défaut</p>
                <button
                  onClick={async () => {
                    if (!confirm("Réinitialiser tous les paramètres ?")) return;
                    setGallery(DEFAULT_GALLERY);
                    setSettings(DEFAULT_SETTINGS);
                    await Promise.all([
                      apiWrite("/api/gallery", "PUT", DEFAULT_GALLERY),
                      apiWrite("/api/settings", "PUT", DEFAULT_SETTINGS),
                    ]);
                    updateSiteSettings(DEFAULT_SETTINGS);
                  }}
                  style={{ ...s.btn, background: "#fef2f2", color: "#dc2626" }}
                >
                  Réinitialiser
                </button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ─── Product Form Modal ──────────────────────────────────── */}
      {showForm && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 520, maxHeight: "85vh", overflow: "auto", padding: 32 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>{editing ? "Modifier le produit" : "Nouveau produit"}</h2>
              <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ background: "none", border: "none", fontSize: 20, cursor: "pointer", color: "#999" }}>✕</button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={s.label}>Nom du produit</label>
                <input type="text" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} style={s.input} />
              </div>
              <div>
                <label style={s.label}>Description</label>
                <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} style={{ ...s.input, resize: "none" }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={s.label}>Prix (FCFA)</label>
                  <input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} style={s.input} />
                </div>
                <div>
                  <label style={s.label}>Catégorie</label>
                  <input type="text" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} style={s.input} />
                </div>
              </div>

              {/* Sizes and per-size stock */}
              <div>
                <label style={s.label}>Tailles et stock</label>
                <p style={{ fontSize: 12, color: "#999", margin: "0 0 10px" }}>
                  Laisse le stock vide pour ne pas le suivre. À 0, la taille
                  apparaît barrée et non sélectionnable sur le site.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 10 }}>
                  {form.sizes.map((sz) => (
                    <div key={sz} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <span style={{ width: 56, fontSize: 13, fontWeight: 600 }}>{sz}</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="non suivi"
                        value={form.stock[sz] ?? ""}
                        onChange={(e) => {
                          const stock = { ...form.stock };
                          if (e.target.value === "") delete stock[sz];
                          else stock[sz] = Math.max(0, Number(e.target.value));
                          setForm({ ...form, stock });
                        }}
                        style={{ ...s.input, width: 120, padding: "6px 10px" }}
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const stock = { ...form.stock };
                          delete stock[sz];
                          setForm({ ...form, sizes: form.sizes.filter((x) => x !== sz), stock });
                        }}
                        style={{ ...s.btn, background: "#fef2f2", color: "#dc2626", fontSize: 12 }}
                      >
                        Retirer
                      </button>
                    </div>
                  ))}
                  {form.sizes.length === 0 && (
                    <p style={{ fontSize: 13, color: "#bbb", margin: 0 }}>Aucune taille.</p>
                  )}
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <input
                    type="text"
                    value={newSize}
                    placeholder="Ajouter une taille (S, 42, Unique…)"
                    onChange={(e) => setNewSize(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key !== "Enter") return;
                      e.preventDefault();
                      const v = newSize.trim();
                      if (v && !form.sizes.includes(v)) {
                        setForm({ ...form, sizes: [...form.sizes, v] });
                      }
                      setNewSize("");
                    }}
                    style={{ ...s.input, flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const v = newSize.trim();
                      if (v && !form.sizes.includes(v)) {
                        setForm({ ...form, sizes: [...form.sizes, v] });
                      }
                      setNewSize("");
                    }}
                    style={{ ...s.btn, background: "#111", color: "#fff" }}
                  >
                    Ajouter
                  </button>
                </div>
              </div>

              <div>
                <label style={s.label}>Ordre dans le catalogue</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })}
                  style={{ ...s.input, width: 140 }}
                />
                <p style={{ fontSize: 12, color: "#999", margin: "6px 0 0" }}>
                  Le plus petit nombre s&apos;affiche en premier.
                </p>
              </div>

              {/* Images */}
              <div>
                <label style={s.label}>Images</label>
                <p style={{ fontSize: 12, color: "#999", margin: "0 0 10px" }}>
                  La première image (encadrée) est celle qui s&apos;affiche dans le catalogue.
                </p>
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                  {form.images.filter(Boolean).map((img, i, all) => (
                    <div key={`${img}-${i}`} style={{ position: "relative", width: 72 }}>
                      <img src={img} alt="" style={{ width: 72, height: 72, borderRadius: 8, objectFit: "cover", border: i === 0 ? "2px solid #111" : "1px solid #eee" }} />
                      <button
                        onClick={() => setForm({ ...form, images: all.filter((_, j) => j !== i) })}
                        title="Supprimer"
                        style={{ position: "absolute", top: -6, right: -6, width: 20, height: 20, borderRadius: 10, background: "#dc2626", color: "#fff", border: "none", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
                      >✕</button>
                      {/* The first image is the one the catalog shows. */}
                      <div style={{ display: "flex", gap: 4, marginTop: 4, justifyContent: "center" }}>
                        <button
                          type="button"
                          disabled={i === 0}
                          title="Déplacer à gauche"
                          onClick={() => {
                            const next = [...all];
                            [next[i - 1], next[i]] = [next[i], next[i - 1]];
                            setForm({ ...form, images: next });
                          }}
                          style={{ flex: 1, border: "1px solid #eee", background: "#fafafa", borderRadius: 4, fontSize: 11, cursor: i === 0 ? "not-allowed" : "pointer", opacity: i === 0 ? 0.3 : 1 }}
                        >←</button>
                        <button
                          type="button"
                          disabled={i === all.length - 1}
                          title="Déplacer à droite"
                          onClick={() => {
                            const next = [...all];
                            [next[i], next[i + 1]] = [next[i + 1], next[i]];
                            setForm({ ...form, images: next });
                          }}
                          style={{ flex: 1, border: "1px solid #eee", background: "#fafafa", borderRadius: 4, fontSize: 11, cursor: i === all.length - 1 ? "not-allowed" : "pointer", opacity: i === all.length - 1 ? 0.3 : 1 }}
                        >→</button>
                      </div>
                    </div>
                  ))}
                </div>
                <label
                  style={{
                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                    padding: "14px 0", border: "2px dashed #ddd", borderRadius: 10, cursor: "pointer",
                    color: "#888", fontSize: 13, transition: "border-color 0.2s",
                  }}
                  onDragOver={(e) => { e.preventDefault(); e.currentTarget.style.borderColor = "#3b82f6"; }}
                  onDragLeave={(e) => { e.currentTarget.style.borderColor = "#ddd"; }}
                  onDrop={async (e) => {
                    e.preventDefault();
                    e.currentTarget.style.borderColor = "#ddd";
                    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith("image/"));
                    for (const file of files) {
                      const path = await uploadFile(file, "products");
                      if (path) setForm(prev => ({ ...prev, images: [...prev.images.filter(Boolean), path] }));
                    }
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    style={{ display: "none" }}
                    onChange={async (e) => {
                      const files = Array.from(e.target.files || []);
                      for (const file of files) {
                        const path = await uploadFile(file, "products");
                        if (path) setForm(prev => ({ ...prev, images: [...prev.images.filter(Boolean), path] }));
                      }
                      e.target.value = "";
                    }}
                  />
                  {uploading ? "⏳ Upload en cours..." : "📸 Cliquez ou glissez des images ici"}
                </label>
              </div>

              {/* Stock toggle */}
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setForm({ ...form, inStock: !form.inStock })}
                  style={{
                    width: 44,
                    height: 24,
                    borderRadius: 12,
                    border: "none",
                    background: form.inStock ? "#16a34a" : "#e0e0e0",
                    position: "relative",
                    cursor: "pointer",
                    transition: "background 0.2s",
                  }}
                >
                  <div style={{
                    width: 18,
                    height: 18,
                    borderRadius: 9,
                    background: "#fff",
                    position: "absolute",
                    top: 3,
                    left: form.inStock ? 23 : 3,
                    transition: "left 0.2s",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.15)",
                  }} />
                </button>
                <span style={{ fontSize: 14, color: "#444" }}>{form.inStock ? "En stock" : "Épuisé"}</span>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 8 }}>
                <button onClick={() => { setShowForm(false); setEditing(null); }} style={{ ...s.btn, flex: 1, background: "#f5f5f5", color: "#333" }}>Annuler</button>
                <button onClick={handleSave} style={{ ...s.btn, flex: 1, background: "#111", color: "#fff" }}>Enregistrer</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
