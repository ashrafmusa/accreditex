// preload.js (ESM)
import { contextBridge } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
  getApiKey: () => process.env.API_KEY,
});
