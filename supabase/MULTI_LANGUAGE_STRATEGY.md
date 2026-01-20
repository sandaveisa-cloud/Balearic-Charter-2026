# Multi-Language Database Strategy

## Overview
This document outlines the strategy for storing and retrieving multi-language content in the Supabase database.

## Current State

### Fleet Table
- `description`: TEXT (single language)
- `short_description`: TEXT (single language)

### Destinations Table
- Already has multi-language support:
  - `description_en`, `description_es`, `description_de`

## Recommended Approach: JSONB

We recommend using **JSONB** columns for multi-language content because:

1. **Flexibility**: Easy to add new languages without schema changes
2. **Consistency**: Single column per content type (description, short_description)
3. **Query Performance**: JSONB is indexed and queryable in PostgreSQL
4. **Atomic Updates**: Update all languages in a single operation

## Migration Steps

### Option 1: JSONB Approach (Recommended)

1. **Add JSONB columns**:
   ```sql
   ALTER TABLE fleet 
   ADD COLUMN description_i18n JSONB DEFAULT '{}',
   ADD COLUMN short_description_i18n JSONB DEFAULT '{}';
   ```

2. **Migrate existing data**:
   ```sql
   UPDATE fleet
   SET description_i18n = jsonb_build_object('en', description)
   WHERE description IS NOT NULL;
   ```

3. **Structure**:
   ```json
   {
     "en": "English description",
     "es": "Descripción en español",
     "de": "Deutsche Beschreibung"
   }
   ```

4. **Query examples**:
   ```sql
   -- Get description for specific locale
   SELECT description_i18n->>'es' FROM fleet WHERE slug = 'simona';
   
   -- Get with fallback
   SELECT COALESCE(
     description_i18n->>'es',
     description_i18n->>'en'
   ) FROM fleet;
   ```

### Option 2: Separate Columns (Like Destinations)

If you prefer consistency with the destinations table:

```sql
ALTER TABLE fleet
ADD COLUMN description_en TEXT,
ADD COLUMN description_es TEXT,
ADD COLUMN description_de TEXT,
ADD COLUMN short_description_en TEXT,
ADD COLUMN short_description_es TEXT,
ADD COLUMN short_description_de TEXT;
```

**Pros**: Simple queries, explicit schema
**Cons**: Schema changes needed for new languages, more columns

## Frontend Integration

### Reading Multi-Language Content

In your React components, use the locale from `next-intl`:

```typescript
import { useLocale } from 'next-intl'

function FleetCard({ yacht }: { yacht: Fleet }) {
  const locale = useLocale()
  
  // If using JSONB:
  const description = yacht.description_i18n?.[locale] || yacht.description_i18n?.en || ''
  
  // If using separate columns:
  const description = 
    locale === 'es' ? yacht.description_es :
    locale === 'de' ? yacht.description_de :
    yacht.description_en
}
```

### Admin Panel Updates

Update the admin panel to save/load multi-language content:

1. **Save**: Store all three languages when editing
2. **Load**: Display the current locale's content
3. **AI Generation**: Generate content in the current locale

## Migration Script

See `multi_language_migration.sql` for the complete migration script.

## Rollback Plan

If you need to rollback:

1. Keep old TEXT columns during migration
2. Verify JSONB data is correct
3. Only drop old columns after confirmation
4. Keep backups before migration

## Next Steps

1. Run the migration script in Supabase SQL Editor
2. Update frontend data fetching to use JSONB columns
3. Update admin panel to save multi-language content
4. Test with all three locales (en, es, de)
5. Remove old TEXT columns after verification
