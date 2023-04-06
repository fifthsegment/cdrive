export const isFolder = (obj) => obj && obj.type === 'folder';
export const isFile = (obj) => obj && obj.type === 'file';

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
