"use client";

import { FormEvent, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

type Profile = { id: string; email: string | null; display_name: string; institution: string; country: string; role: "member" | "researcher" | "clinician" | "admin" };
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = url && key ? createBrowserClient(url, key) : null;
const inputClass = "mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm outline-none focus:border-black focus:ring-4 focus:ring-slate-900/10";

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  useEffect(() => {
    let active = true;
    async function load() {
      try {
        if (!supabase) throw new Error("Supabase is not configured.");
        const { data: auth, error: authError } = await supabase.auth.getUser();
        if (authError || !auth.user) throw new Error("Please sign in first.");
        const { data, error: queryError } = await supabase.from("profiles").select("id,email,display_name,institution,country,role").eq("id", auth.user.id).single();
        if (queryError) throw queryError;
        if (active) setProfile(data as Profile);
      } catch (e) { if (active) setError(e instanceof Error ? e.message : "Could not load profile."); }
      finally { if (active) setLoading(false); }
    }
    void load();
    return () => { active = false; };
  }, []);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!supabase || !profile) return;
    setSaving(true); setError(""); setNotice("");
    const form = new FormData(event.currentTarget);
    const { data, error: updateError } = await supabase.from("profiles").update({
      display_name: String(form.get("display_name") ?? "").trim(),
      institution: String(form.get("institution") ?? "").trim(),
      country: String(form.get("country") ?? "Kenya").trim(),
    }).eq("id", profile.id).select("id,email,display_name,institution,country,role").single();
    if (updateError) setError(updateError.message);
    else { setProfile(data as Profile); setNotice("Profile saved."); }
    setSaving(false);
  }

  return <main className="min-h-screen bg-[#f7f7f7] px-4 py-8 text-slate-900 sm:px-8"><div className="mx-auto max-w-3xl">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-6"><div><Link href="/" className="text-sm font-bold">JinoX AI</Link><h1 className="mt-3 text-3xl font-semibold tracking-tight">My profile</h1><p className="mt-2 text-sm text-slate-500">Manage your account details and review your assigned access level.</p></div><div className="flex gap-2"><Link href="/projects" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold">Workspace</Link><Link href="/admin" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold">Admin</Link></div></header>
    {loading ? <p className="mt-8 text-sm text-slate-500">Loading profile…</p> : profile && <form onSubmit={save} className="mt-7 space-y-5 rounded-2xl border border-slate-200 bg-white p-6"><div><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Signed-in account</p><p className="mt-2 font-medium">{profile.email ?? profile.id}</p></div><div><label className="text-sm font-medium" htmlFor="display_name">Display name</label><input id="display_name" name="display_name" required maxLength={120} defaultValue={profile.display_name} className={inputClass}/></div><div><label className="text-sm font-medium" htmlFor="institution">Institution / organization</label><input id="institution" name="institution" maxLength={160} defaultValue={profile.institution} className={inputClass}/></div><div><label className="text-sm font-medium" htmlFor="country">Country</label><input id="country" name="country" required maxLength={100} defaultValue={profile.country} className={inputClass}/></div><div className="rounded-xl border border-slate-200 bg-slate-50 p-4"><p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Assigned access level</p><p className="mt-2 font-semibold capitalize">{profile.role}</p><p className="mt-1 text-xs leading-5 text-slate-500">Only an administrator can change this level. Clinician access is not a verification of professional registration.</p></div>
    {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm text-red-800">{error}</p>}{notice && <p role="status" className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-800">{notice}</p>}<button disabled={saving} className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Save profile"}</button></form>}
    {!loading && !profile && error && <p role="alert" className="mt-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
    <p className="mt-5 text-xs leading-5 text-slate-400">Your profile does not contain clinical records. Clinical data remains subject to separate research governance and database access policies.</p>
  </div></main>;
}
