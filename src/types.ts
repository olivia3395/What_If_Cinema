export interface Movie {
  id: string;
  title: string;
  titleZh: string;
  year: number;
  slug: string;
  posterUrl: string;
  genres: string[];
  genresZh: string[];
  moodTags: string[];
  moodTagsZh: string[];
  endingTheme: string;
  endingThemeZh: string;
  shortSynopsis: string;
  shortSynopsisZh: string;
  endingSummary: string;
  endingSummaryZh: string;
  samplePrompts: string[];
  samplePromptsZh: string[];
  coreConflicts: string[];
  coreConflictsZh: string[];
  toneProfile: string;
  toneProfileZh: string;
}

export type RewriteMode = 'insert_scene' | 'change_decision' | 'rewrite_final' | 'reveal_info';

export type EmotionalDirection = 'Healing' | 'Bittersweet' | 'Dramatic' | 'Realistic' | 'Hopeful';

export type Faithfulness = 'Very faithful' | 'Balanced' | 'Bold reinterpretation';

export type Intensity = 'Small shift' | 'Moderate shift' | 'Major rewrite';

export interface RewriteRequest {
  movie: Movie;
  mode: RewriteMode;
  prompt: string;
  direction: EmotionalDirection;
  faithfulness: Faithfulness;
  intensity: Intensity;
}

export interface Branch {
  title: string;
  summary: string;
  description: string;
}

export interface RewriteResult {
  originalCore: string;
  impactAnalysis: string;
  branches: Branch[];
  polishedEnding: string;
}
