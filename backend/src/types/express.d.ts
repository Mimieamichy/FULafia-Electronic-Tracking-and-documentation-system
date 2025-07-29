// src/types/express.d.ts
import { Request } from 'express';
import { File } from 'multer';

declare module 'express-serve-static-core' {
  interface Request {
    user?: {
      id: string;
      permissions: string[];
      role: string[];
    };
    file?: File;
    files?: File[];
  }
}