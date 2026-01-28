
import React, { useState } from 'react';
import { Upload as UploadIcon, X, Image as ImageIcon, CheckCircle, AlertCircle } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
    const [video, setVideo] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [category, setCategory] = useState("Technology");
    const [visibility, setVisibility] = useState("public");

    const [isUploading, setIsUploading] = useState(false);
    const [uploadPerc, setUploadPerc] = useState(0);
    const [status, setStatus] = useState("idle"); // idle, uploading, processing, success, error

    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleFileChange = (e, setFile) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const uploadToCloudinary = async (file, resourceType = 'auto') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'developeer'); // User provided preset
        formData.append('cloud_name', 'da8dgsbfn'); // User provided cloud name

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/da8dgsbfn/${resourceType}/upload`, {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error?.message || 'Upload failed');
            }

            const data = await res.json();
            return data.secure_url;
        } catch (error) {
            console.error("Cloudinary Upload Error:", error);
            throw error;
        }
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title || !video) return alert("Please select a video and title");
        if (!currentUser) return alert("Please sign in first");

        setIsUploading(true);
        setStatus("uploading");
        setUploadPerc(0);

        // Fake progress for Cloudinary (since fetch doesn't support progress easily without XHR/Axios)
        // For a better experience we could use axios, but keeping it dependency-free for now
        const progressInterval = setInterval(() => {
            setUploadPerc((prev) => {
                if (prev >= 90) return 90;
                return prev + 10;
            });
        }, 1000);

        try {
            // Parallel Uploads
            const videoPromise = uploadToCloudinary(video, 'video');
            const thumbnailPromise = thumbnail
                ? uploadToCloudinary(thumbnail, 'image')
                : Promise.resolve("https://picsum.photos/400/225");

            const [videoUrl, thumbnailUrl] = await Promise.all([videoPromise, thumbnailPromise]);

            clearInterval(progressInterval);
            setUploadPerc(100);
            setStatus("processing");

            // Add to Firestore
            await addDoc(collection(db, "videos"), {
                title: title,
                description: desc,
                category: category,
                visibility: visibility,
                videoUrl: videoUrl,
                thumbnailUrl: thumbnailUrl,
                uploader: currentUser.displayName || "Unknown User",
                userId: currentUser.uid,
                views: 0,
                likes: 0,
                dislikes: 0,
                uploadDate: serverTimestamp()
            });

            setStatus("success");
            setTimeout(() => navigate('/'), 2000);

        } catch (err) {
            clearInterval(progressInterval);
            console.error("Upload failed:", err);
            alert("Upload failed: " + err.message);
            setStatus("error");
            setIsUploading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-[#0F0F0F] z-50 flex items-center justify-center p-4 overflow-y-auto">
            <div className="bg-[#1F1F1F] w-full max-w-4xl rounded-xl shadow-2xl border border-[#303030] flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-[#303030]">
                    <h1 className="text-xl font-bold text-white">Upload Video</h1>
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white"><X /></button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col lg:flex-row gap-8">
                    {/* Left: File Selection */}
                    <div className="lg:w-1/3 flex flex-col gap-6">
                        {/* Video Input */}
                        <div className="aspect-video bg-[#0F0F0F] rounded-lg border-2 border-dashed border-[#303030] flex flex-col items-center justify-center relative hover:border-blue-500 transition-colors group">
                            {video ? (
                                <div className="text-center p-4">
                                    <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-2" />
                                    <p className="text-sm text-white font-medium truncate max-w-[200px]">{video.name}</p>
                                    <p className="text-xs text-gray-500">{(video.size / (1024 * 1024)).toFixed(2)} MB</p>
                                    <button onClick={() => setVideo(null)} className="text-red-400 text-xs mt-2 hover:underline">Remove</button>
                                </div>
                            ) : (
                                <>
                                    <UploadIcon className="w-10 h-10 text-gray-500 group-hover:text-blue-500 mb-2" />
                                    <p className="text-gray-400 text-sm font-medium">Select Video</p>
                                    <input type="file" accept="video/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileChange(e, setVideo)} />
                                </>
                            )}
                        </div>

                        {/* Thumbnail Input */}
                        <div className="bg-[#0F0F0F] rounded-lg border border-[#303030] p-4">
                            <label className="text-sm text-gray-400 mb-2 block font-medium">Thumbnail</label>
                            <div className="flex items-center gap-4">
                                <div className="w-16 h-9 bg-[#272727] rounded overflow-hidden flex items-center justify-center">
                                    {thumbnail ? (
                                        <img src={URL.createObjectURL(thumbnail)} alt="Thumb" className="w-full h-full object-cover" />
                                    ) : (
                                        <ImageIcon className="w-5 h-5 text-gray-600" />
                                    )}
                                </div>
                                <div className="flex-1 relative">
                                    <p className="text-xs text-gray-500 mb-1">{thumbnail ? thumbnail.name : "Upload a cover image"}</p>
                                    <label className="text-blue-400 text-xs font-medium cursor-pointer hover:underline">
                                        Select Image
                                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileChange(e, setThumbnail)} />
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Details Form */}
                    <form onSubmit={handleUpload} className="flex-1 flex flex-col gap-5">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-400 font-medium">Title (Required)</label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Video title"
                                className="bg-[#0F0F0F] border border-[#303030] rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none"
                            />
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-400 font-medium">Description</label>
                            <textarea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                placeholder="Tell viewers about your video"
                                rows="4"
                                className="bg-[#0F0F0F] border border-[#303030] rounded-lg px-4 py-2.5 text-white focus:border-blue-500 outline-none resize-none"
                            />
                        </div>

                        <div className="flex gap-4">
                            <div className="flex-1 flex flex-col gap-1">
                                <label className="text-sm text-gray-400 font-medium">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="bg-[#0F0F0F] border border-[#303030] rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                >
                                    <option>Technology</option>
                                    <option>Education</option>
                                    <option>Entertainment</option>
                                    <option>Gaming</option>
                                    <option>Music</option>
                                    <option>News</option>
                                    <option>Sports</option>
                                </select>
                            </div>
                            <div className="flex-1 flex flex-col gap-1">
                                <label className="text-sm text-gray-400 font-medium">Visibility</label>
                                <select
                                    value={visibility}
                                    onChange={(e) => setVisibility(e.target.value)}
                                    className="bg-[#0F0F0F] border border-[#303030] rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500"
                                >
                                    <option value="public">Public</option>
                                    <option value="unlisted">Unlisted</option>
                                    <option value="private">Private</option>
                                </select>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-[#303030] flex items-center justify-between bg-[#0F0F0F] rounded-b-xl">
                    {/* Status / Progress */}
                    <div className="flex-1 mr-6">
                        {status === 'uploading' && (
                            <div>
                                <div className="flex justify-between text-xs text-gray-400 mb-1">
                                    <span>Uploading...</span>
                                    <span>{uploadPerc}%</span>
                                </div>
                                <div className="w-full bg-gray-700 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-blue-600 h-full transition-all duration-300" style={{ width: `${uploadPerc}%` }}></div>
                                </div>
                            </div>
                        )}
                        {status === 'processing' && <p className="text-sm text-yellow-500 animate-pulse">Processing video...</p>}
                        {status === 'success' && <p className="text-sm text-green-500 flex items-center gap-1"><CheckCircle className="w-4 h-4" /> Upload Complete!</p>}
                        {status === 'error' && <p className="text-sm text-red-500 flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Upload Failed</p>}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="px-4 py-2 text-gray-300 font-medium hover:text-white"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpload}
                            disabled={isUploading || !video || !title}
                            className={`px-6 py-2 rounded-full font-medium text-white transition-all ${isUploading || !video || !title
                                ? 'bg-gray-700 cursor-not-allowed text-gray-500'
                                : 'bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-900/20'
                                }`}
                        >
                            {isUploading ? 'Uploading...' : 'Upload Video'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Upload;
