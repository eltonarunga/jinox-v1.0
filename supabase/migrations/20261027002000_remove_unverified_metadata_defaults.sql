-- Do not auto-attribute new public-health data to an unverified source or licence.
alter table public.counties alter column referral_rate drop default;
alter table public.counties alter column source drop default;
alter table public.dataset_snapshots alter column license drop default;
