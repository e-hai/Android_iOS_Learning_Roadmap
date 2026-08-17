export interface ComparisonRow {
  id: string;
  android: string;
  ios: string;
  note?: string;
}

export interface LearningStage {
  id: string;
  number: number;
  titleKey: string;
  stars: string;
  isAdvanced: boolean;
  goalKey: string;
  noteKeys: string[];
  practiceKey: string;
  rows: ComparisonRow[];
  extraHintKey?: string;
}

export type Language = 'zh-Hans' | 'en';

export type NavigationTarget = 'home' | string; // 'home' or stage id
