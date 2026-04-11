"use client";

// src/app/auth/confirmed/page.tsx
// Place at: projects/alore-os/src/app/auth/confirmed/page.tsx
//
// Shown after user successfully confirms their email.
// Auto-redirects to /dashboard after 3 seconds.

import { useEffect, useState } from "react";
import { useRouter }           from "next/navigation";

export default function ConfirmedPage() {
  const router  = useRouter();
  const [count, setCount] = useState(3);

  // Countdown then redirect to dashboard
  useEffect(() => {
    if (count === 0) {
      router.push("/dashboard");
      return;
    }
    const timer = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [count, router]);

  return (
    <div className="min-h-screen bg-[#0F0F0D] flex items-center justify-center px-4">
      <div className="w-full max-w-sm text-center">

        {/* Logo */}
        <div className="mb-10">
          <h1 className="text-2xl font-medium text-white tracking-tight">
            RealProfit
          </h1>
          <p className="text-xs text-white/30 mt-1">Real profit. No bullshit.</p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1A18] border border-white/10 rounded-2xl p-8">

          {/* Success icon */}
          <div className="w-14 h-14 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center mx-auto mb-5">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4ade80"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>

          {/* Heading */}
          <h2 className="text-white text-xl font-medium mb-2">
            Email confirmed
          </h2>

          <p className="text-white/40 text-sm mb-6 leading-relaxed">
            Your email address has been verified successfully.
            Your account is now active.
          </p>

          {/* Divider */}
          <div className="border-t border-white/10 mb-6" />

          {/* Redirect countdown */}
          <p className="text-white/30 text-sm mb-4">
            Redirecting to dashboard in{" "}
            <span className="text-white/60 font-medium">{count}</span>
            {" "}second{count !== 1 ? "s" : ""}...
          </p>

          {/* Manual button */}
          <button
            onClick={() => router.push("/dashboard")}
            className="w-full bg-white text-[#0F0F0D] font-medium text-sm py-3 rounded-lg hover:bg-white/90 transition-colors"
          >
            Go to dashboard
          </button>

        </div>

        {/* Footer */}
        <p className="text-center text-white/20 text-xs mt-8">
          © {new Date().getFullYear()} RealProfit
        </p>

      </div>
    </div>
  );
}