import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Video from './models/Video.js';

dotenv.config();

const sampleVideos = [
    {
        title: "Build a YouTube Clone with React & Node.js",
        description: "Learn how to build a full-stack YouTube clone using the MERN stack.",
        thumbnailUrl: "https://picsum.photos/id/1/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 12000,
        uploader: "Code Master",
        duration: "10:35"
    },
    {
        title: "Top 10 Programming Languages in 2026",
        description: "What should you learn in 2026? Here are the top languages.",
        thumbnailUrl: "https://picsum.photos/id/2/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 50000,
        uploader: "Tech Guru",
        duration: "15:20"
    },
    {
        title: "Chill Lofi Beats to Code/Relax To",
        description: "Best music for coding.",
        thumbnailUrl: "https://picsum.photos/id/3/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 890000,
        uploader: "Lofi Girl",
        duration: "1:00:00"
    },
    {
        title: "React vs Vue vs Angular - Which one is best?",
        description: "Comparison of frontend frameworks.",
        thumbnailUrl: "https://picsum.photos/id/4/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 3400,
        uploader: "Frontend Wizard",
        duration: "8:45"
    },
    {
        title: "100 Days of Code Challenge",
        description: "My journey through 100 days of coding.",
        thumbnailUrl: "https://picsum.photos/id/5/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 1200,
        uploader: "Newbie Coder",
        duration: "5:00"
    },
    {
        title: "Exploring the Metaverse",
        description: "Is it still a thing? Let's find out.",
        thumbnailUrl: "https://picsum.photos/id/6/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 45000,
        uploader: "Future Tech",
        duration: "20:10"
    },
    {
        title: "How to fail at coding interviews",
        description: "Don't do this.",
        thumbnailUrl: "https://picsum.photos/id/7/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 99000,
        uploader: "Career Coach",
        duration: "12:30"
    },
    {
        title: "My setup tour 2026",
        description: "Check out my new gear.",
        thumbnailUrl: "https://picsum.photos/id/8/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 4500,
        uploader: "Tech Minimalist",
        duration: "9:15"
    }
];

mongoose.connect('mongodb://localhost:27017/youtube-lite')
    .then(async () => {
        console.log('Connected to MongoDB');
        await Video.deleteMany({});
        await Video.insertMany(sampleVideos);
        console.log('Data seeded!');
        mongoose.disconnect();
    })
    .catch((err) => {
        console.error(err);
        mongoose.disconnect();
    });
