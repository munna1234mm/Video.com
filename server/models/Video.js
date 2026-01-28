import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    thumbnailUrl: { type: String, required: true },
    videoUrl: { type: String, required: true },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    dislikes: { type: Number, default: 0 },
    uploader: { type: String, required: true },
    uploadDate: { type: Date, default: Date.now },
    duration: { type: String, required: true },
});

export default mongoose.model('Video', videoSchema);
