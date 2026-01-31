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
                mute: false,
                preload: 'auto', // Preload main video
            },
            vastOptions: {
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
            if (!playerInstance.current) return;

            // Aggressive retry strategy to ensure video plays
            const playVideo = () => playerInstance.current?.play();

            playVideo(); // Immediate attempt
            setTimeout(playVideo, 100); // Quick retry
            setTimeout(playVideo, 300); // Verify retry
            setTimeout(playVideo, 500); // Final fallback
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
