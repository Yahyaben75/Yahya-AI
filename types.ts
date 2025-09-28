
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
