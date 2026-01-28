import React, { useState } from 'react';
import { Upload as UploadIcon, Loader2 } from 'lucide-react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db, storage } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Upload = () => {
    const [video, setVideo] = useState(null);
    const [thumbnail, setThumbnail] = useState(null); // Simple file input
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [isUploading, setIsUploading] = useState(false);
    const [uploadPerc, setUploadPerc] = useState(0);
    const { currentUser } = useAuth();
    const navigate = useNavigate();

    const handleUpload = async (e) => {
        e.preventDefault();
        if (!title || !video) return alert("Please select a video and title");
        if (!currentUser) return alert("Please sign in first");

        setIsUploading(true);

        try {
            // 1. Upload Video
            // Using a unique name: folder/timestamp-filename
            const videoRef = ref(storage, `videos/${Date.now()}-${video.name}`);
            const uploadTask = uploadBytesResumable(videoRef, video);

            uploadTask.on('state_changed',
                (snapshot) => {
                    const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                    setUploadPerc(Math.round(progress));
                },
                (error) => {
                    console.error("Upload failed", error);
                    setIsUploading(false);
                    alert("Upload failed: " + error.message);
                },
                async () => {
                    // Upload completed successfully
                    const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);

                    // 2. Add to Firestore
                    await addDoc(collection(db, "videos"), {
                        title: title,
                        description: desc,
                        videoUrl: downloadURL,
                        thumbnailUrl: "https://picsum.photos/400/225", // Mock thumbnail for now or implement image upload same way
                        uploader: currentUser.displayName || currentUser.email,
                        items: [],
                        views: 0,
                        likes: 0,
                        dislikes: 0,
                        uploadDate: serverTimestamp(),
                        userId: currentUser.uid
                    });

                    setIsUploading(false);
                    navigate('/'); // Go home after upload
                }
            );

        } catch (err) {
            console.error(err);
            setIsUploading(false);
        }
    };

    return (
        <div className="w-full min-h-screen flex justify-center items-center p-4">
            <div className="bg-[#1e1e1e] p-8 rounded-xl shadow-2xl w-full max-w-lg border border-[#303030]">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-white">Upload Video</h1>
                    <button onClick={() => navigate('/')} className="text-gray-400 hover:text-white">X</button>
                </div>

                <form className="flex flex-col gap-5" onSubmit={handleUpload}>
                    {/* Video File Input */}
                    <div className="border-2 border-dashed border-[#303030] rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-[#252525] transition-colors relative">
                        <input
                            type="file"
                            accept="video/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => setVideo(e.target.files[0])}
                        />
                        <UploadIcon className="w-10 h-10 text-gray-500 mb-2" />
                        <p className="text-gray-400 text-sm">
                            {video ? `Selected: ${video.name}` : "Drag and drop video files to upload"}
                        </p>
                    </div>

                    {/* Progress Bar */}
                    {isUploading && (
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadPerc}%` }}></div>
                            <div className="text-right text-xs text-blue-400 mt-1">{uploadPerc}%</div>
                        </div>
                    )}

                    <input
                        type="text"
                        placeholder="Title"
                        className="bg-[#121212] border border-[#303030] p-3 rounded text-white focus:outline-none focus:border-blue-500"
                        onChange={(e) => setTitle(e.target.value)}
                    />

                    <textarea
                        rows={4}
                        placeholder="Description"
                        className="bg-[#121212] border border-[#303030] p-3 rounded text-white focus:outline-none focus:border-blue-500"
                        onChange={(e) => setDesc(e.target.value)}
                    />

                    <button
                        type="submit"
                        disabled={isUploading}
                        className="bg-blue-600 text-white py-3 rounded font-bold hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex justify-center"
                    >
                        {isUploading ? <Loader2 className="animate-spin" /> : "Upload"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default Upload;
