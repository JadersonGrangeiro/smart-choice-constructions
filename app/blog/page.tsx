"use client";
import Link from "next/link";
import { BLOG_POSTS } from "@/lib/data";
import { useState } from "react";

const cats = ["All","Roofing","Kitchen","Bathroom","HVAC","Electrical","Landscaping"];

export default function BlogPage() {
  const [active, setActive] = useState("All");
  const posts = active === "All" ? BLOG_POSTS : BLOG_POSTS.filter(p => p.category === active);

  return (
    <div style={{ paddingTop: "76px" }}>
      <div style={{ background: "var(--navy)", padding: "4rem 0 3rem" }}>
        <div className="container">
          <h1 className="heading-lg" style={{ color: "white", marginBottom: "1rem" }}>Home Improvement Insights</h1>
          <p style={{ color: "rgba(255,255,255,0.65)", fontSize: "1.0625rem", maxWidth: "500px" }}>
            Practical advice from our network of professional contractors.
          </p>
        </div>
      </div>

      <div className="container" style={{ padding: "3rem 1.5rem" }}>
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", marginBottom: "2.5rem" }}>
          {cats.map(cat => (
            <button key={cat} onClick={() => setActive(cat)} style={{
              padding: "0.5rem 1.125rem", borderRadius: "999px",
              background: active === cat ? "var(--navy)" : "white",
              color: active === cat ? "white" : "var(--gray-600)",
              border: active === cat ? "none" : "1.5px solid var(--gray-200)",
              fontWeight: 600, fontSize: "0.875rem", cursor: "pointer", fontFamily: "inherit",
            }}>{cat}</button>
          ))}
        </div>

        {/* Featured */}
        {posts[0] && (
          <div className="card" style={{ overflow: "hidden", marginBottom: "2rem" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr" }} className="blog-feat-grid">
              <div style={{ background: "linear-gradient(155deg, var(--navy), #2a3d8f)", minHeight: "240px", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem" }}>
                <span style={{ fontSize: "5rem" }}>{posts[0].category === "Roofing" ? "🏠" : posts[0].category === "Kitchen" ? "🍳" : posts[0].category === "Bathroom" ? "🛁" : posts[0].category === "HVAC" ? "❄️" : "🔨"}</span>
              </div>
              <div style={{ padding: "2.5rem" }}>
                <span className="badge badge-blue" style={{ marginBottom: "1rem" }}>{posts[0].category}</span>
                <h2 style={{ fontWeight: 800, fontSize: "1.375rem", color: "var(--navy)", marginBottom: "1rem", lineHeight: 1.3 }}>
                  <Link href={`/blog/${posts[0].slug}`} style={{ textDecoration: "none", color: "inherit" }}>{posts[0].title}</Link>
                </h2>
                <p style={{ color: "var(--gray-600)", lineHeight: 1.75, marginBottom: "1.5rem" }}>{posts[0].excerpt}</p>
                <div style={{ display: "flex", alignItems: "center", gap: "1rem", fontSize: "0.875rem", color: "var(--gray-400)" }}>
                  <span>{posts[0].author}</span><span>·</span>
                  <span>{posts[0].date}</span><span>·</span>
                  <span>{posts[0].readTime}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: "1.5rem" }}>
          {posts.slice(1).map(post => (
            <div key={post.id} className="card" style={{ overflow: "hidden" }}>
              <div style={{ background: "linear-gradient(155deg, var(--navy), #2a3d8f)", height: "150px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>
                {post.category === "Kitchen" ? "🍳" : post.category === "Bathroom" ? "🛁" : post.category === "HVAC" ? "❄️" : "🏠"}
              </div>
              <div style={{ padding: "1.5rem" }}>
                <span className="badge badge-blue" style={{ marginBottom: "0.875rem", fontSize: "0.75rem" }}>{post.category}</span>
                <h3 style={{ fontWeight: 700, fontSize: "1rem", color: "var(--navy)", marginBottom: "0.75rem", lineHeight: 1.35 }}>
                  <Link href={`/blog/${post.slug}`} style={{ textDecoration: "none", color: "inherit" }}>{post.title}</Link>
                </h3>
                <p style={{ color: "var(--gray-500)", fontSize: "0.875rem", lineHeight: 1.65, marginBottom: "1.25rem" }}>{post.excerpt}</p>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.8125rem", color: "var(--gray-400)" }}>
                  <span>{post.author}</span><span>{post.readTime}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <style>{`@media(max-width:640px){.blog-feat-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  );
}
