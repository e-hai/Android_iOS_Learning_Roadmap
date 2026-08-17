import { LearningStage, UserProgress } from '../models/types';
import { stages } from '../data/roadmap-data';

type ProgressListener = (progress: UserProgress) => void;

class ProgressStorageService {
  private readonly READ_KEY = 'learning_cockpit_completed_stages';
  private readonly PRACTICE_KEY = 'learning_cockpit_practiced_stages';

  private completedStages: Set<string> = new Set();
  private practicedStages: Set<string> = new Set();
  private listeners: Set<ProgressListener> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const readData = localStorage.getItem(this.READ_KEY);
      if (readData) {
        this.completedStages = new Set(JSON.parse(readData));
      }
      const practiceData = localStorage.getItem(this.PRACTICE_KEY);
      if (practiceData) {
        this.practicedStages = new Set(JSON.parse(practiceData));
      }
    } catch (e) {
      console.error('Failed to load progress from localStorage', e);
    }
  }

  private save() {
    try {
      localStorage.setItem(this.READ_KEY, JSON.stringify(Array.from(this.completedStages)));
      localStorage.setItem(this.PRACTICE_KEY, JSON.stringify(Array.from(this.practicedStages)));
      this.notify();
    } catch (e) {
      console.error('Failed to save progress to localStorage', e);
    }
  }

  subscribe(listener: ProgressListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    const data: UserProgress = {
      completedStageIDs: Array.from(this.completedStages),
      practicedStageIDs: Array.from(this.practicedStages),
    };
    for (const listener of this.listeners) {
      listener(data);
    }
  }

  isReadComplete(stageId: string): boolean {
    return this.completedStages.has(stageId);
  }

  isPracticeComplete(stageId: string): boolean {
    return this.practicedStages.has(stageId);
  }

  isStageFullyComplete(stageId: string): boolean {
    return this.isReadComplete(stageId) && this.isPracticeComplete(stageId);
  }

  setReadComplete(stageId: string, complete: boolean) {
    if (complete) {
      this.completedStages.add(stageId);
    } else {
      this.completedStages.delete(stageId);
    }
    this.save();
  }

  setPracticeComplete(stageId: string, complete: boolean) {
    if (complete) {
      this.practicedStages.add(stageId);
    } else {
      this.practicedStages.delete(stageId);
    }
    this.save();
  }

  toggleReadComplete(stageId: string) {
    this.setReadComplete(stageId, !this.isReadComplete(stageId));
  }

  togglePracticeComplete(stageId: string) {
    this.setPracticeComplete(stageId, !this.isPracticeComplete(stageId));
  }

  getMainPathCompletedCount(stageList: LearningStage[] = stages): number {
    return stageList.filter((s) => !s.isAdvanced && this.isStageFullyComplete(s.id)).length;
  }

  getMainPathTotalCount(stageList: LearningStage[] = stages): number {
    return stageList.filter((s) => !s.isAdvanced).length;
  }

  getNextIncompleteStage(stageList: LearningStage[] = stages): LearningStage | null {
    const mainIncomplete = stageList.find((s) => !s.isAdvanced && !this.isStageFullyComplete(s.id));
    if (mainIncomplete) return mainIncomplete;
    const advancedIncomplete = stageList.find((s) => s.isAdvanced && !this.isStageFullyComplete(s.id));
    return advancedIncomplete || null;
  }

  exportProgressJSON(): string {
    const payload = {
      version: 1,
      timestamp: new Date().toISOString(),
      completedStages: Array.from(this.completedStages),
      practicedStages: Array.from(this.practicedStages),
    };
    return JSON.stringify(payload, null, 2);
  }

  importProgressJSON(jsonStr: string): boolean {
    try {
      const data = JSON.parse(jsonStr);
      if (Array.isArray(data.completedStages) && Array.isArray(data.practicedStages)) {
        this.completedStages = new Set(data.completedStages);
        this.practicedStages = new Set(data.practicedStages);
        this.save();
        return true;
      }
      return false;
    } catch (e) {
      console.error('Import failed', e);
      return false;
    }
  }

  resetProgress() {
    this.completedStages.clear();
    this.practicedStages.clear();
    this.save();
  }
}

export const progressStorage = new ProgressStorageService();
