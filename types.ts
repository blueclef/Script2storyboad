export interface StoryboardFrame {
  scene: number;
  description: string;
  imageUrl: string;
}

export interface ParsedScene {
  scene: number;
  setting: string;
  characters: string[];
  action: string;
}
