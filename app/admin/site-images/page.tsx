"use client";
import { useState, useEffect, useRef } from "react";

const DEFAULTS: Record<string, string> = {
  homepage_hero: "https://images.unsplash.com/photo-1599427303058-f04cbcf4756f?w=900&q=80",
  homepage_contractor_avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=88&h=88&fit=crop&q=80",
  og_image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80",
  supplier_default_cover: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=1200&q=80",
  blog_default_image: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80",
};

const FIELDS = [
  { key: "homepage_hero", label: "Homepage Hero Photo", desc: "Large photo on the right side of the hero section", ratio: "16:9" },
  { key: "homepage_contractor_avatar", label: "Homepage Contractor Avatar", desc: "Small contractor profile photo in the floating card on the homepage", ratio: "1:1" },
  { key: "og_image", label: "OG / Social Share Image", desc: "Shown when sharing on Facebook, Twitter, LinkedIn, etc. (recommended 1200×630)", ratio: "1.91:1" },
  { key: "supplier_default_cover", label: "Default Supplier Cover", desc: "Fallback cover photo for supplier profiles that have no custom photo", ratio: "16:9" },
  { key: "blog_default_image", label: "Default Blog Image", desc: "Fallback hero image for blog posts with no image set", ratio: "16:9" },
];

function Toast({ msg, ok }: { msg: string; ok: boolean }) {
  return (
    <div style={{ position: "fixed", bottom: "1.5rem", right: "1.5rem", zIndex: 9999,
      background: ok ? "#16a34a" : "var(--red)", color: "white",
      padding: "0.875rem 1.5rem", borderRadius: "var(--radius)", fontWeight: 600,
      fontSize: "0.9rem", boxShadow: "var(--shadow-lg)" }}>
      {msg}
    </div>
  );
}

export default function SiteImagesPage() {
  const [images, setImages] = useState<Record<string, string>>(DEFAULTS);
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  function showToast(msg: string, ok = true) {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  }

  useEffect(() => {
    fetch("/api/admin/platform-data?key=site_images")
      .then(r => r.json())
      .then(({ value }) => {
        if (value && typeof value === "object") {
          setImages(prev => ({ ...prev, ...value }));
        }
      })
      .catch(() => {});
  }, []);

  async function handleUpload(fieldKey: string, file: File) {
    setUploading(prev => ({ ...prev, [fieldKey]: true }));
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bucket", "site-images");
      fd.append("folder", fieldKey);
      const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
      if (!res.ok) throw new Error(await res.text());
      const { url } = await res.json();
      setImages(prev => ({ ...prev, [fieldKey]: url }));
    } catch (e: unknown) {
      showToast("Upload failed: " + (e instanceof Error ? e.message : String(e)), false);
    } finally {
      setUploading(prev => ({ ...prev, [fieldKey]: false }));
    }
  }

  async function saveAll() {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/platform-data", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: "site_images", value: images }),
      });
      if (!res.ok) throw new Error(await res.text());
      showToast("All site images saved!");
    } catch (e: unknown) {
      showToast("Save failed: " + (e instanceof Error ? e.message : String(e)), false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: "860px" }}>
      {toast && <Toast msg={toast.msg} ok={toast.ok} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "2rem" }}>
        <div>
          <h1 style={{ fontSize: "1.625rem", fontWeight: 800, color: "var(--navy)" }}>Site Images</h1>
          <p style={{ color: "var(--gray-500)", marginTop: "0.25rem", fontSize: "0.9rem" }}>
            Control the photos that appear throughout the site. Upload files or paste URLs.
          </p>
        </div>
        <button
          onClick={saveAll}
          disabled={saving}
          style={{ background: "var(--navy)", color: "white", border: "none", borderRadius: "var(--radius)",
            padding: "0.75rem 1.75rem", fontWeight: 700, cursor: saving ? "not-allowed" : "pointer",
            opacity: saving ? 0.7 : 1, fontSize: "0.9375rem" }}>
          {saving ? "Saving…" : "Save All Changes"}
        </button>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        {FIELDS.map(field => {
          const url = images[field.key] || "";
          const isUploading = uploading[field.key] ?? false;

          return (
            <div key={field.key} style={{ background: "white", border: "1px solid var(--gray-150)",
              borderRadius: "var(--radius-lg)", padding: "1.5rem", boxShadow: "var(--shadow-sm)" }}>
              <div style={{ display: "flex", gap: "1.5rem", alignItems: "flex-start" }}>
                {/* Preview */}
                <div style={{
                  width: field.key === "homepage_contractor_avatar" ? "80px" : "200px",
                  height: field.key === "homepage_contractor_avatar" ? "80px" : "112px",
                  borderRadius: field.key === "homepage_contractor_avatar" ? "50%" : "var(--radius)",
                  overflow: "hidden", flexShrink: 0, background: "var(--gray-100)",
                  border: "2px solid var(--gray-150)"
                }}>
                  {url ? (
                    <img src={url} alt={field.label}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center",
                      justifyContent: "center", color: "var(--gray-400)", fontSize: "1.5rem" }}>🖼️</div>
                  )}
                </div>

                {/* Controls */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: "1rem", color: "var(--navy)", marginBottom: "0.25rem" }}>
                    {field.label}
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--gray-500)", marginBottom: "1rem" }}>
                    {field.desc} · Ratio {field.ratio}
                  </div>

                  <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <input
                      type="text"
                      value={url}
                      onChange={e => setImages(prev => ({ ...prev, [field.key]: e.target.value }))}
                      placeholder="https://… or upload a file"
                      style={{ flex: 1, padding: "0.5rem 0.75rem", border: "1px solid var(--gray-200)",
                        borderRadius: "var(--radius-sm)", fontSize: "0.8125rem", fontFamily: "monospace",
                        color: "var(--gray-700)" }}
                    />
                    <button
                      onClick={() => fileRefs.current[field.key]?.click()}
                      disabled={isUploading}
                      style={{ background: isUploading ? "var(--gray-300)" : "var(--navy)", color: "white",
                        border: "none", borderRadius: "var(--radius-sm)", padding: "0.5rem 1rem",
                        cursor: isUploading ? "not-allowed" : "pointer", fontSize: "0.8125rem",
                        fontWeight: 600, flexShrink: 0, whiteSpace: "nowrap" }}>
                      {isUploading ? "Uploading…" : "Upload File"}
                    </button>
                    <input
                      ref={el => { fileRefs.current[field.key] = el; }}
                      type="file"
                      accept="image/*"
                      style={{ display: "none" }}
                      onChange={e => {
                        const f = e.target.files?.[0];
                        if (f) handleUpload(field.key, f);
                        e.target.value = "";
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: "2rem", padding: "1rem 1.25rem", background: "var(--gray-50)",
        border: "1px solid var(--gray-150)", borderRadius: "var(--radius)", fontSize: "0.8125rem",
        color: "var(--gray-500)" }}>
        <strong style={{ color: "var(--gray-700)" }}>Tip:</strong> After saving, changes appear on the site immediately.
        The OG / social share image may be cached by social networks for up to 24 hours.
      </div>
    </div>
  );
}
