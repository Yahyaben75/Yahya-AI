
export enum AppState {
  IDLE,
  PROCESSING,
  SUCCESS,
  ERROR,
}

export interface EditResult {
  imageUrl: string;
  text: string | null;
}

export interface HistoryItem {
  id: string;
  prompt: string;
  resultImageUrl: string;
  originalImageUrl: string | null;
  timestamp: number;
}
