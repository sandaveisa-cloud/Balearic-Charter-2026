# Supabase Database Setup Instructions

## 📋 Kā izveidot tabulas Supabase

### 1. solis: Atveriet Supabase Dashboard

1. Ejiet uz: https://supabase.com/dashboard
2. Piesakieties savā kontā
3. Izvēlieties savu projektu (vai izveidojiet jaunu)

### 2. solis: Atveriet SQL Editor

1. Kreisajā izvēlnē noklikšķiniet uz **"SQL Editor"**
2. Noklikšķiniet uz **"New query"** vai **"+"** pogas

### 3. solis: Kopējiet un izpildiet SQL skriptu

1. Atveriet failu: `supabase/complete_schema.sql`
2. **Kopējiet VISU saturu** (Ctrl+A, Ctrl+C)
3. Ielīmējiet SQL Editor (Ctrl+V)
4. Noklikšķiniet uz **"Run"** vai nospiediet **Ctrl+Enter**

### 4. solis: Pārbaudiet rezultātu

Pēc izpildes jūs redzēsiet:
- ✅ "Success. No rows returned" - viss ir kārtībā
- ❌ Ja ir kļūdas, pārbaudiet ziņojumus

### 5. solis: Pārbaudiet, vai tabulas ir izveidotas

1. Kreisajā izvēlnē noklikšķiniet uz **"Table Editor"**
2. Jums vajadzētu redzēt šādas tabulas:
   - ✅ `site_settings`
   - ✅ `fleet`
   - ✅ `destinations`
   - ✅ `reviews`
   - ✅ `stats`
   - ✅ `culinary_experiences`
   - ✅ `crew`
   - ✅ `booking_inquiries`
   - ✅ `media_assets`
   - ✅ `booking_availability`

## 🔍 Kas tiek izveidots?

### Pamat tabulas:
- **site_settings** - Vietnes iestatījumi (hero, kontakti, utt.)
- **fleet** - Jachtu flote ar tehniskajiem specifikācijām
- **destinations** - Destinācijas (Ibiza, Mallorca, utt.)
- **reviews** - Viesu atsauksmes
- **stats** - Statistika (gadi, viesi, utt.)
- **culinary_experiences** - Kulināriskās pieredzes
- **crew** - Komandas dalībnieki
- **booking_inquiries** - Rezervāciju pieprasījumi
- **media_assets** - Multivides faili
- **booking_availability** - Pieejamības kalendārs

### Papildu funkcijas:
- ✅ Indexes - ātrākai datu meklēšanai
- ✅ Triggers - automātiska `updated_at` atjaunināšana
- ✅ Sample data - testa dati jachtām, destinācijām, utt.

## ⚠️ Svarīgi!

- **Neizdzēsiet** `complete_schema.sql` failu - tas var būt noderīgs nākotnē
- Ja jau ir dati datubāzē, skripts **neizdzēs** tos (izmantots `IF NOT EXISTS`)
- Sample data tiks pievienots tikai, ja tā vēl nav (`ON CONFLICT DO NOTHING`)

## 🐛 Problēmu novēršana

### Kļūda: "relation already exists"
- **Risinājums**: Tas ir normāli! Skripts izmanto `IF NOT EXISTS`, tāpēc var droši palaist vairākas reizes.

### Kļūda: "permission denied"
- **Risinājums**: Pārliecinieties, ka izmantojat **SQL Editor**, nevis **Table Editor**

### Kļūda: "syntax error"
- **Risinājums**: Pārbaudiet, vai kopējāt **VISU** faila saturu, ieskaitot komentārus

## ✅ Pēc izpildes

1. Atjaunojiet lapu pārlūkprogrammā
2. Admin panelī vairs nevajadzētu būt 404 kļūdām
3. Varat sākt pievienot savu saturu caur admin paneli

## 📞 Papildu palīdzība

Ja rodas problēmas:
1. Pārbaudiet Supabase dokumentāciju: https://supabase.com/docs
2. Pārbaudiet SQL Editor kļūdu ziņojumus
3. Pārliecinieties, ka izmantojat pareizo projektu
