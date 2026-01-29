import React, { useEffect } from 'react';
import { collection, getDocs, updateDoc, doc, increment, getDoc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';

const Simulation = () => {
    const { currentUser } = useAuth();

    // 1. Fake Views: Increment all videos by 1 view every 5 seconds
    useEffect(() => {
        if (!db) return;
        const viewInterval = setInterval(async () => {

            try {
                // Fetch all video IDs first (optimize by not fetching full data if possible, but Firestore needs read)
                const querySnapshot = await getDocs(collection(db, "videos"));

                // We will batch update or just iterate. Iterating is easier for now.
                // Note: This is heavy on writes!
                querySnapshot.docs.forEach(async (videoDoc) => {
                    const videoRef = doc(db, "videos", videoDoc.id);
                    // Randomly decide to add a view to make it look slightly organic? 
                    // User said "5 second por por 1 ti kore", so we add 1.
                    await updateDoc(videoRef, {
                        views: increment(1)
                    });
                });
                console.log("Simulating: Added views to all videos");
            } catch (error) {
                console.error("Simulation View Error:", error);
            }
        }, 5000); // 5 seconds

        return () => clearInterval(viewInterval);
    }, []);

    // 2. Fake Subscribers: Add 1 sub every 10 minutes to the CURRENT user
    useEffect(() => {
        if (!currentUser || !db) return;

        const subInterval = setInterval(async () => {

            try {
                const userRef = doc(db, "users", currentUser.uid);

                // Increase subscribers
                // We use setDoc with merge to ensure doc exists if it's a new user
                await setDoc(userRef, {
                    subscribers: increment(1)
                }, { merge: true });

                console.log("Simulating: Added 1 subscriber to current user");

                // Optional: Show a quiet toast or just let it happen silently? 
                // Mostly silent as per "fake" nature.
            } catch (error) {
                console.error("Simulation Sub Error:", error);
            }
        }, 10 * 60 * 1000); // 10 minutes

        return () => clearInterval(subInterval);
    }, [currentUser]);

    return null; // This component handles logic only, no UI
};

export default Simulation;
