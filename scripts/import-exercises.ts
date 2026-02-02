/**
 * Exercise Data Import Script
 *
 * Fetches exercise data from free-exercise-db GitHub repository,
 * transforms it to match the app's schema, and generates a CSV
 * file for Supabase import.
 *
 * Usage: pnpm import-exercises
 */

import fs from "node:fs";
import path from "node:path";

// =============================================================================
// Types
// =============================================================================

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
  category: string;
  images: string[];
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

// =============================================================================
// Constants
// =============================================================================

const GITHUB_URL =
  "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json";

const OUTPUT_DIR = "output";
const OUTPUT_FILE = "system-exercises.csv";

/**
 * Mapping from primaryMuscles values to app categories.
 * Based on the app's 7 categories: Chest, Back, Shoulders, Legs, Arms, Core, Other
 */
const MUSCLE_TO_CATEGORY: Record<string, string> = {
  chest: "Chest",
  lats: "Back",
  "lower back": "Back",
  "middle back": "Back",
  traps: "Back",
  shoulders: "Shoulders",
  quadriceps: "Legs",
  hamstrings: "Legs",
  calves: "Legs",
  glutes: "Legs",
  adductors: "Legs",
  abductors: "Legs",
  biceps: "Arms",
  triceps: "Arms",
  forearms: "Arms",
  abdominals: "Core",
  neck: "Other",
};

// =============================================================================
// Data Fetching
// =============================================================================

/**
 * Fetch exercises from the free-exercise-db GitHub repository
 */
async function fetchExercises(): Promise<GithubExercise[]> {
  console.log(`Fetching exercises from ${GITHUB_URL}...`);

  const response = await fetch(GITHUB_URL);

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const exercises = (await response.json()) as GithubExercise[];
  console.log(`Fetched ${exercises.length} exercises`);

  return exercises;
}

// =============================================================================
// Data Transformation
// =============================================================================

/**
 * Get the app category from primaryMuscles array
 */
function getCategory(primaryMuscles: string[]): string {
  const muscle = primaryMuscles[0]?.toLowerCase() || "";
  return MUSCLE_TO_CATEGORY[muscle] || "Other";
}

/**
 * Map a GitHub exercise to the app's exercise schema
 */
function mapExercise(gh: GithubExercise): AppExercise {
  return {
    name: gh.name,
    category: getCategory(gh.primaryMuscles),
    equipment: gh.equipment || null,
    instructions: gh.instructions || [],
    level: gh.level || null,
    force: gh.force || null,
    mechanic: gh.mechanic || null,
    is_system: true,
    user_id: null,
  };
}

// =============================================================================
// CSV Generation
// =============================================================================

/**
 * Escape a string element for PostgreSQL array format.
 * - Escape backslashes first, then double quotes
 * - Quote if contains special characters
 */
function escapeArrayElement(value: string): string {
  // Replace newlines with spaces to avoid CSV parsing issues
  let escaped = value.replace(/[\r\n]+/g, " ");
  // Escape backslashes first, then double quotes
  escaped = escaped.replace(/\\/g, "\\\\");
  escaped = escaped.replace(/"/g, '\\"');
  // Quote if contains special characters
  if (/[{},"\\\s]/.test(value) || value === "") {
    return `"${escaped}"`;
  }
  return escaped;
}

/**
 * Format an array of strings as a PostgreSQL array literal: {element1,element2}
 */
function formatPostgresArray(arr: string[]): string {
  if (!arr || arr.length === 0) return "{}";
  const elements = arr.map(escapeArrayElement);
  return `{${elements.join(",")}}`;
}

/**
 * Escape a field for CSV format.
 * - If field contains comma, quote, or newline, wrap in quotes and escape quotes
 */
function escapeCsvField(value: string | null): string {
  if (value === null) return "";
  // Replace newlines with spaces within field
  const cleaned = value.replace(/[\r\n]+/g, " ");
  // If field contains comma, quote, or curly braces, wrap in quotes and escape quotes
  if (/[,"{}\n\r]/.test(cleaned)) {
    return `"${cleaned.replace(/"/g, '""')}"`;
  }
  return cleaned;
}

/**
 * Generate CSV content from exercises array
 */
function generateCsv(exercises: AppExercise[]): string {
  const header =
    "name,category,equipment,instructions,level,force,mechanic,is_system,user_id";

  const rows = exercises.map((ex) => {
    const fields = [
      escapeCsvField(ex.name),
      escapeCsvField(ex.category),
      escapeCsvField(ex.equipment),
      escapeCsvField(formatPostgresArray(ex.instructions)),
      escapeCsvField(ex.level),
      escapeCsvField(ex.force),
      escapeCsvField(ex.mechanic),
      "true", // is_system
      "", // user_id (NULL)
    ];
    return fields.join(",");
  });

  return [header, ...rows].join("\n");
}

// =============================================================================
// Statistics
// =============================================================================

/**
 * Log statistics about the exercise data
 */
function logStatistics(exercises: AppExercise[]): void {
  const categoryCount: Record<string, number> = {};

  for (const ex of exercises) {
    categoryCount[ex.category] = (categoryCount[ex.category] || 0) + 1;
  }

  console.log("\n=== Exercise Statistics ===");
  console.log(`Total exercises: ${exercises.length}`);
  console.log("\nExercises per category:");

  const sortedCategories = Object.entries(categoryCount).sort(
    ([, a], [, b]) => b - a
  );
  for (const [category, count] of sortedCategories) {
    console.log(`  ${category}: ${count}`);
  }
}

// =============================================================================
// Main
// =============================================================================

async function main(): Promise<void> {
  try {
    // 1. Fetch exercises from GitHub
    const githubExercises = await fetchExercises();

    // 2. Transform to app schema
    console.log("\nTransforming exercises...");
    const appExercises = githubExercises.map(mapExercise);

    // 3. Log statistics
    logStatistics(appExercises);

    // 4. Generate CSV
    console.log("\nGenerating CSV...");
    const csv = generateCsv(appExercises);

    // 5. Write to file
    const outputPath = path.join(OUTPUT_DIR, OUTPUT_FILE);

    // Ensure output directory exists
    if (!fs.existsSync(OUTPUT_DIR)) {
      fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    fs.writeFileSync(outputPath, csv, "utf-8");
    console.log(`\nCSV written to: ${outputPath}`);
    console.log(`Total rows (excluding header): ${appExercises.length}`);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
