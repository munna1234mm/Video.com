import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

const Upload = () => {
    const { currentUser } = useAuth();
    const navigate = useNavigate();
    const { addToast } = useToast();

    // Steps: 1=Details, 2=Video Elements, 3=Checks, 4=Visibility
    const [step, setStep] = useState(1);

    // Form Inputs
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnailFile, setThumbnailFile] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [visibility, setVisibility] = useState('public');
    const [audience, setAudience] = useState(null); // 'kids' | 'not-kids'
    const [category, setCategory] = useState("Technology");

    // Upload State
    const [uploadProgress, setUploadProgress] = useState(0);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, processing, success, fail

    // Previews
    const [videoPreview, setVideoPreview] = useState('');
    const [thumbnailPreview, setThumbnailPreview] = useState('');

    // Handle File Selection
    const handleVideoSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setVideoFile(file);
            setVideoPreview(URL.createObjectURL(file));
            // Auto start upload mock or real? 
            // The template implies background upload. We'll start "uploading" immediately in background simulation
            // In a real app we'd start the xhr request here. 
            // For this implementation, we'll keep the "Next" button logic but simulate background progress.
            startBackgroundUploadSimulation();
        }
    };

    const handleThumbnailSelect = (e) => {
        const file = e.target.files[0];
        if (file) {
            setThumbnailFile(file);
            setThumbnailPreview(URL.createObjectURL(file));
        }
    };

    const startBackgroundUploadSimulation = () => {
        setIsUploading(true);
        setUploadStatus('uploading');
        setUploadProgress(0);

        // Simulation interval
        const interval = setInterval(() => {
            setUploadProgress(prev => {
                if (prev >= 95) {
                    clearInterval(interval);
                    return 95; // Wait for final save
                }
                return prev + Math.random() * 5;
            });
        }, 800);
    };

    // Actual Upload Logic (Triggered on Final Save)
    const uploadToCloudinary = async (file, resourceType = 'auto') => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', 'developeer');
        formData.append('cloud_name', 'da8dgsbfn');

        const res = await fetch(`https://api.cloudinary.com/v1_1/da8dgsbfn/${resourceType}/upload`, {
            method: 'POST',
            body: formData,
        });

        if (!res.ok) throw new Error('Upload failed');
        return await res.json();
    };

    const handleFinalPublish = async () => {
        if (!videoFile || !title) return addToast("Title and Video are required", "error");

        setIsUploading(true);
        setUploadStatus('processing');
        setUploadProgress(98);

        try {
            // Real Upload
            const videoPromise = uploadToCloudinary(videoFile, 'video');
            const thumbnailPromise = thumbnailFile
                ? uploadToCloudinary(thumbnailFile, 'image')
                : Promise.resolve({ secure_url: "https://picsum.photos/400/225" });

            const [videoData, thumbnailData] = await Promise.all([videoPromise, thumbnailPromise]);

            // Format Duration
            const durationSec = Math.round(videoData.duration || 0);
            const formatDuration = (seconds) => {
                if (!seconds) return "00:00";
                const h = Math.floor(seconds / 3600);
                const m = Math.floor((seconds % 3600) / 60);
                const s = seconds % 60;
                return h > 0 ? `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}` : `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
            };

            await addDoc(collection(db, "videos"), {
                title,
                description,
                category,
                visibility,
                videoUrl: videoData.secure_url,
                thumbnailUrl: thumbnailData.secure_url,
                uploader: currentUser?.displayName || "Unknown User",
                userId: currentUser?.uid,
                userPhoto: currentUser?.photoURL || "",
                matchAudience: audience === 'kids', // Store audience pref
                views: 0,
                likes: 0,
                dislikes: 0,
                duration: formatDuration(durationSec),
                uploadDate: serverTimestamp()
            });

            setUploadProgress(100);
            setUploadStatus('success');
            addToast("Video published successfully!", "success");
            setTimeout(() => navigate('/'), 2000);

        } catch (error) {
            console.error("Publish Error:", error);
            setUploadStatus('fail');
            addToast("Failed to publish video", "error");
        }
    };

    // Navigation Handlers
    const handleNext = () => {
        if (step < 4) setStep(step + 1);
        else handleFinalPublish(); // Final step
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
        else navigate('/');
    };

    // Render Steps
    return (
        <div className="flex flex-col min-h-screen bg-[#f6f8f6] dark:bg-[#102216] text-slate-900 dark:text-white font-['Inter']">
            {/* Top Navigation Bar */}
            <header className="flex items-center justify-between border-b border-slate-200 dark:border-[#23482f] px-6 py-3 sticky top-0 bg-[#f6f8f6] dark:bg-[#102216] z-50">
                <div className="flex items-center gap-4">
                    <div className="size-8 text-[#13ec5b]">
                        <svg fill="none" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
                            <g clipPath="url(#clip0_6_330)">
                                <path clipRule="evenodd" d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z" fill="currentColor" fillRule="evenodd"></path>
                            </g>
                            <defs>
                                <clipPath id="clip0_6_330"><rect fill="white" height="48" width="48"></rect></clipPath>
                            </defs>
                        </svg>
                    </div>
                    <h2 className="text-lg font-bold leading-tight tracking-tight">Creator Studio</h2>
                </div>
                <div className="flex items-center gap-4">
                    <div className="hidden md:flex flex-col items-end mr-2">
                        <span className="text-xs font-semibold text-[#13ec5b]">Partner Program</span>
                        <span className="text-sm font-medium">Channel Dashboard</span>
                    </div>
                    <div className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10 border-2 border-[#13ec5b]/30"
                        style={{ backgroundImage: `url("${currentUser?.photoURL || 'https://via.placeholder.com/40'}")` }}></div>
                    <button onClick={() => navigate('/')} className="flex items-center justify-center rounded-lg h-10 w-10 bg-slate-200 dark:bg-[#23482f] text-white hover:bg-slate-300 dark:hover:bg-[#326744] transition-colors">
                        <span className="material-symbols-outlined text-slate-700 dark:text-white">close</span>
                    </button>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="flex-1 flex flex-col max-w-[1280px] mx-auto w-full px-4 md:px-10 py-6 pb-24">
                {/* Wizard Tabs */}
                <div className="mb-6">
                    <div className="flex border-b border-slate-200 dark:border-[#326744] overflow-x-auto no-scrollbar">
                        {['1. Details', '2. Video elements', '3. Checks', '4. Visibility'].map((label, idx) => {
                            const stepNum = idx + 1;
                            const isActive = step === stepNum;
                            const isCompleted = step > stepNum;

                            return (
                                <button
                                    key={label}
                                    onClick={() => isCompleted || isActive ? setStep(stepNum) : null}
                                    disabled={!isCompleted && !isActive}
                                    className={`flex flex-col items-center justify-center border-b-[3px] pb-[13px] pt-4 px-6 min-w-fit transition-colors 
                                        ${isActive ? 'border-b-[#13ec5b] text-slate-900 dark:text-white' : 'border-b-transparent text-slate-500 dark:text-[#92c9a4]'}`}
                                >
                                    <p className="text-sm font-bold leading-normal tracking-wide uppercase">{label}</p>
                                </button>
                            )
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                    {/* Left Column: Form Fields */}
                    <div className="lg:col-span-2 space-y-8 animate-fade-in">
                        {/* Step 1: Details */}
                        {step === 1 && (
                            <>
                                <h1 className="text-2xl md:text-3xl font-bold mb-4 px-2">Video details</h1>

                                <div className="flex flex-col gap-2">
                                    <label className="flex flex-col w-full group">
                                        <div className="flex justify-between items-center pb-2">
                                            <p className="text-slate-700 dark:text-white text-base font-semibold">Title (required)</p>
                                            <span className="text-xs text-slate-400">{title.length}/100</span>
                                        </div>
                                        <textarea
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#13ec5b]/50 border border-slate-300 dark:border-[#326744] bg-white dark:bg-[#193322] min-h-[80px] placeholder:text-slate-400 dark:placeholder:text-[#92c9a4] p-4 text-base"
                                            placeholder="Add a title that describes your video"
                                        ></textarea>
                                    </label>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="flex flex-col w-full">
                                        <div className="flex justify-between items-center pb-2">
                                            <p className="text-slate-700 dark:text-white text-base font-semibold">Description</p>
                                            <span className="text-xs text-slate-400">{description.length}/5000</span>
                                        </div>
                                        <textarea
                                            value={description}
                                            onChange={(e) => setDescription(e.target.value)}
                                            className="w-full resize-none overflow-hidden rounded-lg text-slate-900 dark:text-white focus:outline-0 focus:ring-2 focus:ring-[#13ec5b]/50 border border-slate-300 dark:border-[#326744] bg-white dark:bg-[#193322] min-h-[160px] placeholder:text-slate-400 dark:placeholder:text-[#92c9a4] p-4 text-base"
                                            placeholder="Tell viewers about your video"
                                        ></textarea>
                                    </label>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <h3 className="text-base font-semibold">Thumbnail</h3>
                                        <p className="text-sm text-slate-500 dark:text-[#92c9a4]">Select or upload a picture that shows what's in your video.</p>
                                    </div>
                                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                        <label className="cursor-pointer aspect-video rounded-lg border-2 border-dashed border-slate-300 dark:border-[#326744] flex flex-col items-center justify-center gap-2 bg-slate-50 dark:bg-[#193322] hover:border-[#13ec5b] transition-colors relative overflow-hidden group">
                                            {thumbnailPreview ? (
                                                <img src={thumbnailPreview} alt="Preview" className="w-full h-full object-cover absolute inset-0" />
                                            ) : (
                                                <>
                                                    <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
                                                    <span className="text-xs font-medium">Upload thumbnail</span>
                                                </>
                                            )}
                                            <input type="file" accept="image/*" className="hidden" onChange={handleThumbnailSelect} />
                                            {thumbnailPreview && (
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                    <span className="text-white text-xs font-bold">Change</span>
                                                </div>
                                            )}
                                        </label>
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="aspect-video rounded-lg bg-slate-200 dark:bg-[#23482f] animate-pulse flex items-center justify-center text-xs text-slate-500 dark:text-slate-400">
                                                Auto-gen #{i}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <h3 className="text-base font-semibold">Audience</h3>
                                        <p className="text-xs font-medium text-slate-700 dark:text-white uppercase tracking-wider">Is this video made for kids? (required)</p>
                                    </div>
                                    <div className="space-y-3">
                                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23482f] transition-colors">
                                            <input
                                                type="radio"
                                                name="audience"
                                                checked={audience === 'kids'}
                                                onChange={() => setAudience('kids')}
                                                className="w-5 h-5 text-[#13ec5b] border-[#326744] bg-[#193322] focus:ring-[#13ec5b]"
                                            />
                                            <span className="text-sm">Yes, it's made for kids</span>
                                        </label>
                                        <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-slate-100 dark:hover:bg-[#23482f] transition-colors">
                                            <input
                                                type="radio"
                                                name="audience"
                                                checked={audience === 'not-kids'}
                                                onChange={() => setAudience('not-kids')}
                                                className="w-5 h-5 text-[#13ec5b] border-[#326744] bg-[#193322] focus:ring-[#13ec5b]"
                                            />
                                            <span className="text-sm">No, it's not made for kids</span>
                                        </label>
                                    </div>
                                </div>
                            </>
                        )}

                        {/* Step 2: Video Elements (Placeholder) */}
                        {step === 2 && (
                            <div className="text-center py-20">
                                <span className="material-symbols-outlined text-6xl text-slate-300 dark:text-[#326744] mb-4">subtitles</span>
                                <h3 className="text-xl font-bold mb-2">Video Elements</h3>
                                <p className="text-slate-500 dark:text-[#92c9a4]">Add subtitles, end screen, and cards here (Coming Soon).</p>
                            </div>
                        )}

                        {/* Step 3: Checks (Placeholder) */}
                        {step === 3 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold">Checks</h3>
                                <div className="p-4 rounded-lg bg-slate-50 dark:bg-[#193322] border border-slate-200 dark:border-[#326744]">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-semibold flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">copyright</span>
                                            Copyright
                                        </span>
                                        <span className="text-xs text-slate-500 dark:text-[#92c9a4]">No issues found</span>
                                    </div>
                                    <p className="text-xs text-slate-500">We'll check your video for potential copyright issues.</p>
                                </div>
                            </div>
                        )}

                        {/* Step 4: Visibility */}
                        {step === 4 && (
                            <div className="space-y-6">
                                <h3 className="text-xl font-bold">Visibility</h3>
                                <div className="p-6 rounded-lg bg-slate-50 dark:bg-[#193322] border border-slate-200 dark:border-[#326744] space-y-4">
                                    <div className="space-y-1">
                                        <h4 className="font-semibold">Save or publish</h4>
                                        <p className="text-xs text-slate-500 dark:text-[#92c9a4]">Make your video public, unlisted, or private</p>
                                    </div>

                                    <div className="space-y-3 pl-2">
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="visibility"
                                                value="private"
                                                checked={visibility === 'private'}
                                                onChange={(e) => setVisibility(e.target.value)}
                                                className="mt-1 w-4 h-4 text-[#13ec5b] bg-[#193322] border-[#326744] focus:ring-[#13ec5b]"
                                            />
                                            <div>
                                                <span className="text-sm font-medium block group-hover:text-[#13ec5b] transition-colors">Private</span>
                                                <span className="text-xs text-slate-500 block">Only you and people you choose can watch your video</span>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="visibility"
                                                value="unlisted"
                                                checked={visibility === 'unlisted'}
                                                onChange={(e) => setVisibility(e.target.value)}
                                                className="mt-1 w-4 h-4 text-[#13ec5b] bg-[#193322] border-[#326744] focus:ring-[#13ec5b]"
                                            />
                                            <div>
                                                <span className="text-sm font-medium block group-hover:text-[#13ec5b] transition-colors">Unlisted</span>
                                                <span className="text-xs text-slate-500 block">Anyone with the video link can watch your video</span>
                                            </div>
                                        </label>
                                        <label className="flex items-start gap-3 cursor-pointer group">
                                            <input
                                                type="radio"
                                                name="visibility"
                                                value="public"
                                                checked={visibility === 'public'}
                                                onChange={(e) => setVisibility(e.target.value)}
                                                className="mt-1 w-4 h-4 text-[#13ec5b] bg-[#193322] border-[#326744] focus:ring-[#13ec5b]"
                                            />
                                            <div>
                                                <span className="text-sm font-medium block group-hover:text-[#13ec5b] transition-colors">Public</span>
                                                <span className="text-xs text-slate-500 block">Everyone can watch your video</span>
                                            </div>
                                        </label>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Sticky Preview */}
                    <div className="lg:col-span-1 hidden lg:block">
                        <div className="sticky top-24 space-y-4">
                            {/* Video Preview Card */}
                            <div className="bg-white dark:bg-[#193322] rounded-xl overflow-hidden shadow-xl border border-slate-200 dark:border-[#326744]">
                                {!videoFile ? (
                                    <label className="aspect-video bg-black flex flex-col items-center justify-center cursor-pointer hover:bg-black/80 transition-colors gap-2">
                                        <span className="material-symbols-outlined text-4xl text-slate-500">upload_file</span>
                                        <span className="text-xs text-slate-400">Select Video File</span>
                                        <input type="file" accept="video/*" className="hidden" onChange={handleVideoSelect} />
                                    </label>
                                ) : (
                                    <div className="aspect-video bg-black relative flex items-center justify-center group">
                                        <div className="absolute inset-0 bg-cover bg-center opacity-40"
                                            style={{ backgroundImage: thumbnailPreview ? `url('${thumbnailPreview}')` : 'none' }}></div>
                                        <button className="z-10 bg-black/50 hover:bg-black/70 rounded-full p-4 transition-all">
                                            <span className="material-symbols-outlined text-4xl text-white">play_arrow</span>
                                        </button>
                                    </div>
                                )}

                                <div className="p-4 space-y-4">
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-[#92c9a4] uppercase font-bold tracking-tight">Video link</p>
                                        <div className="flex items-center justify-between mt-1">
                                            <a className="text-blue-500 dark:text-[#13ec5b] text-sm font-medium hover:underline truncate mr-2" href="#">https://youtu.be/...</a>
                                            <button className="p-1 hover:bg-slate-100 dark:hover:bg-[#23482f] rounded transition-colors text-slate-400 hover:text-white">
                                                <span className="material-symbols-outlined text-xl">content_copy</span>
                                            </button>
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-500 dark:text-[#92c9a4] uppercase font-bold tracking-tight">File name</p>
                                        <p className="text-sm mt-1 truncate font-medium text-slate-700 dark:text-white">{videoFile ? videoFile.name : 'No file selected'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Bottom Progress Footer */}
            <footer className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#112217] border-t border-slate-200 dark:border-[#23482f] px-6 py-4 z-50">
                <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="flex flex-col flex-1 md:flex-none md:min-w-[200px]">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-semibold flex items-center gap-2">
                                    <span className={`material-symbols-outlined text-[#13ec5b] text-base ${isUploading && uploadStatus === 'uploading' ? 'animate-spin' : ''}`}>
                                        {uploadStatus === 'success' ? 'check_circle' : 'upload'}
                                    </span>
                                    {uploadStatus === 'idle' ? 'Ready to upload' : uploadStatus === 'uploading' ? 'Uploading...' : uploadStatus === 'success' ? 'Upload Complete' : 'Processing...'}
                                </span>
                                <span className="text-sm font-medium">{Math.round(uploadProgress)}%</span>
                            </div>
                            <div className="w-full h-1.5 bg-slate-200 dark:bg-[#23482f] rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-[#13ec5b] transition-all duration-500 ease-out"
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                        <button
                            onClick={handleBack}
                            className="px-6 py-2 rounded-lg font-bold text-sm text-slate-700 dark:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        >
                            {step === 1 ? 'CANCEL' : 'BACK'}
                        </button>
                        <button
                            onClick={handleNext}
                            disabled={!videoFile || !title}
                            className={`px-8 py-2 rounded-lg font-bold text-sm shadow-lg transition-all 
                                ${!videoFile || !title ? 'bg-slate-300 dark:bg-[#23482f] text-slate-500 cursor-not-allowed' : 'bg-[#13ec5b] hover:bg-[#13ec5b]/90 text-[#102216] shadow-[#13ec5b]/20'}`}
                        >
                            {step === 4 ? 'PUBLISH' : 'NEXT'}
                        </button>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default Upload;
