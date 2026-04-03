import { existsSync, writeFileSync, mkdirSync, readFileSync, appendFileSync } from 'fs';
import { join } from 'path';
import { readJsonFileSync } from '../utils/files.ts';
import { getDynamicConfigDir } from './paths.ts';

// Dynamic getters to support environment variable overrides at runtime
export const getMemoryDir = () => {
  return join(getDynamicConfigDir(), 'memory');
};
export const getRulesFile = () => join(getMemoryDir(), 'rules.json');
export const getFactsFile = () => join(getMemoryDir(), 'facts.json');
export const getEpisodesFile = () => join(getMemoryDir(), 'episodes.jsonl');
export const getHeartbeatTasksFile = () => join(getMemoryDir(), 'heartbeat-tasks.json');

export interface MemoryRule {
  id: string;
  content: string;
  createdAt: number;
}

export interface MemoryFact {
  id: string;
  content: string;
  createdAt: number;
}

export interface MemoryEpisode {
  id: string;
  sessionId: string;
  summary: string;
  createdAt: number;
}

export interface HeartbeatTask {
  id: string;
  description: string;
  createdAt: number;
}

export function ensureMemoryDir(): void {
  const CONFIG_DIR = getDynamicConfigDir();
  const MEMORY_DIR = getMemoryDir();
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  if (!existsSync(MEMORY_DIR)) {
    mkdirSync(MEMORY_DIR, { recursive: true });
  }
  if (!existsSync(getRulesFile())) {
    writeFileSync(getRulesFile(), JSON.stringify([]), 'utf-8');
  }
  if (!existsSync(getFactsFile())) {
    writeFileSync(getFactsFile(), JSON.stringify([]), 'utf-8');
  }
  if (!existsSync(getEpisodesFile())) {
    writeFileSync(getEpisodesFile(), '', 'utf-8');
  }
  if (!existsSync(getHeartbeatTasksFile())) {
    writeFileSync(getHeartbeatTasksFile(), JSON.stringify([]), 'utf-8');
  }
}

export function getRules(): MemoryRule[] {
  ensureMemoryDir();
  try {
    return readJsonFileSync<MemoryRule[]>(getRulesFile());
  } catch {
    return [];
  }
}

export function addRule(content: string): MemoryRule {
  const rules = getRules();
  // Simple deduplication
  if (rules.some(r => r.content === content)) {
    return rules.find(r => r.content === content)!;
  }
  const newRule: MemoryRule = {
    id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    content,
    createdAt: Date.now()
  };
  rules.push(newRule);
  writeFileSync(getRulesFile(), JSON.stringify(rules, null, 2), 'utf-8');
  return newRule;
}

export function getFacts(): MemoryFact[] {
  ensureMemoryDir();
  try {
    return readJsonFileSync<MemoryFact[]>(getFactsFile());
  } catch {
    return [];
  }
}

export function addFact(content: string): MemoryFact {
  const facts = getFacts();
  if (facts.some(f => f.content === content)) {
    return facts.find(f => f.content === content)!;
  }
  const newFact: MemoryFact = {
    id: `fact_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    content,
    createdAt: Date.now()
  };
  facts.push(newFact);
  writeFileSync(getFactsFile(), JSON.stringify(facts, null, 2), 'utf-8');
  return newFact;
}

export function getEpisodes(): MemoryEpisode[] {
  ensureMemoryDir();
  try {
    const content = readFileSync(getEpisodesFile(), 'utf-8');
    const lines = content.split('\n').filter(line => line.trim().length > 0);
    return lines.map(line => JSON.parse(line) as MemoryEpisode);
  } catch {
    return [];
  }
}

export function addEpisode(sessionId: string, summary: string): MemoryEpisode {
  ensureMemoryDir();
  const newEpisode: MemoryEpisode = {
    id: `ep_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    sessionId,
    summary,
    createdAt: Date.now()
  };
  appendFileSync(getEpisodesFile(), JSON.stringify(newEpisode) + '\n', 'utf-8');
  return newEpisode;
}

export function getHeartbeatTasks(): HeartbeatTask[] {
  ensureMemoryDir();
  try {
    return readJsonFileSync<HeartbeatTask[]>(getHeartbeatTasksFile());
  } catch {
    return [];
  }
}

export function addHeartbeatTask(description: string): HeartbeatTask {
  const tasks = getHeartbeatTasks();
  if (tasks.some(t => t.description === description)) {
    return tasks.find(t => t.description === description)!;
  }
  const newTask: HeartbeatTask = {
    id: `hb_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    description,
    createdAt: Date.now()
  };
  tasks.push(newTask);
  writeFileSync(getHeartbeatTasksFile(), JSON.stringify(tasks, null, 2), 'utf-8');
  return newTask;
}
