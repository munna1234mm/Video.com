import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import videoRoutes from './routes/videos.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/youtube-lite';

app.use(cors());
app.use(express.json());

app.use('/api/videos', videoRoutes);

mongoose.connect(MONGO_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

app.get('/', (req, res) => {
  res.send('YouTube Lite API is running');
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
