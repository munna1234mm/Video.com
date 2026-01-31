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
                        vastTag: "https://pubads.g.doubleclick.net/gampad/ads?iu=/21775744923/external/single_ad_samples&sz=640x480&cust_params=sample_ct%3Dlinear&ciu_szs=300x250%2C728x90&gdfp_req=1&output=vast&unviewed_position_start=1&env=vp&impl=s&correlator="
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
