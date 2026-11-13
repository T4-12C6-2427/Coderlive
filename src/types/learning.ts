export interface LineNote {
  line: number;
  note: string;
  tag?: string;
}

export interface CommonMistake {
  title: string;
  description: string;
  wrongCode: string;
  correctCode: string;
  explanation: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface StepSnapshot {
  step: number;
  line: number;
  variables: Record<string, string | number | boolean | null | undefined | any>;
  explanation: string;
}

export interface PredictionChallenge {
  id: string;
  snippet: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface LessonExercise {
  prompt: string;
  starterCode: string;
  hint: string;
  expectedOutputDesc?: string;
  validate: (logs: string[], code: string) => { passed: boolean; message: string };
}

export interface CssPropertyItem {
  property: string;
  description: string;
  values: string;
}

export interface BrowserStepItem {
  step: number;
  title: string;
  lines: number[];
  text: string;
}

export interface Lesson {
  id: number | string;
  order: number;
  slug: string;
  title: string;
  topic: string;
  tags: string[];
  intro: string;
  analogy?: string;
  initialCode: string;
  lineNotes: LineNote[];
  commonMistakes: CommonMistake[];
  quiz: QuizQuestion[];
  // JavaScript course extensions
  steps?: StepSnapshot[];
  predictions?: PredictionChallenge[];
  exercise?: LessonExercise;
  isDomLesson?: boolean;
  initialHtml?: string;
  // CSS course extensions
  cssProperties?: CssPropertyItem[];
  browserSteps?: BrowserStepItem[];
  consequence?: string;
  playgroundType?: 'colors' | 'units' | 'box-model' | 'borders' | 'display-position' | 'flexbox' | 'grid' | 'animations' | 'responsive';
}

export type CourseId = 'html' | 'css' | 'js';

export interface CourseInfo {
  id: CourseId;
  order: number;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  color: string;
  gradient: string;
  iconName: 'Code2' | 'Palette' | 'Sparkles' | 'GraduationCap';
  lessonCount: number;
  status: 'available' | 'coming-soon';
}

export type TagCategory =
  | 'Cấu trúc'
  | 'Văn bản'
  | 'Liên kết & Media'
  | 'Danh sách & Bảng'
  | 'Biểu mẫu'
  | 'Ngữ nghĩa';

export interface TagCheatItem {
  tag: string;
  name: string;
  category: TagCategory;
  description: string;
  example: string;
  selfClosing?: boolean;
}

export type JsCheatCategory =
  | 'Biến & kiểu'
  | 'Điều kiện & vòng lặp'
  | 'Hàm'
  | 'Mảng'
  | 'Đối tượng'
  | 'DOM & Sự kiện';

export interface JsCheatItem {
  id: string;
  name: string;
  syntax: string;
  category: JsCheatCategory;
  description: string;
  example: string;
  explanation: string;
}

// Unified Cheat Sheet Data Model (Phase 2 & 3)
export type ExampleKind = 'render' | 'console' | 'explain' | 'mixed';

export interface CheatStep {
  lines: number[];
  title: string;
  text: string;
}

export interface Illustration {
  type: string;
  data?: any;
}

export interface Example {
  code: string;
  kind: ExampleKind;
  expectedOutput?: string[];
  steps: CheatStep[];
  illustration?: Illustration;
  wrapAsPage?: boolean;
  domHtml?: string; // Optional starter DOM for mixed/DOM JS examples
}

export interface CheatMistake {
  wrong: string;
  right: string;
  why: string;
}

export interface CheatEntry {
  id: string;
  term: string; // The tag name or syntax term (e.g. "<!DOCTYPE>", "let", "color")
  category: string;
  meaning: string;
  name?: string; // Optional alias for meaning
  description?: string; // Optional alias for meaning / details
  syntax: string; // Short template/signature
  example: Example;
  tip: string;
  consequence?: string; // "Nếu thiếu hoặc viết sai thì sao?"
  analogy?: string; // "Mẹo nhớ"
  mistakes?: CheatMistake[];
  related?: string[];
}

