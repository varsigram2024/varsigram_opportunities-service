import express from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import prisma from "./utils/prisma";

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

app.post('/api/v1/opportunities', async (req,res) => {
try {
    const {title, description, category, location, isRemote, createdBy} = req.body
    const opportunity = await prisma.opportunity.create({
        data: {
            title,
            description,
            category, 
            location,
            isRemote: isRemote || false,
            createdBy  //this requires a UUID to indentify the user..
        }

    })
    res.status(201).json({
        message: 'opportunity created successfully',
        data: opportunity
    })
} catch (err: any) {
    console.error('Error creating opportunities', err)
    res.status(400).json({
        error: 'Failed to creat client',
        details: err.message || 'Unknown err'
    })
}
})

app.get('/api/v1/opportunities', async (req,res)=> {
    try {
        const opportunities = await prisma.opportunity.findMany({
            orderBy: {createdAt: 'desc'}
        })
        res.json({
            message: 'Opportunities fetched successfully!',
            data: opportunities,
            count: opportunities.length
        })
    } catch (err: any) {
        console.error('Error fetching opportunities', err)
        res.status(400).json({
            error: err.message || 'Failed to fetch'
        })
    }
})

app.use( (req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

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