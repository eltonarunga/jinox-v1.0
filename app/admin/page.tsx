"use client";

import { useCallback, useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import Link from "next/link";

type Role = "member" | "researcher" | "clinician" | "admin";
type Profile = { id: string; email: string | null; display_name: string; institution: string; country: string; role: Role; created_at: string };

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = url && key ? createBrowserClient(url, key) : null;
const roles: Role[] = ["member", "researcher", "clinician", "admin"];

export default function AdminDashboardPage() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      if (!supabase) throw new Error("Supabase is not configured.");
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError || !auth.user) throw new Error("Please sign in to access the admin dashboard.");
      const { data: own, error: ownError } = await supabase.from("profiles").select("role").eq("id", auth.user.id).single();
      if (ownError) throw new Error(ownError.message.includes("schema cache") ? "Profiles table is missing from the Supabase schema cache. Apply the new profiles migration, then refresh the API schema cache." : ownError.message);
      const role = own.role as Role;
      setCurrentRole(role);
      if (role !== "admin") { setProfiles([]); return; }
      const { data, error: listError } = await supabase.from("profiles").select("id,email,display_name,institution,country,role,created_at").order("created_at", { ascending: false });
      if (listError) throw listError;
      setProfiles((data ?? []) as Profile[]);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unable to load admin dashboard.");
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { void load(); }, [load]);

  async function changeRole(profile: Profile, role: Role) {
    if (!supabase || profile.role === role) return;
    const confirmed = window.confirm(`Change ${profile.email ?? profile.id}'s access level from ${profile.role} to ${role}?`);
    if (!confirmed) return;
    setSavingId(profile.id); setError(""); setNotice("");
    const { error: updateError } = await supabase.from("profiles").update({ role }).eq("id", profile.id);
    if (updateError) setError(updateError.message);
    else { setNotice("Access level updated."); await load(); }
    setSavingId("");
  }

  if (loading) return <main className="grid min-h-screen place-items-center bg-[#f7f7f7] text-sm text-slate-500">Loading admin dashboard…</main>;

  return <main className="min-h-screen bg-[#f7f7f7] px-4 py-8 text-slate-900 sm:px-8">
    <div className="mx-auto max-w-6xl">
      <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div><Link href="/" className="text-sm font-bold text-slate-950">JinoX AI</Link><p className="mt-2 text-xs font-semibold uppercase tracking-[.16em] text-slate-500">Platform administration</p><h1 className="mt-2 text-3xl font-semibold tracking-tight">Admin dashboard</h1><p className="mt-2 text-sm text-slate-500">Manage user profiles and access levels.</p></div>
        <div className="flex gap-2"><Link href="/profile" className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold">My profile</Link><button onClick={() => void load()} className="rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white">Refresh</button></div>
      </header>

      {error && <p role="alert" className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{error}</p>}
      {notice && <p role="status" className="mt-5 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">{notice}</p>}

      {currentRole !== "admin" && !error ? <section className="mt-8 rounded-2xl border border-amber-200 bg-amber-50 p-6"><h2 className="font-semibold text-amber-950">Administrator access required</h2><p className="mt-2 text-sm leading-6 text-amber-900">Your account does not have the admin role. Access is enforced by Supabase row-level security; changing the page URL does not grant access.</p><Link href="/profile" className="mt-4 inline-flex rounded-xl bg-black px-4 py-2.5 text-sm font-semibold text-white">Open my profile</Link></section> : currentRole === "admin" && <><section className="mt-6 grid gap-3 sm:grid-cols-3">{[{label:"Total users",value:profiles.length},{label:"Researchers",value:profiles.filter(p=>p.role==="researcher").length},{label:"Clinicians",value:profiles.filter(p=>p.role==="clinician").length}].map(card=><div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5"><p className="text-sm text-slate-500">{card.label}</p><p className="mt-3 text-3xl font-semibold tabular-nums">{card.value}</p></div>)}</section>
        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white"><div className="border-b border-slate-100 px-5 py-4"><h2 className="font-semibold">User directory</h2><p className="mt-1 text-sm text-slate-500">Roles determine workspace access; grant elevated roles only after verifying credentials and institutional authorization.</p></div><div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500"><tr><th className="px-5 py-3">User</th><th className="px-5 py-3">Institution</th><th className="px-5 py-3">Country</th><th className="px-5 py-3">Level</th><th className="px-5 py-3">Joined</th></tr></thead><tbody>{profiles.map(profile=><tr key={profile.id} className="border-t border-slate-100"><td className="px-5 py-4"><p className="font-semibold">{profile.display_name || "Unnamed user"}</p><p className="mt-1 text-xs text-slate-500">{profile.email ?? profile.id}</p></td><td className="px-5 py-4 text-slate-600">{profile.institution || "—"}</td><td className="px-5 py-4 text-slate-600">{profile.country || "—"}</td><td className="px-5 py-4"><select aria-label={`Access level for ${profile.email ?? profile.id}`} disabled={savingId===profile.id} value={profile.role} onChange={e=>void changeRole(profile,e.target.value as Role)} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"><option value="member">Member</option><option value="researcher">Researcher</option><option value="clinician">Clinician</option><option value="admin">Admin</option></select></td><td className="px-5 py-4 text-slate-500">{new Date(profile.created_at).toLocaleDateString()}</td></tr>)}</tbody></table></div></section></>}
      <p className="mt-6 text-xs leading-5 text-slate-400">JinoX AI · Access levels are application permissions, not professional credential verification. Admin role assignment is restricted by database policy and trigger.</p>
    </div>
  </main>;
}
