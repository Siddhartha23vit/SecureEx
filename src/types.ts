export interface FileShare {
  cid: string;
  name: string;
  sharedBy: string;
  sharedTo: string;
  timestamp: number;
}

export interface FileMetadata {
  name: string;
  cid: string;
  owner: string;
  sharedWith: string[];
}