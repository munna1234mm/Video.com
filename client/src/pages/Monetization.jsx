import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { db } from '../firebase';
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore';
import { Loader2 } from 'lucide-react';

const Monetization = () => {
    const { currentUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [subscriberCount, setSubscriberCount] = useState(0);
    // Determine status
    const subsRequired = 1000;
    const hoursRequired = 4000;

    // Mocking watch hours for now as we don't strictly track duration-watched per user session in a queryable way easily yet
    // But we store 'views'. We can estimate.
    const [watchHours, setWatchHours] = useState(0);

    useEffect(() => {
        if (!currentUser) return;

        const fetchData = async () => {
            try {
                // 1. Get Subscriber Count
                const userRef = doc(db, "users", currentUser.uid);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                    setSubscriberCount(userSnap.data().subscribers || 0);
                }

                // 2. Calculate "Public Watch Hours" logic
                // Fetch all videos by current user
                const q = query(collection(db, "videos"), where("userId", "==", currentUser.uid));
                const videoSnaps = await getDocs(q);

                let totalSeconds = 0;
                videoSnaps.forEach(doc => {
                    const data = doc.data();
                    const views = data.views || 0;
                    // Assume average watch time is 40% of duration? Or full duration? 
                    // Let's parse duration "MM:SS" or "HH:MM:SS"
                    const durationStr = data.duration || "00:00";
                    const parts = durationStr.split(':').map(Number);
                    let durationSec = 0;
                    if (parts.length === 3) durationSec = parts[0] * 3600 + parts[1] * 60 + parts[2];
                    else if (parts.length === 2) durationSec = parts[0] * 60 + parts[1];

                    // Simple heuristic: Total potential watch time = views * duration (optimistic)
                    totalSeconds += (views * durationSec);
                });

                // Convert to hours
                setWatchHours(Math.floor(totalSeconds / 3600));

            } catch (err) {
                console.error("Error fetching monetization data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [currentUser]);

    if (!currentUser) return <div className="p-10 text-white text-center">Please sign in to view monetization status.</div>;
    if (loading) return <div className="flex justify-center mt-20"><Loader2 className="animate-spin text-white w-10 h-10" /></div>;

    const subProgress = Math.min(100, (subscriberCount / subsRequired) * 100);
    const hoursProgress = Math.min(100, (watchHours / hoursRequired) * 100);

    // Calculate stroke-dashoffset for circular progress
    // Circumference = 2 * PI * r. r=58 -> C ~ 364.4
    const circumference = 364.4;
    const subOffset = circumference - (subProgress / 100) * circumference;
    const hoursOffset = circumference - (hoursProgress / 100) * circumference;

    return (
        <div className="flex h-full w-full bg-[#f6f7f8] dark:bg-[#0F0F0F] text-slate-900 dark:text-white font-['Spline_Sans']">
            {/* Main Content */}
            <main className="flex-1 overflow-y-auto flex flex-col items-center">
                {/* Page Content */}
                <div className="max-w-5xl w-full mx-auto p-8">
                    {/* Heading */}
                    <div className="mb-10 text-center md:text-left">
                        <h2 className="text-4xl font-black tracking-tight mb-4">Channel monetization</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-lg max-w-3xl">
                            Join the Partner Program to earn money, get creator support, and more. Learn more about the eligibility requirements and how we review your channel.
                        </p>
                    </div>

                    {/* How to Join Section */}
                    <section className="mb-12">
                        <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                            How to join
                            <span className="material-symbols-outlined text-slate-400 text-lg cursor-help">info</span>
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Metric 1: Subscribers */}
                            <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 p-8 rounded-xl flex flex-col items-center text-center">
                                <div className="relative size-32 mb-6">
                                    <svg className="size-full">
                                        <circle className="text-slate-100 dark:text-slate-800" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                                        <circle
                                            className="text-[#137fec] transition-all duration-1000 ease-out"
                                            cx="64" cy="64"
                                            fill="transparent"
                                            r="58"
                                            stroke="currentColor"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={subOffset}
                                            strokeLinecap="round"
                                            strokeWidth="8"
                                            transform="rotate(-90 64 64)"
                                        ></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#137fec] text-3xl">group</span>
                                    </div>
                                </div>
                                <h4 className="text-2xl font-bold mb-1">{subscriberCount} / {subsRequired.toLocaleString()}</h4>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Subscribers</p>
                                <div className="mt-4 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="bg-[#137fec] h-full rounded-full transition-all duration-1000" style={{ width: `${subProgress}%` }}></div>
                                </div>
                            </div>

                            {/* Metric 2: Watch Hours */}
                            <div className="bg-white dark:bg-[#1a1a1a] border border-slate-200 dark:border-slate-800 p-8 rounded-xl flex flex-col items-center text-center">
                                <div className="relative size-32 mb-6">
                                    <svg className="size-full">
                                        <circle className="text-slate-100 dark:text-slate-800" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                                        <circle
                                            className="text-[#137fec] transition-all duration-1000 ease-out"
                                            cx="64" cy="64"
                                            fill="transparent"
                                            r="58"
                                            stroke="currentColor"
                                            strokeDasharray={circumference}
                                            strokeDashoffset={hoursOffset}
                                            strokeLinecap="round"
                                            strokeWidth="8"
                                            transform="rotate(-90 64 64)"
                                        ></circle>
                                    </svg>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-[#137fec] text-3xl">schedule</span>
                                    </div>
                                </div>
                                <h4 className="text-2xl font-bold mb-1">{watchHours} / {hoursRequired.toLocaleString()}</h4>
                                <p className="text-slate-500 dark:text-slate-400 font-medium">Public watch hours (Estimated)</p>
                                <div className="mt-4 w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                    <div className="bg-[#137fec] h-full rounded-full transition-all duration-1000" style={{ width: `${hoursProgress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Requirements Checklist */}
                    <section className="mb-12">
                        <h3 className="text-xl font-bold mb-6">Complete the basics</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a1a]">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                        <span className="material-symbols-outlined">check_circle</span>
                                    </div>
                                    <div>
                                        <p className="font-bold">2-Step Verification</p>
                                        <p className="text-xs text-slate-500">Turned on</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center justify-between p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#1a1a1a]">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-full bg-green-500/10 flex items-center justify-center text-green-500">
                                        <span className="material-symbols-outlined">check_circle</span>
                                    </div>
                                    <div>
                                        <p className="font-bold">Follow community guidelines</p>
                                        <p className="text-xs text-slate-500">0 Active strikes</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Notification CTA */}
                    <div className="flex flex-col items-center justify-center p-12 bg-[#137fec]/5 rounded-2xl border border-[#137fec]/20 text-center">
                        <div className="size-16 rounded-full bg-[#137fec]/20 flex items-center justify-center text-[#137fec] mb-6">
                            <span className="material-symbols-outlined text-4xl">mail</span>
                        </div>
                        <h3 className="text-2xl font-bold mb-2">Want to know when you're eligible?</h3>
                        <p className="text-slate-500 dark:text-slate-400 mb-8 max-w-md mx-auto">
                            We'll send you an email when you reach the requirements for the Partner Program.
                        </p>
                        <button
                            className="bg-[#137fec] hover:bg-[#137fec]/90 text-white font-bold py-3 px-10 rounded-lg transition-colors shadow-lg shadow-[#137fec]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={subscriberCount < 1000 || watchHours < 4000}
                        >
                            {subscriberCount >= 1000 && watchHours >= 4000 ? "Apply Now" : "Notify me when I'm eligible"}
                        </button>
                    </div>

                    {/* Footer Info */}
                    <footer className="mt-16 pb-12 pt-8 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-8 justify-between text-sm text-slate-500 dark:text-slate-400">
                        <div className="flex gap-6">
                            <a className="hover:underline" href="#">Terms of Service</a>
                            <a className="hover:underline" href="#">Privacy Policy</a>
                            <a className="hover:underline" href="#">Creator Hub</a>
                        </div>
                        <p>© 2026 YouTube Lite Studio. All rights reserved.</p>
                    </footer>
                </div>
            </main>
        </div>
    );
};

export default Monetization;
