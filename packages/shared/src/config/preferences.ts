import { existsSync, writeFileSync } from 'fs';
import { join } from 'path';
import { ensureConfigDir } from './storage.ts';
import { CONFIG_DIR } from './paths.ts';
import { readJsonFileSync } from '../utils/files.ts';
import { getRules, getFacts, getEpisodes } from './memory-store.ts';

export interface UserLocation {
  city?: string;
  region?: string;
  country?: string;
}

/**
 * Diff viewer display preferences
 * Persisted to preferences.json as a user-level setting
 */
export interface DiffViewerPreferences {
  /** Diff layout: 'unified' (stacked) or 'split' (side-by-side) */
  diffStyle?: 'unified' | 'split';
  /** Whether to disable background highlighting on changed lines */
  disableBackground?: boolean;
}

export interface UserPreferences {
  name?: string;
  timezone?: string;
  location?: UserLocation;
  language?: string;
  // Free-form notes the agent learns about the user
  notes?: string;
  // Diff viewer display preferences
  diffViewer?: DiffViewerPreferences;
  // When the preferences were last updated
  updatedAt?: number;
}

const PREFERENCES_FILE = join(CONFIG_DIR, 'preferences.json');

export function loadPreferences(): UserPreferences {
  try {
    if (!existsSync(PREFERENCES_FILE)) {
      return {};
    }
    return readJsonFileSync<UserPreferences>(PREFERENCES_FILE);
  } catch {
    return {};
  }
}

export function savePreferences(prefs: UserPreferences): void {
  ensureConfigDir();
  prefs.updatedAt = Date.now();
  writeFileSync(PREFERENCES_FILE, JSON.stringify(prefs, null, 2), 'utf-8');
}

export function updatePreferences(updates: Partial<UserPreferences> & { _appendNotes?: boolean }): UserPreferences {
  const current = loadPreferences();
  
  let newNotes = updates.notes;
  if (updates._appendNotes && current.notes && updates.notes) {
    // If it's a completely new note that doesn't exist yet, append it.
    if (!current.notes.includes(updates.notes)) {
      newNotes = `${current.notes}\n- ${updates.notes}`;
    } else {
      newNotes = current.notes;
    }
  }

  const updated = {
    ...current,
    ...updates,
    notes: newNotes !== undefined ? newNotes : current.notes,
    // Merge location if provided
    location: updates.location
      ? { ...current.location, ...updates.location }
      : current.location,
    // Merge diffViewer if provided
    diffViewer: updates.diffViewer
      ? { ...current.diffViewer, ...updates.diffViewer }
      : current.diffViewer,
  };
  savePreferences(updated);
  return updated;
}

export function getPreferencesPath(): string {
  return PREFERENCES_FILE;
}

/**
 * Format preferences for inclusion in system prompt
 */
export function formatPreferencesForPrompt(): string {
  const prefs = loadPreferences();
  const rules = getRules();
  const facts = getFacts();
  const episodes = getEpisodes().slice(-5); // Get last 5 episodes

  if (Object.keys(prefs).length === 0 && rules.length === 0 && facts.length === 0 && episodes.length === 0 &&
      (!prefs.name && !prefs.timezone && !prefs.location && !prefs.language && !prefs.notes)) {
    return '';
  }

  const lines: string[] = [
    '## User Profile & Long-Term Memory',
    'You have a persistent memory of this user across sessions. You MUST implicitly demonstrate that you remember them by naturally weaving their name, context, and preferences into your daily conversations.',
    'Do not be overly robotic about it, but act like a familiar, long-term pair programming partner. Always adhere strictly to their recorded preferences and rules.',
    ''
  ];

  if (prefs.name) {
    lines.push(`- User's Name: ${prefs.name} (Feel free to address the user by their name naturally)`);
  }

  if (prefs.timezone) {
    lines.push(`- Timezone: ${prefs.timezone}`);
  }

  if (prefs.location) {
    const loc = prefs.location;
    const parts = [loc.city, loc.region, loc.country].filter(Boolean);
    if (parts.length > 0) {
      lines.push(`- Location: ${parts.join(', ')}`);
    }
  }

  if (prefs.language) {
    lines.push(`- Preferred language: ${prefs.language}`);
  }

  if (prefs.notes) {
    lines.push('', '### General Notes', prefs.notes);
  }

  if (facts.length > 0) {
    lines.push('', '### Known Facts about User/Environment');
    facts.forEach(f => lines.push(`- ${f.content}`));
  }

  if (rules.length > 0) {
    lines.push('', '### Core Rules & Preferences');
    rules.forEach(r => lines.push(`- ${r.content}`));
  }

  if (episodes.length > 0) {
    lines.push('', '### Recent Session Summaries');
    episodes.forEach(e => lines.push(`- ${new Date(e.createdAt).toLocaleString()}: ${e.summary}`));
  }

  lines.push('');
  return lines.join('\n');
}

/**
 * Format preferences as readable text for display
 */
export function formatPreferencesDisplay(): string {
  const prefs = loadPreferences();

  const lines: string[] = ['**Your Preferences**', ''];

  // Check if any preferences are actually set
  const hasName = !!prefs.name;
  const hasTimezone = !!prefs.timezone;
  const hasLocation = prefs.location && (prefs.location.city || prefs.location.region || prefs.location.country);
  const hasLanguage = !!prefs.language;
  const hasNotes = !!prefs.notes;
  const hasAnyPrefs = hasName || hasTimezone || hasLocation || hasLanguage || hasNotes;

  lines.push('Your preferences help personalise your experience. The assistant uses these to provide more relevant responses (e.g., timezone for scheduling, language for communication).');
  lines.push('');

  if (!hasAnyPrefs) {
    lines.push('**Status:** Nothing saved yet.');
    lines.push('');
  } else {
    lines.push(`- Name: ${prefs.name || '(not set)'}`);
    lines.push(`- Timezone: ${prefs.timezone || '(not set)'}`);

    if (hasLocation) {
      const loc = prefs.location!;
      const parts = [loc.city, loc.region, loc.country].filter(Boolean);
      lines.push(`- Location: ${parts.join(', ')}`);
    } else {
      lines.push('- Location: (not set)');
    }

    lines.push(`- Language: ${prefs.language || '(not set)'}`);

    if (hasNotes) {
      lines.push('', '**Notes**', prefs.notes!);
    }

    if (prefs.updatedAt) {
      lines.push('', `_Last updated: ${new Date(prefs.updatedAt).toLocaleString()}_`);
    }
    lines.push('');
  }

  lines.push('**How to update:** Just tell the assistant (e.g., "My name is Alex" or "I\'m in London, GMT timezone").');
  lines.push(`**Config file:** \`${PREFERENCES_FILE}\``);

  return lines.join('\n');
}
