#!/usr/bin/env npx tsx
/**
 * MrAI Context Compaction Script
 *
 * Automatically manages context budget by:
 * 1. Archiving old accomplishments (keep last 3)
 * 2. Archiving old observations (keep last 30 when > 40)
 * 3. Cleaning sent tweets from outbound queue
 *
 * Run: npx tsx scripts/compact-context.ts
 * Dry run: npx tsx scripts/compact-context.ts --dry-run
 */

import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";

const DATA_DIR = join(process.cwd(), "public/data");
const ARCHIVES_DIR = join(DATA_DIR, "mrai-archives");
const dryRun = process.argv.includes("--dry-run");

function log(msg: string) {
  console.log(dryRun ? `[DRY RUN] ${msg}` : msg);
}

function readJSON(path: string) {
  return JSON.parse(readFileSync(path, "utf-8"));
}

function writeJSON(path: string, data: unknown) {
  if (dryRun) return;
  writeFileSync(path, JSON.stringify(data, null, 2) + "\n");
}

// --- 1. Compact accomplishments (keep last 3) ---
function compactAccomplishments() {
  const statePath = join(DATA_DIR, "mrai-state.json");
  const archivePath = join(ARCHIVES_DIR, "accomplishments-archive.json");

  const state = readJSON(statePath);
  const accomplishments = state.recentAccomplishments || [];

  if (accomplishments.length <= 3) {
    log(`Accomplishments: ${accomplishments.length} entries (healthy, no action)`);
    return 0;
  }

  const toArchive = accomplishments.slice(0, -3);
  state.recentAccomplishments = accomplishments.slice(-3);

  const archive = existsSync(archivePath) ? readJSON(archivePath) : { archived: [] };
  archive.archived = [...(archive.archived || []), ...toArchive];
  archive.lastCompacted = new Date().toISOString().split("T")[0];

  writeJSON(statePath, state);
  writeJSON(archivePath, archive);

  log(`Accomplishments: archived ${toArchive.length}, kept ${state.recentAccomplishments.length}`);
  return toArchive.length;
}

// --- 2. Compact observations (keep last 30 when > 40) ---
function compactObservations() {
  const obsPath = join(DATA_DIR, "mrai-observations.json");
  const archivePath = join(ARCHIVES_DIR, "observations-archive.json");

  const obsFile = readJSON(obsPath);
  const observations = obsFile.observations || [];

  if (observations.length <= 40) {
    log(`Observations: ${observations.length} entries (healthy, no action)`);
    return 0;
  }

  const toKeep = observations.slice(0, 30); // already sorted newest-first
  const toArchive = observations.slice(30);

  const archive = existsSync(archivePath) ? readJSON(archivePath) : { archived: [] };
  archive.archived = [...toArchive, ...(archive.archived || [])];
  archive.lastCompacted = new Date().toISOString().split("T")[0];

  obsFile.observations = toKeep;
  obsFile.meta.lastUpdated = new Date().toISOString().split("T")[0];
  obsFile.meta.archiveNote = `Observations archived to mrai-archives/observations-archive.json. Total all-time: ${obsFile.meta.totalAllTime}`;

  writeJSON(obsPath, obsFile);
  writeJSON(archivePath, archive);

  log(`Observations: archived ${toArchive.length}, kept ${toKeep.length}`);
  return toArchive.length;
}

// --- 3. Clean sent tweets from outbound queue ---
function cleanOutboundQueue() {
  const outboundPath = join(DATA_DIR, "mrai-outbound.json");
  const outbound = readJSON(outboundPath);
  const queue = outbound.queue || [];

  const sent = queue.filter((t: { status: string }) => t.status === "sent");
  const remaining = queue.filter((t: { status: string }) => t.status !== "sent");

  if (sent.length === 0) {
    log(`Outbound queue: no sent tweets to clean`);
    return 0;
  }

  // Move sent to a sent archive array
  if (!outbound.sent) outbound.sent = [];
  outbound.sent = [
    ...sent.map((t: { id: string; content: string; sentAt: string }) => ({
      id: t.id,
      content: t.content,
      sentAt: t.sentAt,
    })),
    ...outbound.sent,
  ];
  outbound.queue = remaining;
  outbound.meta.lastUpdated = new Date().toISOString().split("T")[0];

  writeJSON(outboundPath, outbound);

  log(`Outbound queue: moved ${sent.length} sent tweets to archive, ${remaining.length} remaining`);
  return sent.length;
}

// --- Run all compactions ---
console.log("MrAI Context Compaction");
console.log("=".repeat(40));

let totalActions = 0;
totalActions += compactAccomplishments();
totalActions += compactObservations();
totalActions += cleanOutboundQueue();

console.log("=".repeat(40));
if (totalActions === 0) {
  console.log("All context budgets healthy. No compaction needed.");
} else {
  log(`Compaction complete. ${totalActions} items processed.`);
}
