"use client";
import { useState, useEffect, useCallback } from "react";

interface GalleryImage {
  src:     string;
  alt:     string;
  caption?: string;
  label?:  string; // e.g. "Before" | "After"
}

interface LightboxProps {
  images:       GalleryImage[];
  initialIndex?: number;
  onClose:       () => void;
}

export function Lightbox({ images, initialIndex = 0, onClose }: LightboxProps) {
  const [idx, setIdx] = useState(initialIndex);
  const [zoomed, setZoomed] = useState(false);

  const prev = useCallback(() => {
    setIdx(i => (i - 1 + images.length) % images.length);
    setZoomed(false);
  }, [images.length]);

  const next = useCallback(() => {
    setIdx(i => (i + 1) % images.length);
    setZoomed(false);
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape")      onClose();
      if (e.key === "ArrowLeft")   prev();
      if (e.key === "ArrowRight")  next();
    };
    document.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [onClose, prev, next]);

  const current = images[idx];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image viewer"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0,
        background: "rgba(0,0,0,0.92)",
        zIndex: 9999,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "1rem",
      }}
    >
      {/* Main content — stop propagation so clicking image doesn't close */}
      <div onClick={e => e.stopPropagation()} style={{
        position: "relative",
        maxWidth: "min(90vw, 1100px)",
        maxHeight: "90vh",
        display: "flex", flexDirection: "column", alignItems: "center",
      }}>
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close image viewer"
          style={{
            position: "absolute", top: "-48px", right: 0,
            background: "rgba(255,255,255,0.1)", border: "none",
            color: "white", cursor: "pointer",
            width: "40px", height: "40px", borderRadius: "50%",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: "1.25rem", transition: "background 0.15s",
          }}
          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.2)"; }}
          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.1)"; }}
        >
          ✕
        </button>

        {/* Image */}
        <div
          onClick={() => setZoomed(z => !z)}
          style={{
            cursor: zoomed ? "zoom-out" : "zoom-in",
            overflow: "hidden",
            borderRadius: "var(--radius-lg)",
            maxHeight: "80vh",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          {/* Placeholder image using CSS gradient — in production use real <img> */}
          <div style={{
            width: zoomed ? "80vw" : "70vw",
            maxWidth: "900px",
            height: zoomed ? "75vh" : "60vh",
            background: current.src.startsWith("gradient:")
              ? current.src.replace("gradient:", "")
              : `linear-gradient(135deg, var(--navy-dark), var(--navy))`,
            borderRadius: "var(--radius-lg)",
            display: "flex", flexDirection: "column",
            alignItems: "center", justifyContent: "center",
            transition: "all 0.3s ease",
            position: "relative",
          }}>
            <div style={{ fontSize: "4rem", marginBottom: "1rem" }}>🏠</div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: "1.125rem", fontWeight: 600 }}>
              {current.alt}
            </div>
            {current.label && (
              <div style={{
                position: "absolute", top: "1rem", left: "1rem",
                background: current.label === "Before" ? "rgba(200,16,46,0.85)" : "rgba(22,163,74,0.85)",
                color: "white", padding: "0.375rem 0.875rem",
                borderRadius: "999px", fontSize: "0.875rem", fontWeight: 700,
              }}>
                {current.label}
              </div>
            )}
          </div>
        </div>

        {/* Caption */}
        {current.caption && (
          <p style={{
            color: "rgba(255,255,255,0.75)", fontSize: "0.9375rem",
            marginTop: "1rem", textAlign: "center",
          }}>
            {current.caption}
          </p>
        )}

        {/* Counter */}
        <div style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.875rem", marginTop: "0.75rem" }}>
          {idx + 1} / {images.length}
        </div>

        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div style={{
            display: "flex", gap: "0.5rem", marginTop: "1rem",
            overflowX: "auto", padding: "0.25rem",
            maxWidth: "min(90vw, 900px)",
          }}>
            {images.map((img, i) => (
              <button
                key={i}
                onClick={() => { setIdx(i); setZoomed(false); }}
                aria-label={`View image ${i + 1}: ${img.alt}`}
                style={{
                  width: "64px", height: "48px", flexShrink: 0,
                  background: i === idx ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.1)",
                  borderRadius: "6px", border: `2px solid ${i === idx ? "white" : "transparent"}`,
                  cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: "1.25rem", transition: "all 0.15s",
                }}
              >
                🏠
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prev / Next arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={e => { e.stopPropagation(); prev(); }}
            aria-label="Previous image"
            style={{
              position: "fixed", left: "1rem", top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.12)", border: "none", color: "white",
              width: "48px", height: "48px", borderRadius: "50%", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", transition: "background 0.15s", zIndex: 10001,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
          >
            ‹
          </button>
          <button
            onClick={e => { e.stopPropagation(); next(); }}
            aria-label="Next image"
            style={{
              position: "fixed", right: "1rem", top: "50%", transform: "translateY(-50%)",
              background: "rgba(255,255,255,0.12)", border: "none", color: "white",
              width: "48px", height: "48px", borderRadius: "50%", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: "1.5rem", transition: "background 0.15s", zIndex: 10001,
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.25)"; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(255,255,255,0.12)"; }}
          >
            ›
          </button>
        </>
      )}
    </div>
  );
}

