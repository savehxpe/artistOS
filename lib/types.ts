export interface Task {
  id: string;
  text: string;
  phase: string;
  completed: boolean;
  dueDate: string;
}

export interface VaultItem {
  id: string;
  name: string;
  type: string;
  url: string;
  createdAt?: any; // Firestore Timestamp
  metadata?: {
    tempo: number;
    energy: string;
    danceability: string;
  };
}

export interface UserSettings {
  onboardingComplete?: boolean;
  phase?: string;
  youtubeAccessToken?: string;
  growthLinks?: {
    spotify?: string;
    youtube?: string;
  };
}

export interface SpotifyStats {
  followers?: { total: number };
  popularity: number;
  name: string;
}

export interface YouTubeStats {
  subscribers: string;
  views: string;
  videos: string;
  id?: string;
}

export interface UserStats {
  spotify: SpotifyStats | null;
  youtube: YouTubeStats | null;
}

export interface Contract {
  id: string;
  title: string;
  category: "Split-Sheet" | "Sync License" | "Management Agreement" | "Work For Hire";
  parties: string;
  createdAt: any;
  status: "Executed" | "Pending";
  documentUrl?: string;
}
