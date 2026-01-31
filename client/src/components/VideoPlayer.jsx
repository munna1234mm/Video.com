import React, { useEffect, useRef } from 'react';
import fluidPlayer from 'fluid-player';
import 'fluid-player/src/css/fluidplayer.css';

const VideoPlayer = ({ src, poster, title, vastTag }) => {
    const videoRef = useRef(null);
    const playerInstance = useRef(null);

    useEffect(() => {
        if (!videoRef.current) return;

        // Initialize Fluid Player
        playerInstance.current = fluidPlayer(videoRef.current, {
            layoutControls: {
                fillToContainer: true,
                primaryColor: "#2979FF",
                posterImage: poster || '',
                autoPlay: true,
                title: title || '',
                playButtonShowing: true,
                playPauseAnimation: true,
                mute: true, // Mute to allow autoplay
            },
            vastOptions: {
                allowVPAID: true, // Enable VPAID ads
                adList: [
                    {
                        roll: 'preRoll',
                        vastTag: vastTag
                    }
                ],
                skipButtonCaption: 'Skip ad in [seconds]',
                skipButtonClick: 'Skip ad',
                vastAdvanced: {
                    vastVideoEndedCallback: () => {
                        handleAdEnd();
                    },
                    vastVideoSkippedCallback: () => {
                        handleAdEnd();
                    },
                    noVastVideoCallback: () => {
                        handleAdEnd();
                    }
                }
            }
        });

        const handleAdEnd = () => {
            // Aggressive retry logic
            const attemptPlay = async () => {
                try {
                    if (playerInstance.current) {
                        await playerInstance.current.play();
                    } else if (videoRef.current) {
                        // Fallback to native play if instance is weird
                        await videoRef.current.play();
                    }
                } catch (e) {
                    console.error("Play attempt failed:", e);
                    // If fluid player plays fail, try native element directly as last resort
                    if (videoRef.current) {
                        videoRef.current.play().catch(err => console.error("Native play failed", err));
                    }
                }
            };

            // Immediate and staggered retries
            attemptPlay();
            [100, 300, 500, 1000, 2000].forEach(delay => {
                setTimeout(attemptPlay, delay);
            });
        };

        // Cleanup function
        return () => {
            if (playerInstance.current) {
                try {
                    playerInstance.current.destroy();
                } catch (e) {
                    console.error("Error destroying player instance", e);
                }
                playerInstance.current = null;
            }
        };
    }, [src, vastTag]);

    return (
        <video
            ref={videoRef}
            className="w-full h-full"
            src={src}
        >
            <p>Your browser does not support HTML5 video.</p>
        </video>
    );
};

export default VideoPlayer;
