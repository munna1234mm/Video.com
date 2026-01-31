import React, { useEffect, useRef } from 'react';
import fluidPlayer from 'fluid-player';
import 'fluid-player/src/css/fluidplayer.css';

const VideoPlayer = ({ src, poster, title, vastTag }) => {
    const videoRef = useRef(null);
    const playerInstance = useRef(null);

    useEffect(() => {
        if (!videoRef.current) return;

        // Initialize Fluid Player with ads
        playerInstance.current = fluidPlayer(videoRef.current, {
            layoutControls: {
                fillToContainer: true,
                primaryColor: "#2979FF",
                posterImage: poster || '',
                autoPlay: false,
                title: title || '',
                playButtonShowing: true,
                playPauseAnimation: true,
            },
            vastOptions: {
                allowVPAID: true,
                adList: [
                    {
                        roll: 'preRoll',
                        vastTag: "https://quickwittedconclusion.com/dZm.FOzxd/GJNLvtZtGrUS/TeEm/9/uHZYU/ldkTP/TWYq3/NEjFEy2/NNTQMbt/NWjGcH2_M/T/Yt1HNJAw"
                    }
                ],
                skipButtonCaption: 'Skip ad in [seconds]',
                skipButtonClickCaption: 'Skip ad >',
                vastAdvanced: {
                    vastVideoEndedCallback: function () {
                        // Play video automatically when ad ends
                        setTimeout(() => {
                            if (videoRef.current) {
                                videoRef.current.play();
                            }
                        }, 200);
                    },
                    vastVideoSkippedCallback: function () {
                        // Play video automatically when ad is skipped
                        setTimeout(() => {
                            if (videoRef.current) {
                                videoRef.current.play();
                            }
                        }, 200);
                    }
                }
            }
        });

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
    }, [src]);

    return (
        <video
            ref={videoRef}
            className="w-full h-full"
            src={src}
            controls
        >
            <p>Your browser does not support HTML5 video.</p>
        </video>
    );
};

export default VideoPlayer;
