// src/types/express/index.d.ts

import { User } from "./types/user";

// to make the file a module and avoid the TypeScript error
export {};

declare global {
  namespace Express {
    export interface Request {
      appUser?: { id: string; kcid: string; name: string; email: string };
    }
  }
}
