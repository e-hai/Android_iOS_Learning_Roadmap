export interface ComparisonRow {
  id: string;
  android: string;
  ios: string;
  note?: string;
}

export interface ComparisonSection {
  id: string;
  titleKey: string;
  badgeKey?: string;
  rows: ComparisonRow[];
}

export interface DeepDiveModule {
  tag: string;           // e.g. '底层机制', '性能调优', '架构陷阱', '调试利器'
  title: string;         // Module title
  explanation: string;   // Deep dive explanation
  codeSnippet?: string;  // Code example or CLI command
}

export interface PlatformDeepDive {
  android: DeepDiveModule[];
  ios: DeepDiveModule[];
}

export interface LearningStage {
  id: string;
  number: number;
  titleKey: string;
  isAdvanced: boolean;
  goalKey: string;
  noteKeys: string[];
  practiceKey: string;
  rows: ComparisonRow[];
  sections?: ComparisonSection[];
  extraHintKey?: string;
  deepDive?: PlatformDeepDive;
}

export interface DeepDiveDomain {
  id: string;
  number: number;
  titleKey: string;
  descKey: string;
  deepDive: PlatformDeepDive;
}

export type Language = 'zh-Hans' | 'en';

export type NavigationTarget = 'home' | string; // 'home' or stage id
