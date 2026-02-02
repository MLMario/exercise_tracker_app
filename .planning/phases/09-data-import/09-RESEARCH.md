# Phase 9: Data Import - Research

**Researched:** 2026-02-01
**Domain:** JSON data transformation, CSV generation, Supabase bulk import
**Confidence:** HIGH

## Summary

This phase involves fetching exercise data from the [free-exercise-db](https://github.com/yuhonas/free-exercise-db) GitHub repository (~800+ exercises), transforming it to match the app's database schema, and generating a CSV file for Supabase import. The data source provides exercises in JSON format with fields like `primaryMuscles`, `level`, `force`, `mechanic`, `equipment`, and `instructions` that need to be mapped to the app's schema.

The project uses a pnpm monorepo with TypeScript. The script should be a standalone TypeScript file that can be run with `tsx` (TypeScript Execute) without requiring compilation. The output CSV must use PostgreSQL's array format (`{value1,value2,...}`) for the `instructions` text[] column.

**Primary recommendation:** Create a TypeScript script at `scripts/import-exercises.ts` that fetches the JSON data, transforms it using the muscle-to-category mapping, and outputs a CSV file ready for Supabase Table Editor import. Use `tsx` to run the script without compilation.

## Standard Stack

### Core
| Library | Version | Purpose | Why Standard |
|---------|---------|---------|--------------|
| tsx | latest | Run TypeScript scripts | Zero-config TS execution, fastest runner |
| node:fs | built-in | File system operations | No external dependency needed |
| node:https | built-in | Fetch JSON from GitHub | No external dependency needed |

### Supporting
| Library | Version | Purpose | When to Use |
|---------|---------|---------|-------------|
| json-2-csv | 5.x | JSON to CSV conversion | Has TypeScript support, handles escaping |

### Alternatives Considered
| Instead of | Could Use | Tradeoff |
|------------|-----------|----------|
| json-2-csv | Manual CSV generation | Manual approach requires careful escaping but has zero dependencies |
| tsx | ts-node | tsx is faster, fewer config issues with ESM |
| tsx | Native Node.js TS | Requires Node.js 22.18+ and has limitations |

**Installation:**
```bash
pnpm add -D tsx
# json-2-csv is optional - manual CSV generation is simpler for this use case
```

## Architecture Patterns

### Recommended Script Location
```
scripts/
└── import-exercises.ts    # Standalone data import script
```

**Why `scripts/` folder:**
- Separates one-time tooling from application code
- Clear that this is a utility, not part of the web app
- Standard convention in Node.js projects

### Pattern 1: Fetch-Transform-Output Pipeline
**What:** Linear data processing pipeline
**When to use:** One-time data transformation tasks
**Example:**
```typescript
// Source: Standard data pipeline pattern
async function main() {
  // 1. FETCH: Get raw data from source
  const rawExercises = await fetchExercisesFromGithub();

  // 2. TRANSFORM: Map to app schema
  const mappedExercises = rawExercises.map(mapExercise);

  // 3. OUTPUT: Generate CSV
  const csv = generateCsv(mappedExercises);
  await fs.writeFile('output.csv', csv);
}
```

### Pattern 2: Muscle-to-Category Mapping
**What:** Static lookup table for category conversion
**When to use:** When source schema differs from target schema
**Example:**
```typescript
// Source: pre_created_exercise_list_proposal.md
const MUSCLE_TO_CATEGORY: Record<string, string> = {
  'chest': 'Chest',
  'lats': 'Back',
  'lower back': 'Back',
  'middle back': 'Back',
  'traps': 'Back',
  'neck': 'Other',       // Not in original 6 categories
  'shoulders': 'Shoulders',
  'quadriceps': 'Legs',
  'hamstrings': 'Legs',
  'calves': 'Legs',
  'glutes': 'Legs',
  'adductors': 'Legs',
  'abductors': 'Legs',
  'biceps': 'Arms',
  'triceps': 'Arms',
  'forearms': 'Arms',
  'abdominals': 'Core',
};

function getCategory(primaryMuscles: string[]): string {
  const muscle = primaryMuscles[0]?.toLowerCase() || '';
  return MUSCLE_TO_CATEGORY[muscle] || 'Other';
}
```

### Anti-Patterns to Avoid
- **Streaming for small datasets:** With ~800 exercises (~2-5MB), loading all into memory is fine
- **Runtime type checking:** Validate once during development, not on every run
- **Complex CSV libraries:** PostgreSQL array format is simple enough to generate manually

## Don't Hand-Roll

| Problem | Don't Build | Use Instead | Why |
|---------|-------------|-------------|-----|
| UUID generation | Custom random strings | PostgreSQL `gen_random_uuid()` | Let database generate IDs |
| CSV field escaping | String replacement | Proper escaping logic | Edge cases with quotes, commas |
| HTTP requests | Raw sockets | Built-in `fetch` or `https` | Error handling, redirects |

**Key insight:** The CSV is simple enough that a library adds more complexity than value. The tricky part is PostgreSQL array format, which is well-documented.

## Common Pitfalls

### Pitfall 1: PostgreSQL Array Format in CSV
**What goes wrong:** CSV import fails with array syntax errors
**Why it happens:** PostgreSQL expects `{val1,val2}` format with specific escaping rules
**How to avoid:** Format arrays as `{element1,element2}` with proper quoting for elements containing commas or quotes
**Warning signs:** Import errors mentioning "malformed array literal"

**Array format rules:**
```
Empty array: {}
Simple values: {value1,value2}
Values with spaces: {"value with spaces",simple}
Values with commas: {"value, with comma",other}
Values with quotes: {"value ""with"" quotes",other}
```

### Pitfall 2: Missing or NULL Values in Source Data
**What goes wrong:** CSV has missing columns or invalid NULL representations
**Why it happens:** Source JSON has optional fields (force, mechanic can be null)
**How to avoid:** Explicitly handle null/undefined and output empty string or proper NULL
**Warning signs:** Import errors about constraint violations

### Pitfall 3: Exercise Name Collisions
**What goes wrong:** Duplicate exercise names cause confusion
**Why it happens:** Source may have subtle naming variations
**How to avoid:** Log duplicates during transform, consider deduplication
**Warning signs:** Unexpected exercise count after import

### Pitfall 4: Forgetting is_system and user_id Columns
**What goes wrong:** Imported exercises appear as user exercises
**Why it happens:** Forgetting to set `is_system=true` and `user_id=NULL`
**How to avoid:** CSV must explicitly include these columns with correct values
**Warning signs:** Exercises not visible to all users, RLS blocking access

### Pitfall 5: Category Mismatch with CHECK Constraint
**What goes wrong:** Import fails with constraint violation
**Why it happens:** Muscle not in mapping produces category not in CHECK constraint
**How to avoid:** Use 'Other' category for unmapped muscles (added in Phase 8)
**Warning signs:** "new row violates check constraint" errors

### Pitfall 6: Instructions Array with Special Characters
**What goes wrong:** CSV parsing fails or instructions truncated
**Why it happens:** Exercise instructions contain quotes, commas, newlines
**How to avoid:** Escape quotes as `""`, remove or escape newlines within array elements
**Warning signs:** Garbled instructions, import failures

## Code Examples

Verified patterns from research:

### Fetch JSON from GitHub Raw URL
```typescript
// Source: Standard Node.js https pattern
import https from 'node:https';

async function fetchExercises(): Promise<GithubExercise[]> {
  const url = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
      res.on('error', reject);
    });
  });
}
```

### Alternative: Using fetch (Node.js 18+)
```typescript
// Source: Node.js native fetch API
async function fetchExercises(): Promise<GithubExercise[]> {
  const url = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';
  const response = await fetch(url);
  return response.json();
}
```

### Map GitHub Exercise to App Schema
```typescript
// Source: pre_created_exercise_list_proposal.md
interface GithubExercise {
  id: string;
  name: string;
  force: string | null;
  level: string;
  mechanic: string | null;
  equipment: string | null;
  primaryMuscles: string[];
  secondaryMuscles: string[];
  instructions: string[];
  category: string;  // Ignored - we use primaryMuscles mapping
  images: string[];  // Ignored
}

interface AppExercise {
  name: string;
  category: string;
  equipment: string | null;
  instructions: string[];
  level: string | null;
  force: string | null;
  mechanic: string | null;
  is_system: boolean;
  user_id: null;
}

function mapExercise(gh: GithubExercise): AppExercise {
  const primaryMuscle = gh.primaryMuscles[0]?.toLowerCase() || '';
  return {
    name: gh.name,
    category: MUSCLE_TO_CATEGORY[primaryMuscle] || 'Other',
    equipment: gh.equipment || null,
    instructions: gh.instructions || [],
    level: gh.level || null,
    force: gh.force || null,
    mechanic: gh.mechanic || null,
    is_system: true,
    user_id: null,
  };
}
```

### Generate PostgreSQL-Compatible CSV
```typescript
// Source: PostgreSQL COPY documentation + research
function escapeArrayElement(value: string): string {
  // Escape backslashes first, then double quotes
  let escaped = value.replace(/\\/g, '\\\\');
  escaped = escaped.replace(/"/g, '""');
  // Quote if contains special characters
  if (/[{},"\\\s]/.test(value) || value === '') {
    return `"${escaped}"`;
  }
  return escaped;
}

function formatPostgresArray(arr: string[]): string {
  if (!arr || arr.length === 0) return '{}';
  const elements = arr.map(escapeArrayElement);
  return `{${elements.join(',')}}`;
}

function escapeCsvField(value: string | null): string {
  if (value === null) return '';
  // If field contains comma, quote, or newline, wrap in quotes and escape quotes
  if (/[,"\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function generateCsv(exercises: AppExercise[]): string {
  const header = 'name,category,equipment,instructions,level,force,mechanic,is_system,user_id';

  const rows = exercises.map(ex => {
    const fields = [
      escapeCsvField(ex.name),
      escapeCsvField(ex.category),
      escapeCsvField(ex.equipment),
      escapeCsvField(formatPostgresArray(ex.instructions)),
      escapeCsvField(ex.level),
      escapeCsvField(ex.force),
      escapeCsvField(ex.mechanic),
      'true',  // is_system
      '',      // user_id (NULL)
    ];
    return fields.join(',');
  });

  return [header, ...rows].join('\n');
}
```

### Run Script with tsx
```bash
# Source: tsx documentation
# Install tsx
pnpm add -D tsx

# Run the script
pnpm tsx scripts/import-exercises.ts

# Or add to package.json scripts
# "import-exercises": "tsx scripts/import-exercises.ts"
```

## Data Source Analysis

### GitHub Repository: yuhonas/free-exercise-db
**URL:** https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json

**Exercise Count:** 800+ exercises

**Fields Available:**
| Field | Type | Example | Maps To |
|-------|------|---------|---------|
| `name` | string | "Barbell Bench Press" | `exercises.name` |
| `primaryMuscles` | string[] | `["chest"]` | `exercises.category` (via mapping) |
| `equipment` | string or null | "barbell" | `exercises.equipment` |
| `instructions` | string[] | `["Step 1...", "Step 2..."]` | `exercises.instructions` |
| `level` | string | "beginner"/"intermediate"/"expert" | `exercises.level` |
| `force` | string or null | "push"/"pull"/"static" | `exercises.force` |
| `mechanic` | string or null | "compound"/"isolation" | `exercises.mechanic` |
| `id` | string | "Barbell_Bench_Press" | NOT imported (use DB uuid) |
| `category` | string | "strength" | IGNORED |
| `images` | string[] | `["image.jpg"]` | IGNORED |
| `secondaryMuscles` | string[] | `["triceps"]` | IGNORED |

### Primary Muscles Found in Source
Based on data analysis:
- abdominals, adductors, biceps, calves, chest
- forearms, glutes, hamstrings, lats, lower back
- middle back, neck, quadriceps, shoulders, traps, triceps

### Mapping Table (Final)
| Source primaryMuscles | Target category |
|----------------------|-----------------|
| chest | Chest |
| lats | Back |
| lower back | Back |
| middle back | Back |
| traps | Back |
| shoulders | Shoulders |
| quadriceps | Legs |
| hamstrings | Legs |
| calves | Legs |
| glutes | Legs |
| adductors | Legs |
| abductors | Legs |
| biceps | Arms |
| triceps | Arms |
| forearms | Arms |
| abdominals | Core |
| neck | Other |
| *unmapped* | Other |

## Supabase Import Options

### Option 1: Dashboard Table Editor (RECOMMENDED for ~800 rows)
- **Limit:** 100MB (exercises.json is ~2-5MB)
- **Method:** Upload CSV via Table Editor > Insert > Import from CSV
- **Pros:** Simple, visual verification, no CLI needed
- **Cons:** Manual process, no automation

### Option 2: SQL INSERT Statements
- **Method:** Generate SQL file with INSERT statements
- **Pros:** Reproducible, can be version controlled
- **Cons:** Slower than COPY, larger file size

### Option 3: psql COPY Command
- **Method:** Direct PostgreSQL COPY from CSV
- **Pros:** Fastest, handles large datasets
- **Cons:** Requires psql client, connection string

**Recommendation:** Dashboard import is simplest for one-time ~800 row import. The generated CSV should work with all options.

## State of the Art

| Old Approach | Current Approach | When Changed | Impact |
|--------------|------------------|--------------|--------|
| ts-node for scripts | tsx (TypeScript Execute) | 2023+ | 10x faster, zero config |
| json2csv library | Manual generation for simple cases | Always valid | Fewer dependencies |
| COPY for bulk import | Dashboard CSV for small imports | Supabase improvement | Simpler UX |

**Deprecated/outdated:**
- Using `ts-node` without transpileOnly: Much slower than tsx
- Manual HTTP requests: Use native fetch in Node.js 18+

## Open Questions

1. **Handling Exercise Name Duplicates**
   - What we know: Source data likely has unique names
   - What's unclear: Whether subtle variations exist (e.g., "Bench Press" vs "Bench Press (Barbell)")
   - Recommendation: Log names during transform, manual review before import

2. **Equipment Normalization**
   - What we know: Source has values like "barbell", "dumbbell", "machine"
   - What's unclear: Whether to normalize capitalization
   - Recommendation: Keep as-is from source, matches existing user exercises pattern

3. **Instructions with Newlines**
   - What we know: Some instructions may contain newlines
   - What's unclear: Whether Supabase CSV import handles embedded newlines
   - Recommendation: Replace newlines with spaces within array elements

## Sources

### Primary (HIGH confidence)
- [yuhonas/free-exercise-db](https://github.com/yuhonas/free-exercise-db) - Source data repository
- [PostgreSQL COPY documentation](https://www.postgresql.org/docs/current/sql-copy.html) - Array format specification
- [PostgreSQL Array documentation](https://www.postgresql.org/docs/current/arrays.html) - Array literal syntax
- [Supabase Import Data docs](https://supabase.com/docs/guides/database/import-data) - Import methods and limits

### Secondary (MEDIUM confidence)
- [tsx documentation](https://tsx.is/) - TypeScript execution
- [Importing array values into Postgres from CSV](https://briandfoy.github.io/importing-array-values-into-postgres-from-csv/) - Array CSV format examples
- Project's `pre_created_exercise_list_proposal.md` - Muscle mapping, schema design

### Tertiary (LOW confidence)
- WebSearch results for CSV libraries - Many options, manual generation is simpler

## Metadata

**Confidence breakdown:**
- Data source format: HIGH - Verified by fetching actual JSON
- Muscle mapping: HIGH - From project proposal, verified against source
- CSV generation: HIGH - PostgreSQL documentation is authoritative
- Supabase import: MEDIUM - Dashboard limits verified, array handling assumed from PostgreSQL

**Research date:** 2026-02-01
**Valid until:** 2026-03-01 (30 days - stable data source and import methods)
