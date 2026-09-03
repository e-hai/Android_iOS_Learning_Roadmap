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

export interface DeepDiveMetaphor {
  title: string;          // e.g. '餐厅点单与叫号取餐'
  formula: string;        // e.g. '协程 = 状态机 (Switch-Case) + 续体 (Continuation) + 调度器 (Dispatcher)'
  metaphorDesc: string;   // Vivid physical world metaphor explanation
}

export interface StepperStep {
  title: string;          // e.g. '① 发起调用与创建状态机'
  desc: string;           // Concise description of what happens at this step
  tag?: string;           // Optional badge e.g. '主线程占用' | '主线程释放'
  diagram: string;        // Visual box/ASCII diagram for this step
  stateSnapshot?: Record<string, string>; // e.g. { 'label': '1', '主线程状态': '立即释放', '返回值': 'COROUTINE_SUSPENDED' }
}

export interface PipelineStep {
  title: string;          // e.g. '协程概念'
  subtitle: string;       // e.g. 'Conway 1963 · 对称地互相让出控制权'
  category?: 'theory' | 'engineering'; // 'theory' (理论与策略层) | 'engineering' (工程与运行时层)
}

export interface DeepDiveModule {
  tag: string;           // e.g. '底层机制', '性能调优', '架构陷阱', '调试利器'
  title: string;         // Module title
  pipeline?: PipelineStep[];   // Optional Theory-to-Engineering pipeline chain diagram
  metaphor?: DeepDiveMetaphor; // Optional cognitive metaphor & golden memory formula
  explanation?: string;  // Optional deep dive explanation (supports rich structured paragraphs)
  extendedDeepDive?: string; // Optional extended top-down deep dive analysis
  caseStudy?: string;    // Optional in-depth case study & reflection
  stepper?: StepperStep[]; // Optional interactive step-by-step state machine runner
  diagram?: string;      // Optional Unicode Box Diagram for architecture/timing/state machine
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
}

export interface DeepDiveDomain {
  id: string;
  number: number;
  titleKey: string;
  descKey: string;
  deepDive: PlatformDeepDive;
}

export type NavigationTarget = 'home' | string; // 'home' or stage id
