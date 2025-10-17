import express from "express";
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import prisma from "./utils/prisma";
import apiRoutes from './routes';
import { errorHandler, notFoundHandler } from './utils/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security & Performance Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Logging in development
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.get('/health', async (req,res) => {


    res.json({
        status: 'OK',
        service: 'Opportunities-service',
        timestamp: new Date().toISOString()
         
    })
})


app.use('/api/v1', apiRoutes);

// 404 handler - must come after all valid routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

// Start server with database connection test
app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Test database connection on startup
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('✅ Database connected successfully');
  } catch (error: any) {
    console.error('❌ Database connection failed:', error.message);
    console.error('Please check your DATABASE_URL in .env file');
  }
  
  console.log(`📋 Health check: http://localhost:${PORT}/health`);
  console.log(`📝 API docs: http://localhost:${PORT}/api/v1`);
});

export default app;