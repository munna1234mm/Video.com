import Video from '../models/Video.js';

// Mock Data for Fallback
const MOCK_VIDEOS = [
    {
        _id: '1',
        title: "Build a YouTube Clone with React & Node.js",
        description: "Learn how to build a full-stack YouTube clone using the MERN stack.",
        thumbnailUrl: "https://picsum.photos/id/1/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 12000,
        uploader: "Code Master",
        uploadDate: new Date(),
        duration: "10:35"
    },
    {
        _id: '2',
        title: "Top 10 Programming Languages in 2026",
        description: "What should you learn in 2026? Here are the top languages.",
        thumbnailUrl: "https://picsum.photos/id/2/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 50000,
        uploader: "Tech Guru",
        uploadDate: new Date(),
        duration: "15:20"
    },
    {
        _id: '3',
        title: "Chill Lofi Beats to Code/Relax To",
        description: "Best music for coding.",
        thumbnailUrl: "https://picsum.photos/id/3/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 890000,
        uploader: "Lofi Girl",
        uploadDate: new Date(),
        duration: "1:00:00"
    },
    {
        _id: '4',
        title: "React vs Vue vs Angular - Which one is best?",
        description: "Comparison of frontend frameworks.",
        thumbnailUrl: "https://picsum.photos/id/4/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 3400,
        uploader: "Frontend Wizard",
        uploadDate: new Date(),
        duration: "8:45"
    },
    {
        _id: '5',
        title: "100 Days of Code Challenge",
        description: "My journey through 100 days of coding.",
        thumbnailUrl: "https://picsum.photos/id/5/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 1200,
        uploader: "Newbie Coder",
        uploadDate: new Date(),
        duration: "5:00"
    },
    {
        _id: '6',
        title: "Exploring the Metaverse",
        description: "Is it still a thing? Let's find out.",
        thumbnailUrl: "https://picsum.photos/id/6/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 45000,
        uploader: "Future Tech",
        uploadDate: new Date(),
        duration: "20:10"
    },
    {
        _id: '7',
        title: "How to fail at coding interviews",
        description: "Don't do this.",
        thumbnailUrl: "https://picsum.photos/id/7/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 99000,
        uploader: "Career Coach",
        uploadDate: new Date(),
        duration: "12:30"
    },
    {
        _id: '8',
        title: "My setup tour 2026",
        description: "Check out my new gear.",
        thumbnailUrl: "https://picsum.photos/id/8/640/360",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        views: 4500,
        uploader: "Tech Minimalist",
        uploadDate: new Date(),
        duration: "9:15"
    }
];

export const getVideos = async (req, res) => {
    try {
        const videos = await Video.find().sort({ uploadDate: -1 });
        res.status(200).json(videos);
    } catch (err) {
        console.warn("Database fetch failed, returning mock data:", err.message);
        res.status(200).json(MOCK_VIDEOS);
    }
};

export const getVideo = async (req, res) => {
    try {
        const video = await Video.findById(req.params.id);
        if (!video) {
            // Fallback to mock find
            const mockVideo = MOCK_VIDEOS.find(v => v._id === req.params.id);
            if (mockVideo) return res.status(200).json(mockVideo);
            return res.status(404).json({ message: "Video not found" });
        }
        res.status(200).json(video);
    } catch (err) {
        // Fallback to mock find on error (e.g. invalid ID format or DB down)
        const mockVideo = MOCK_VIDEOS.find(v => v._id === req.params.id);
        if (mockVideo) return res.status(200).json(mockVideo);

        // If mock video not found either, check if we can return a random one for demo?
        // Just return first mock video for any ID to make demo robust
        if (MOCK_VIDEOS.length > 0) return res.status(200).json(MOCK_VIDEOS[0]);

        res.status(500).json({ message: err.message });
    }
};

export const searchVideos = async (req, res) => {
    const query = req.query.q;
    try {
        const videos = await Video.find({
            title: { $regex: query, $options: "i" }
        }).limit(20);
        res.status(200).json(videos);
    } catch (err) {
        // Filter mock data
        const filtered = MOCK_VIDEOS.filter(v => v.title.toLowerCase().includes(query.toLowerCase()));
        res.status(200).json(filtered);
    }
}
