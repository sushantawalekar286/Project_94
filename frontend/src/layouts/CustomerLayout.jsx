import React from "react";

export default function CustomerLayout({ children }) {
  return (
    <div className="customer-shell min-h-screen bg-[#FAF9F6] text-neutral-800 font-sans">
      {children}
    </div>
  );
}
