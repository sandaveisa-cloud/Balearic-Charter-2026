# RLS Diagnostics & Fix Guide

## 🔍 Problēma: Admin panelī neielādējas inquiries

### Novērotā problēma:
- `booking_inquiries` tabulā IR dati (2 ieraksti redzami Supabase Table Editor)
- Bet admin panelī tie neielādējas
- Parādās "Safety timeout" pēc 5 sekundēm

### Iespējamie cēloņi:

1. **RLS politikas problēma** ⚠️ (Visticamākais)
   - `booking_inquiries` tabulai ir RLS ieslēgts (nav marķēta kā UNRESTRICTED)
   - Bet politikas var būt nepareizas vai trūkstošas
   - Autentificētajam lietotājam var nebūt SELECT piekļuves

2. **Sesijas problēma**
   - Client-side Supabase klients var nebūt pareizi konfigurēts ar sesiju
   - `auth.uid()` var būt NULL pat autentificētam lietotājam

3. **Environment variables**
   - ✅ Pārbaudīts: `.env.local` sakrīt ar Supabase paneli
   - ✅ NEXT_PUBLIC_SUPABASE_URL: `https://xumqdslkrxkcluekijbv.supabase.co`
   - ✅ NEXT_PUBLIC_SUPABASE_ANON_KEY: sakrīt

## 🔧 Risinājums

### 1. Pārbaudīt RLS status un politikas

Izpildi Supabase SQL Editor:

```sql
-- Pārbaudīt RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename = 'booking_inquiries';

-- Pārbaudīt esošās politikas
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE tablename = 'booking_inquiries'
ORDER BY policyname;

-- Pārbaudīt savu sesiju
SELECT auth.uid(), auth.email();
```

### 2. Izpildīt FIX skriptu

Izpildi `supabase/fix_booking_inquiries_rls.sql` Supabase SQL Editor.

Šis skripts:
- ✅ Notīra vecās politikas
- ✅ Izveido pareizo SELECT politiku autentificētiem lietotājiem
- ✅ Saglabā INSERT politiku publiskajiem lietotājiem

### 3. Pārbaudīt client-side sesiju

AdminDashboard komponente izmanto `@/lib/supabase` (client-side klients).

Pārbaudīt, vai sesija tiek pareizi nodota:

1. Atver browser console
2. Pārbaudīt, vai redzami kļūdu ziņojumi par RLS
3. Pārbaudīt, vai `auth.uid()` nav NULL

### 4. Alternatīvs risinājums: Server-side klients

Ja client-side klients nedarbojas, var izmantot server-side klientu:

- Izveidot API route `/api/admin/inquiries`
- Izmantot server-side Supabase klientu ar sesiju
- AdminDashboard izsauc API route

## 📊 Tabula: RLS Status

| Tabula | RLS Status | Problēma? |
|--------|------------|-----------|
| `booking_inquiries` | ✅ RLS ON | ⚠️ **PROBLĒMA** - Politikas var būt nepareizas |
| `fleet` | ✅ RLS ON | ✅ OK - Ir publikas read politikas |
| `crew` | ✅ RLS ON | ✅ OK - Ir publikas read politikas |
| `culinary_experiences` | ❌ RLS OFF (UNRESTRICTED) | ✅ OK - Nav nepieciešams |
| `destinations` | ❌ RLS OFF (UNRESTRICTED) | ✅ OK - Nav nepieciešams |
| `media_assets` | ❌ RLS OFF (UNRESTRICTED) | ✅ OK - Nav nepieciešams |
| `reviews` | ❌ RLS OFF (UNRESTRICTED) | ✅ OK - Nav nepieciešams |
| `stats` | ❌ RLS OFF (UNRESTRICTED) | ✅ OK - Nav nepieciešams |

## ✅ Pēc FIX skripta izpildes

1. Restartē Next.js dev serveri
2. Ielogojies admin panelī
3. Pārbaudīt, vai inquiries ielādējas
4. Pārbaudīt browser console, vai nav RLS kļūdu

## 🐛 Debugging Tips

Ja problēma joprojām pastāv:

1. **Pārbaudīt Supabase logs:**
   - Supabase Dashboard → Logs → Postgres Logs
   - Meklēt "permission denied" vai "RLS" kļūdas

2. **Pārbaudīt browser console:**
   - F12 → Console
   - Meklēt kļūdas ar "RLS", "permission", "PGRST116"

3. **Testēt tieši Supabase:**
   ```sql
   -- Kā autentificēts lietotājs
   SELECT * FROM booking_inquiries;
   -- Ja šis nedarbojas, problēma ir RLS politikās
   ```

4. **Pārbaudīt sesiju:**
   ```sql
   SELECT auth.uid(), auth.email();
   -- Ja NULL, sesija nav pareizi nodota
   ```
