// src/middleware/validation.ts
import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

export function validateBody(schema: Joi.ObjectSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body);
    if (error) {
      console.log('Validation error:', error.details);
      res.status(400).json({ success: false, error: 'validation_error', message: error.message });
      return;
    }
    next();
  };
}
