"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";

interface UserProfile {
    email: string;
    fullName: string;
    initials: string;
    role: string;
}

export default function UserMenu() {
    const router = useRouter();
    const supabase = createClient();
    const menuRef = useRef<HTMLDivElement>(null);

    const [open, setOpen] = useState(false);
    const [profile, setProfile] = useState<UserProfile>({
        email: "",
        fullName: "",
        initials: "?",
        role: "Admin",
    });

    ///// Load user profile on mount
    useEffect(() => {
        async function loadUser() {
            const {
                data: { user },
            } = await supabase.auth.getUser();

            if (!user) return;

            // Try to get full name from user_metadata (set during signup if provided)
            // Falls back to email prefix if no name is stored
            const rawName =
                user.user_metadata?.full_name ||
                user.user_metadata?.name ||
                user.email?.split("@")[0] ||
                "User";

            // Build initials from name (e.g. "Joey van de Kerkhof" → "JK")
            const words = rawName.trim().split(" ").filter(Boolean);
            const initials =
                words.length >= 2
                    ? (words[0][0] + words[words.length - 1][0]).toUpperCase()
                    : rawName.slice(0, 2).toUpperCase();

            setProfile({
                email: user.email ?? "",
                fullName: rawName,
                initials,
                role: user.user_metadata?.role ?? "Admin",
            });
        }

        loadUser();
    }, []);

    ///// Close menu when clicking outside
    useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [open]);

    ///// Logout
    async function handleLogout() {
        await supabase.auth.signOut();
        router.push("/login");
        router.refresh();
    }

    return (
        <div className="relative" ref={menuRef}>

            {/* ── Account row — click to toggle popup ── */}
            <button
                onClick={() => setOpen((prev) => !prev)}
                className="w-full flex items-center gap-3 px-5 py-4 border-t border-white/10 hover:bg-white/5 transition-colors cursor-pointer group"
            >
                {/* Avatar */}
                <div className="w-8 h-8 rounded-full bg-[#2A2A28] flex items-center justify-center text-white text-xs font-semibold shrink-0 group-hover:bg-white/10 transition-colors">
                    {profile.initials}
                </div>

                {/* Name + role */}
                <div className="min-w-0 flex-1 text-left">
                    <p className="text-[13px] text-white truncate leading-tight">
                        {profile.fullName || "Loading..."}
                    </p>
                    <p className="text-[11px] text-white/40 truncate">{profile.role}</p>
                </div>

                {/* Chevron — rotates when open */}
                <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className={`text-white/30 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""
                        }`}
                >
                    <polyline points="18 15 12 9 6 15" />
                </svg>
            </button>

            {/* ── Popup menu ── */}
            {open && (
                <div className="absolute bottom-full left-3 right-3 mb-1 bg-[#1A1A18] border border-white/10 rounded-xl shadow-2xl overflow-hidden z-50">

                    {/* User info header inside popup */}
                    <div className="px-4 py-3 border-b border-white/10">
                        <p className="text-xs text-white font-medium truncate">
                            {profile.fullName}
                        </p>
                        <p className="text-[11px] text-white/40 truncate mt-0.5">
                            {profile.email}
                        </p>
                    </div>

                    {/* Menu items */}
                    <div className="p-1.5">

                        {/* Profile settings — placeholder for later */}
                        <button
                            disabled
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-white/30 cursor-not-allowed"
                        >
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <circle cx="12" cy="8" r="4" />
                                <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
                            </svg>
                            Profile settings
                            <span className="ml-auto text-[10px] text-white/20">Soon</span>
                        </button>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors"
                        >
                            <svg
                                width="15"
                                height="15"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                            >
                                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                                <polyline points="16 17 21 12 16 7" />
                                <line x1="21" y1="12" x2="9" y2="12" />
                            </svg>
                            Log out
                        </button>

                    </div>
                </div>
            )}
        </div>
    );
}