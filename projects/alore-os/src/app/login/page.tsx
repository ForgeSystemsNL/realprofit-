// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";
// import { createClient } from "@/lib/supabase";

// export default function LoginPage() {
//   const router = useRouter();
//   const supabase = createClient();

//   const [mode, setMode] = useState<"login" | "signup">("login");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState<string | null>(null);
//   const [success, setSuccess] = useState<string | null>(null);

//   ///// Handles both login and signup based on the current mode.
//   async function handleSubmit() {
//     // alert("This is a demo. Authentication is disabled.");
//     setLoading(true);
//     setError(null);
//     setSuccess(null);

//     if (mode === "login") {
//       const { error } = await supabase.auth.signInWithPassword({
//         email,
//         password,
//       });

//       if (error) {
//         setError(error.message);
//         setLoading(false);
//         return;
//       }

//       router.push("/dashboard");
//       router.refresh();
//     } else {
//       const { error } = await supabase.auth.signUp({
//         email,
//         password,
//       });

//       if (error) {
//         setError(error.message);
//         setLoading(false);
//         return;
//       }

//       setSuccess("Check your email to confirm your account.");
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="min-h-screen bg-[#0F0F0D] flex items-center justify-center px-4">
//       <div className="w-full max-w-sm">

//         {/* Logo */}
//         <div className="mb-10 text-center">
//           <h1 className="text-2xl font-medium text-white tracking-tight">
//             RealProfit
//           </h1>
//           {/* <p className="text-xs text-white/30 mt-1">Real profit. No bullshit.</p> */}
//         </div>

//         {/* Card */}
//         <div className="bg-[#1A1A18] border border-white/10 rounded-2xl p-8">

//           {/* Heading */}
//           <h2 className="text-white text-lg font-medium mb-1">
//             {mode === "login" ? "Welcome back" : "Create account"}
//           </h2>
//           <p className="text-white/40 text-sm mb-7">
//             {mode === "login"
//               ? "Log in to your dashboard"
//               : "Start your free account"}
//           </p>

//           {/* Email */}
//           <div className="mb-4">
//             <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
//               Email
//             </label>
//             <input
//               type="email"
//               value={email}
//               onChange={(e) => setEmail(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//               placeholder="you@yourbrand.com"
//               className="w-full bg-[#0F0F0D] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
//             />
//           </div>

//           {/* Password */}
//           <div className="mb-6">
//             <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
//               Password
//             </label>
//             <input
//               type="password"
//               value={password}
//               onChange={(e) => setPassword(e.target.value)}
//               onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
//               placeholder="••••••••"
//               className="w-full bg-[#0F0F0D] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
//             />
//           </div>

//           {/* Error */}
//           {error && (
//             <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
//               {error}
//             </div>
//           )}

//           {/* Success */}
//           {success && (
//             <div className="mb-5 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
//               {success}
//             </div>
//           )}

//           {/* Submit button */}
//           <button
//             onClick={handleSubmit}
//             disabled={loading || !email || !password}
//             className="w-full bg-white text-[#0F0F0D] font-medium text-sm py-3 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
//           >
//             {loading
//               ? "..."
//               : mode === "login"
//               ? "Log in"
//               : "Create account"}
//           </button>

//           {/* Toggle mode */}
//           <p className="text-center text-white/30 text-sm mt-6">
//             {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
//             <button
//               onClick={() => {
//                 setMode(mode === "login" ? "signup" : "login");
//                 setError(null);
//                 setSuccess(null);
//               }}
//               className="text-white/70 hover:text-white underline underline-offset-2 transition-colors"
//             >
//               {mode === "login" ? "Sign up" : "Log in"}
//             </button>
//           </p>
//         </div>

//         {/* Footer */}
//         <p className="text-center text-white/20 text-xs mt-8">
//           © {new Date().getFullYear()} RealProfit — Built for ecommerce operators
//         </p>

//       </div>
//     </div>
//   );
// }





"use client";

// src/app/login/page.tsx
// Place at: projects/alore-os/src/app/login/page.tsx
//
// Updated to handle ?error=confirmation_failed from the confirm route

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();

  const [mode, setMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Show error if redirected from failed confirmation
  useEffect(() => {
    if (searchParams.get("error") === "confirmation_failed") {
      setError("Confirmation link is invalid or has expired. Please sign up again.");
    }
  }, [searchParams]);

  async function handleSubmit() {
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "login") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      router.push("/dashboard");
      router.refresh();

    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }
      setSuccess("Check your email and click the confirmation link to activate your account.");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#0F0F0D] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo */}
        <div className="mb-10 text-center">
          <h1 className="text-2xl font-medium text-white tracking-tight">
            RealProfit
          </h1>
          <p className="text-xs text-white/30 mt-1">Real profit. No bullshit.</p>
        </div>

        {/* Card */}
        <div className="bg-[#1A1A18] border border-white/10 rounded-2xl p-8">

          <h2 className="text-white text-lg font-medium mb-1">
            {mode === "login" ? "Welcome back" : "Create account"}
          </h2>
          <p className="text-white/40 text-sm mb-7">
            {mode === "login" ? "Log in to your dashboard" : "Start your free account"}
          </p>

          {/* Email */}
          <div className="mb-4">
            <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="you@yourbrand.com"
              className="w-full bg-[#0F0F0D] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="block text-xs text-white/50 mb-1.5 font-medium uppercase tracking-wide">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
              placeholder="••••••••"
              className="w-full bg-[#0F0F0D] border border-white/10 rounded-lg px-4 py-3 text-sm text-white placeholder-white/20 focus:outline-none focus:border-white/30 transition-colors"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Success */}
          {success && (
            <div className="mb-5 px-4 py-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-sm">
              {success}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !email || !password}
            className="w-full bg-white text-[#0F0F0D] font-medium text-sm py-3 rounded-lg hover:bg-white/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? "..." : mode === "login" ? "Log in" : "Create account"}
          </button>

          {/* Toggle */}
          <p className="text-center text-white/30 text-sm mt-6">
            {mode === "login" ? "No account yet?" : "Already have an account?"}{" "}
            <button
              onClick={() => { setMode(mode === "login" ? "signup" : "login"); setError(null); setSuccess(null); }}
              className="text-white/70 hover:text-white underline underline-offset-2 transition-colors"
            >
              {mode === "login" ? "Sign up" : "Log in"}
            </button>
          </p>
        </div>

        <p className="text-center text-white/20 text-xs mt-8">
          © {new Date().getFullYear()} RealProfit
        </p>
      </div>
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0F0F0D] flex items-center justify-center">
        <p className="text-white/30 text-sm">Loading...</p>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}