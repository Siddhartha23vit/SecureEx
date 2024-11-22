import { FileShare } from '../types';

const STORAGE_KEY = 'secure_ex_files';

export const saveFiles = (files: FileShare[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(files));
};

export const loadFiles = (): FileShare[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const addSharedFile = (file: FileShare) => {
  const files = loadFiles();
  const existingFileIndex = files.findIndex(f => f.cid === file.cid);
  
  if (existingFileIndex >= 0) {
    files[existingFileIndex] = file;
  } else {
    files.push(file);
  }
  
  saveFiles(files);
};