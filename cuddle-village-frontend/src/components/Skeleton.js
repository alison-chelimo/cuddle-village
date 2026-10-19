import React from "react";

const shimmerStyle = `
  @keyframes shimmer {
    0%   { background-position: -600px 0; }
    100% { background-position: 600px 0; }
  }
  .skeleton-shimmer {
    background: linear-gradient(90deg, #f0eeff 25%, #e8e4f8 50%, #f0eeff 75%);
    background-size: 600px 100%;
    animation: shimmer 1.4s infinite linear;
    border-radius: 8px;
    display: inline-block;
  }
`;

export default function Skeleton({ width = "100%", height = 16, borderRadius = 8, style = {} }) {
  return (
    <>
      <style>{shimmerStyle}</style>
      <span
        className="skeleton-shimmer"
        style={{ width, height, borderRadius, display: "block", ...style }}
      />
    </>
  );
}

export function SkeletonRow({ cols = 5 }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} style={{ padding: "14px 20px", borderBottom: "1px solid #f5f3ff" }}>
          <Skeleton height={14} width={i === 0 ? "60%" : "80%"} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 6, cols = 5 }) {
  return (
    <>
      {Array.from({ length: rows }).map((_, i) => (
        <SkeletonRow key={i} cols={cols} />
      ))}
    </>
  );
}

export function SkeletonCard({ height = 100 }) {
  return (
    <div style={{ background: "#fff", borderRadius: 16, padding: 20, border: "1.5px solid #f0eeff" }}>
      <Skeleton height={height} borderRadius={12} />
    </div>
  );
}
