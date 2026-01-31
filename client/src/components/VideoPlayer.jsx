import React, { useEffect, useRef, useState } from 'react';
import fluidPlayer from 'fluid-player';
import 'fluid-player/src/css/fluidplayer.css';

const VideoPlayer = ({ src, poster, title }) => {
    const videoRef = useRef(null);
    const playerInstance = useRef(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Detect if mobile device
        const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        setIsMobile(checkMobile);
    }, []);

    useEffect(() => {
        if (!videoRef.current) return;

        const config = {
            layoutControls: {
                fillToContainer: true,
                primaryColor: "#2979FF",
                posterImage: poster || '',
                autoPlay: false,
                title: title || '',
                playButtonShowing: true,
                playPauseAnimation: true,
            }
        };

        // Only add VAST ads for mobile devices
        if (isMobile) {
            config.vastOptions = {
                allowVPAID: true,
                adList: [{
                    roll: 'preRoll',
                    vastTag: "https://quickwittedconclusion.com/dZm.FOzxd/GJNLvtZtGrUS/TeEm/9/uHZYU/ldkTP/TWYq3/NEjFEy2/NNTQMbt/NWjGcH2_M/T/Yt1HNJAw"
                }],
                skipButtonCaption: 'Skip ad in [seconds]',
                skipButtonClickCaption: 'Skip ad >',
                vastAdvanced: {
                    vastVideoEndedCallback: function () {
                        if (videoRef.current) {
                            setTimeout(() => videoRef.current.play(), 100);
                        }
                    },
                    vastVideoSkippedCallback: function () {
                        if (videoRef.current) {
                            setTimeout(() => videoRef.current.play(), 100);
                        }
                    }
                }
            };
        }

        // Initialize Fluid Player
        playerInstance.current = fluidPlayer(videoRef.current, config);

        // Cleanup
        return () => {
            if (playerInstance.current) {
                try {
                    playerInstance.current.destroy();
                } catch (e) {
                    console.error("Error destroying player:", e);
                }
                playerInstance.current = null;
            }
        };
    }, [src, isMobile, poster, title]);

    return (
        <video
            ref={videoRef}
            className="w-full h-full"
            src={src}
            controls
            playsInline
        >
            <p>Your browser does not support HTML5 video.</p>
        </video>
    );
};

export default VideoPlayer;