/** Gallery grid that opens Lightbox on click */
interface GalleryGridProps {
  images:   GalleryImage[];
  columns?: number;
  title?:   string;
}

export function GalleryGrid({ images, columns = 3, title }: GalleryGridProps) {
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  return (
    <div>
      {title && (
        <h3 style={{ fontWeight: 700, color: "var(--navy)", marginBottom: "1rem", fontSize: "1.0625rem" }}>
          {title}
        </h3>
      )}
      <div style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: "0.625rem",
      }}>
        {images.map((img, i) => (
          <button
            key={i}
            onClick={() => setLightboxIdx(i)}
            aria-label={`View ${img.alt}`}
            style={{
              position: "relative",
              aspectRatio: "4/3",
              background: `linear-gradient(135deg, var(--navy-dark), #1c3875)`,
              borderRadius: "var(--radius-sm)",
              border: "none", cursor: "pointer",
              overflow: "hidden",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "transform 0.2s, box-shadow 0.2s",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.02)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "var(--shadow-md)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
              (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
            }}
          >
            <span style={{ fontSize: "1.75rem" }}>🏠</span>

            {/* Hover overlay */}
            <div className="gallery-overlay" style={{
              position: "absolute", inset: 0,
              background: "rgba(22,46,94,0.0)",
              display: "flex", alignItems: "center", justifyContent: "center",
              transition: "background 0.2s",
            }}>
              <span style={{
                background: "rgba(255,255,255,0.9)", color: "var(--navy)",
                borderRadius: "999px", padding: "0.375rem 0.875rem",
                fontSize: "0.8125rem", fontWeight: 700, opacity: 0,
                transition: "opacity 0.2s",
              }} className="gallery-zoom-label">
                ⊕ View
              </span>
            </div>

            {/* Label (Before/After) */}
            {img.label && (
              <div style={{
                position: "absolute", top: "0.5rem", left: "0.5rem",
                background: img.label === "Before" ? "rgba(200,16,46,0.9)" : "rgba(22,163,74,0.9)",
                color: "white", padding: "0.2rem 0.625rem",
                borderRadius: "999px", fontSize: "0.75rem", fontWeight: 700,
              }}>
                {img.label}
              </div>
            )}
          </button>
        ))}
      </div>

      {lightboxIdx !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIdx}
          onClose={() => setLightboxIdx(null)}
        />
      )}

      <style>{`
        button:hover .gallery-overlay { background: rgba(22,46,94,0.5) !important; }
        button:hover .gallery-zoom-label { opacity: 1 !important; }
      `}</style>
    </div>
  );
}
