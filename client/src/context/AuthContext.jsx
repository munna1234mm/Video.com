import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [globalError, setGlobalError] = useState(null);

    // Capture global errors that might cause the black screen
    useEffect(() => {
        const handleError = (event) => {
            console.error("Caught global error:", event.error);
            setGlobalError(event.error?.message || event.message || "Unknown Runtime Error");
        };
        window.addEventListener('error', handleError);

        const handlePromise = (event) => {
            console.error("Caught unhandled rejection:", event.reason);
            setGlobalError(event.reason?.message || String(event.reason) || "Unhandled Promise Rejection");
        };
        window.addEventListener('unhandledrejection', handlePromise);

        return () => {
            window.removeEventListener('error', handleError);
            window.removeEventListener('unhandledrejection', handlePromise);
        };
    }, []);

    const loginWithGoogle = async () => {
        if (!auth || !googleProvider) {
            alert("Firebase is not initialized correctly. Please check your configuration.");
            return;
        }
        try {
            await signInWithPopup(auth, googleProvider);
        } catch (error) {
            console.error("Login failed:", error);
            if (error.code === 'auth/popup-closed-by-user') {
                alert("Sign in was cancelled.");
            } else if (error.code === 'auth/unauthorized-domain') {
                alert("Domain not authorized! Add this domain to Firebase Console > Authentication > Settings > Authorized Domains.");
            } else {
                alert("Login failed: " + error.message);
            }
        }
    };

    const logout = () => {
        if (!auth) return;
        return signOut(auth);
    };

    useEffect(() => {
        if (!auth) {
            setLoading(false);
            return;
        }

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    // If there's a global crash, show it!
    if (globalError) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-[#0F0F0F] text-white p-10 font-mono">
                <div className="max-w-2xl border border-red-500/50 p-8 rounded-2xl bg-red-900/10">
                    <h1 className="text-2xl font-bold text-red-500 mb-4 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                        Critical Startup Error
                    </h1>
                    <p className="bg-black/40 p-4 rounded-xl border border-red-900/50 text-red-300 mb-6 overflow-auto max-h-40">
                        {globalError}
                    </p>
                    <button
                        onClick={() => window.location.reload()}
                        className="bg-white text-black px-8 py-2 rounded-full font-bold hover:bg-gray-200 transition-colors"
                    >
                        RELOAD PAGE
                    </button>
                    <p className="mt-6 text-xs text-gray-500 italic">
                        This error happened during the app's initialization phase. Check the browser console for more details.
                    </p>
                </div>
            </div>
        );
    }

    const value = {
        currentUser,
        loginWithGoogle,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="flex items-center justify-center h-screen bg-[#0F0F0F] text-white">
                    <div className="flex flex-col items-center gap-4 text-center px-4">
                        <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-lg font-medium">Loading YouTube Lite...</p>
                        <p className="text-xs text-gray-500">If this screen persists, please check your Firebase configuration on Render.</p>
                    </div>
                </div>
            ) : !auth ? (
                <div className="flex items-center justify-center h-screen bg-[#0F0F0F] text-white">
                    <div className="flex flex-col items-center gap-4 text-center px-6">
                        <div className="bg-red-500/20 p-4 rounded-full">
                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" x2="12" y1="8" y2="12" /><line x1="12" x2="12.01" y1="16" y2="16" /></svg>
                        </div>
                        <h2 className="text-xl font-bold">Configuration Error</h2>
                        <p className="text-gray-400 max-w-md">
                            The application failed to connect to Firebase. This usually happens when <strong>Environment Variables</strong> are missing on Render.
                        </p>
                        <div className="bg-[#1A1A1A] p-4 rounded-xl text-left text-xs font-mono border border-red-500/30 w-full max-w-md">
                            <p className="text-red-400 mb-2">// Diagnostic Info:</p>
                            <p>API KEY: {import.meta.env.VITE_FIREBASE_API_KEY ? '✅ Present' : '❌ Missing'}</p>
                            <p>PROJECT ID: {import.meta.env.VITE_FIREBASE_PROJECT_ID ? '✅ Present' : '❌ Missing'}</p>
                        </div>
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-white text-black px-6 py-2 rounded-full font-medium mt-2 hover:bg-gray-200 transition-colors"
                        >
                            Refresh Page
                        </button>
                    </div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
};
