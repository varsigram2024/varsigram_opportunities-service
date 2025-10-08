import express from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import prisma from "./utils/prisma";
import opportunitiesRoutes from "./routes/opportunities.routes";
import internshipsRoutes from "./routes/internships.routes";
import scholarshipsRoutes from "./routes/scholarships.routes";
import { errorHandler } from "./middleware/errorHandler";

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3000

app.use(express.json())
app.use(cors())

app.get('/health', async (req,res) => {


    res.json({
        status: 'OK',
        service: 'Opportunities-service',
        timestamp: new Date().toISOString()
         
    })
})

app.use(opportunitiesRoutes)
app.use(internshipsRoutes)
app.use(scholarshipsRoutes)

app.use( (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

app.use(errorHandler)

app.listen(PORT, async () => {
  console.log(`Server running on http://localhost:${PORT}`);

  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log('Database connected successfully');
  } catch (error) {
    if (error instanceof Error) {
      console.error('Database connection failed:', error.message);
    } else {
      console.error('Database connection failed:', error);
    }
    console.error('Please check your DATABASE_URL in .env file');
  }

  console.log(`Health check: http://localhost:${PORT}/health`);
});

export default app;