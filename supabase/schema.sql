-- Patika · sosyal katman · 1. adım: profiller
-- Supabase panelinde: SQL Editor → bu dosyanın tamamını yapıştır → Run.
-- Tekrar çalıştırılabilir (varsa atlar ya da günceller).

-- ---------- profiller ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  takma_ad    text not null check (char_length(btrim(takma_ad)) between 2 and 24),
  durum       text check (durum is null or char_length(durum) <= 80),
  ulke        text check (ulke is null or ulke in ('tr','it','gr')),
  sehir_id    text check (sehir_id is null or sehir_id ~ '^[a-z0-9-]{1,40}$'),
  gun         smallint check (gun is null or gun between 1 and 30),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
-- takma ad büyük/küçük harf ve baş/son boşluk farkı gözetmeden tekil
create unique index if not exists profiles_takma_ad_tekil on public.profiles (lower(btrim(takma_ad)));

alter table public.profiles enable row level security;

-- Herkes profilleri görebilir (e-posta burada YOK; auth.users'ta kalır).
drop policy if exists "profiller herkese acik" on public.profiles;
create policy "profiller herkese acik" on public.profiles
  for select using (true);

-- Sadece kendi profilini, kalıcı (anonim olmayan) hesapla ekleyebilirsin.
drop policy if exists "kendi profilini ekle" on public.profiles;
create policy "kendi profilini ekle" on public.profiles
  for insert to authenticated
  with check (auth.uid() = id and coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) = false);

-- Sadece kendi profilini güncelleyebilirsin.
drop policy if exists "kendi profilini guncelle" on public.profiles;
create policy "kendi profilini guncelle" on public.profiles
  for update to authenticated
  using (auth.uid() = id) with check (auth.uid() = id);

-- Yetkiler: değiştirilebilir sütunlar sınırlı (id ve tarihler elle değiştirilemez).
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to anon, authenticated;
grant insert (id, takma_ad, durum, ulke, sehir_id, gun) on public.profiles to authenticated;
grant update (takma_ad, durum, ulke, sehir_id, gun) on public.profiles to authenticated;

-- updated_at otomatik
create or replace function public.profil_zaman_damgasi() returns trigger
language plpgsql set search_path = '' as $$
begin
  new.updated_at := now();
  return new;
end $$;
drop trigger if exists profiles_zaman on public.profiles;
create trigger profiles_zaman before update on public.profiles
  for each row execute function public.profil_zaman_damgasi();

-- ---------- hesabı silme ----------
-- Kullanıcı kendi hesabını siler; profili (ve ileride paylaşımları) "on delete cascade" ile gider.
create or replace function public.hesabimi_sil() returns void
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null then
    raise exception 'giris gerekli';
  end if;
  delete from auth.users where id = auth.uid();
end $$;
revoke all on function public.hesabimi_sil() from public, anon;
grant execute on function public.hesabimi_sil() to authenticated;
