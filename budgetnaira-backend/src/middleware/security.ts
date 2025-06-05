import express from 'express';
import hpp from 'hpp';
import helmet from 'helmet';
// @ts-ignore
import xss from 'xss-clean';
import cors from 'cors';
import mongoSanitize from 'express-mongo-sanitize';

export const configSecurity = (app: express.Application) => {
  // Set security headers
  app.use(helmet());
  
  // Prevent XSS attacks
  app.use(xss());
  
  // Prevent parameter pollution
  app.use(hpp());
  
  // Sanitize data to prevent NoSQL injection
  app.use(mongoSanitize());
  
  // Enable CORS with specific options
  app.use(cors({
    origin: process.env.NODE_ENV === 'production'
      ? [process.env.FRONTEND_URL || 'https://budgetnaira.com']
      : '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
    maxAge: 86400 // 24 hours
  }));
  
  // Content Security Policy
  if (process.env.NODE_ENV === 'production') {
    app.use(
      helmet.contentSecurityPolicy({
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'"],
          styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
          fontSrc: ["'self'", 'https://fonts.gstatic.com'],
          imgSrc: ["'self'", 'data:'],
          connectSrc: ["'self'"]
        }
      })
    );
  }
  
  return app;
};