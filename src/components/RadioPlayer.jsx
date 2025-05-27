import { useState, useEffect, useRef, useCallback } from "react";
import { RadioIcon } from "./Icons";
import RadioMenu from "./RadioMenu";

function RadioPlayer() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [volume, setVolume] = useState(50);
  const [isMuted, setIsMuted] = useState(false);
  const [lastVolume, setLastVolume] = useState(50);
  const [currentStationIndex, setCurrentStationIndex] = useState(0);
  const [showMenu, setShowMenu] = useState(false);

  const audioRef = useRef(null);
  const audioNodesRef = useRef({
    context: null,
    analyser: null,
    source: null,
    dataArray: null,
  }).current; // .current makes it a stable object reference

  const visualizerFrameRef = useRef(null);
  const SOURCE_CONNECTED_MARKER = "_radioPlayerSourceConnected";

  const stations = [
    { name: "Lofi", type: "lofi", url: "https://lofi.harshbanjare.me" },
    {
      name: "Lofi Girl",
      type: "lofi",
      url: "https://streams.fluxfm.de/Chillhop/mp3-128/streams.fluxfm.de/",
    },
    {
      name: "Hunter.FM Lo-Fi",
      type: "lofi",
      url: "http://live.hunter.fm/lofi_high",
    },
    {
      name: "SomaFM Groove Salad",
      type: "chillout",
      url: "http://ice1.somafm.com/groovesalad-256-mp3",
    },
    {
      name: "BluesWave Radio",
      type: "blues",
      url: "https://blueswave.radio:8002/blues320",
    },
    {
      name: "FluxFM Pop Radio",
      type: "pop",
      url: "https://streams.fluxfm.de/popradio/mp3-128/streams.fluxfm.de/",
    },
    {
      name: "BBC World Service",
      type: "news",
      url: "http://stream.live.vc.bbcmedia.co.uk/bbc_world_service",
    },
    {
      name: "Radio Swiss Classic",
      type: "classical",
      url: "http://stream.srg-ssr.ch/m/rsc_de/mp3_128",
    },
    {
      name: "SomaFM Drone Zone",
      type: "ambient",
      url: "http://ice1.somafm.com/dronezone-256-mp3",
    },
    {
      name: "Radio Swiss Jazz",
      type: "jazz",
      url: "http://stream.srg-ssr.ch/m/rsj/mp3_128",
    },
    {
      name: "SomaFM Deep Space One",
      type: "electronic",
      url: "http://ice1.somafm.com/deepspaceone-128-mp3",
    },
    {
      name: "FluxFM Electronic",
      type: "electronic",
      url: "https://streams.fluxfm.de/flux/mp3-128/streams.fluxfm.de/",
    },
    {
      name: "KEXP Seattle",
      type: "indie",
      url: "http://live-mp3-128.kexp.org/kexp128.mp3",
    },
    {
      name: "FIP Radio France",
      type: "eclectic",
      url: "http://direct.fipradio.fr/live/fip-midfi.mp3",
    },
    {
      name: "NTS Live 1",
      type: "experimental",
      url: "https://stream-relay-geo.ntslive.net/stream",
    },
    {
      name: "SomaFM Beat Blender",
      type: "downtempo",
      url: "http://ice1.somafm.com/beatblender-128-mp3",
    },
  ];

  const initAudioGraph = useCallback(() => {
    if (!audioRef.current) return false;

    if (!audioNodesRef.context) {
      try {
        const AudioContextGlobal =
          window.AudioContext || window.webkitAudioContext;
        if (!AudioContextGlobal) {
          console.warn("Web Audio API not supported. Visualizer disabled.");
          return false;
        }
        audioNodesRef.context = new AudioContextGlobal();
        audioNodesRef.analyser = audioNodesRef.context.createAnalyser();
        audioNodesRef.analyser.fftSize = 256;
        const bufferLength = audioNodesRef.analyser.frequencyBinCount;
        audioNodesRef.dataArray = new Uint8Array(bufferLength);
        audioNodesRef.analyser.connect(audioNodesRef.context.destination);
      } catch (e) {
        console.error("Error initializing AudioContext/Analyser:", e);
        audioNodesRef.context = null; // Ensure context is null if init fails
        return false;
      }
    }

    if (
      audioNodesRef.context &&
      audioRef.current &&
      !audioRef.current[SOURCE_CONNECTED_MARKER]
    ) {
      try {
        audioNodesRef.source = audioNodesRef.context.createMediaElementSource(
          audioRef.current
        );
        audioNodesRef.source.connect(audioNodesRef.analyser);
        audioRef.current[SOURCE_CONNECTED_MARKER] = true;
      } catch (e) {
        console.error("Error creating/connecting MediaElementSource:", e);
        // If this fails (e.g. InvalidStateError), the marker remains false,
        // allowing a retry if the underlying issue is resolved (unlikely without full cleanup).
        // However, our main defense is proper cleanup on unmount.
        return false;
      }
    }
    return true; // Graph is ready or was already ready
  }, [audioNodesRef]); // audioNodesRef is a stable object

  // Effect for main audio event listeners and unmount cleanup
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const resumeAudioContextIfNeeded = async () => {
      if (
        audioNodesRef.context &&
        audioNodesRef.context.state === "suspended"
      ) {
        try {
          await audioNodesRef.context.resume();
        } catch (e) {
          console.error("Error resuming audio context:", e);
        }
      }
    };

    const handleLoadStart = () => setIsLoading(true);
    const handleCanPlay = () => setIsLoading(false);
    const handlePlaying = () => {
      setIsPlaying(true);
      setIsLoading(false);
      setHasError(false);
      resumeAudioContextIfNeeded(); // Ensure context is running
    };
    const handlePause = () => {
      setIsPlaying(false);
      setIsLoading(false);
    };
    const handleError = (e) => {
      console.error("Audio Element Error:", e);
      setIsPlaying(false);
      setIsLoading(false);
      setHasError(true);
      setTimeout(() => setHasError(false), 2000);
    };

    audio.addEventListener("loadstart", handleLoadStart);
    audio.addEventListener("canplay", handleCanPlay);
    audio.addEventListener("playing", handlePlaying);
    audio.addEventListener("pause", handlePause);
    audio.addEventListener("error", handleError);
    audio.addEventListener("stalled", handleLoadStart); // Treat stalled as loading
    audio.addEventListener("waiting", handleLoadStart); // Treat waiting as loading
    audio.addEventListener("play", resumeAudioContextIfNeeded);

    return () => {
      audio.removeEventListener("loadstart", handleLoadStart);
      audio.removeEventListener("canplay", handleCanPlay);
      audio.removeEventListener("playing", handlePlaying);
      audio.removeEventListener("pause", handlePause);
      audio.removeEventListener("error", handleError);
      audio.removeEventListener("stalled", handleLoadStart);
      audio.removeEventListener("waiting", handleLoadStart);
      audio.removeEventListener("play", resumeAudioContextIfNeeded);

      if (visualizerFrameRef.current) {
        cancelAnimationFrame(visualizerFrameRef.current);
        visualizerFrameRef.current = null;
      }

      if (audioNodesRef.source) {
        try {
          audioNodesRef.source.disconnect();
        } catch (e) {
          /* ignore */
        }
        audioNodesRef.source = null;
      }
      if (audioNodesRef.analyser) {
        try {
          audioNodesRef.analyser.disconnect();
        } catch (e) {
          /* ignore */
        }
        audioNodesRef.analyser = null;
      }
      if (audioNodesRef.context && audioNodesRef.context.state !== "closed") {
        audioNodesRef.context
          .close()
          .catch((e) => console.warn("AudioContext close error:", e));
      }
      audioNodesRef.context = null;
      audioNodesRef.dataArray = null;

      if (audioRef.current && audioRef.current[SOURCE_CONNECTED_MARKER]) {
        audioRef.current[SOURCE_CONNECTED_MARKER] = false;
      }
    };
  }, [audioNodesRef]); // audioNodesRef is stable

  // Effect for volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume / 100;
    }
  }, [volume]);

  const updateVisualizer = useCallback(() => {
    if (!isPlaying || !audioNodesRef.analyser || !audioNodesRef.dataArray) {
      if (visualizerFrameRef.current) {
        cancelAnimationFrame(visualizerFrameRef.current);
        visualizerFrameRef.current = null;
      }
      const visualizerBars = document.querySelectorAll(".wave-bar");
      visualizerBars.forEach((bar) => {
        if (bar instanceof HTMLElement) bar.style.transform = "scaleY(0.1)";
      });
      return;
    }

    audioNodesRef.analyser.getByteFrequencyData(audioNodesRef.dataArray);
    const visualizerBars = document.querySelectorAll(".wave-bar");
    const barCount = visualizerBars.length;
    const bufferLength = audioNodesRef.dataArray.length;
    const step = Math.floor(bufferLength / (barCount * 2));

    for (let i = 0; i < barCount; i++) {
      let sum = 0;
      for (let j = 0; j < step; j++) {
        sum += audioNodesRef.dataArray[i * step + j];
      }
      let average = sum / step || 0;
      const scaleY = Math.min(1, Math.max(0.05, (average / 256) * 2));
      if (visualizerBars[i] instanceof HTMLElement) {
        visualizerBars[i].style.transform = `scaleY(${scaleY})`;
      }
    }
    visualizerFrameRef.current = requestAnimationFrame(updateVisualizer);
  }, [isPlaying, audioNodesRef]); // audioNodesRef is stable

  // Effect for starting/stopping visualizer animation
  useEffect(() => {
    if (isPlaying) {
      if (initAudioGraph()) {
        // Ensure graph is ready
        // Resume context just in case, especially after first play or if suspended
        const resumeAndAnimate = async () => {
          if (
            audioNodesRef.context &&
            audioNodesRef.context.state === "suspended"
          ) {
            await audioNodesRef.context.resume();
          }
          if (visualizerFrameRef.current)
            cancelAnimationFrame(visualizerFrameRef.current);
          visualizerFrameRef.current = requestAnimationFrame(updateVisualizer);
        };
        resumeAndAnimate();
      }
    } else {
      if (visualizerFrameRef.current) {
        cancelAnimationFrame(visualizerFrameRef.current);
        visualizerFrameRef.current = null;
      }
      // Explicitly reset bars when stopping
      const visualizerBars = document.querySelectorAll(".wave-bar");
      visualizerBars.forEach((bar) => {
        if (bar instanceof HTMLElement) bar.style.transform = "scaleY(0.1)";
      });
    }
    // Cleanup for this effect if isPlaying toggles
    return () => {
      if (visualizerFrameRef.current) {
        cancelAnimationFrame(visualizerFrameRef.current);
        // visualizerFrameRef.current = null; // Handled by the else block or unmount
      }
    };
  }, [isPlaying, initAudioGraph, updateVisualizer, audioNodesRef]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      try {
        setIsLoading(true);
        if (!initAudioGraph()) {
          // Initialize audio graph if not already done
          console.error(
            "Failed to initialize audio graph. Playback may not have visualizer."
          );
          // Continue trying to play even if visualizer fails
        }

        // Resume context if suspended (important for autoplay policies)
        if (
          audioNodesRef.context &&
          audioNodesRef.context.state === "suspended"
        ) {
          await audioNodesRef.context.resume();
        }

        // Ensure src is set if it's the first play or source is different
        if (audio.currentSrc !== stations[currentStationIndex].url) {
          audio.src = stations[currentStationIndex].url;
        }
        await audio.play();
      } catch (error) {
        console.error("Error playing audio:", error);
        setHasError(true);
        setIsLoading(false);
        setIsPlaying(false); // Ensure isPlaying is false on error
      }
    }
  };

  const changeStation = async (index) => {
    const wasPlaying = isPlaying;
    if (isPlaying) {
      audioRef.current?.pause(); // Pause current playback
    }

    setCurrentStationIndex(index); // Update state

    if (wasPlaying) {
      // If it was playing, automatically play the new station
      // Timeout helps ensure state updates are processed and audio element can react
      setTimeout(async () => {
        const audio = audioRef.current;
        if (audio) {
          try {
            setIsLoading(true);
            if (!initAudioGraph()) {
              console.error(
                "Failed to initialize audio graph for new station."
              );
            }
            if (
              audioNodesRef.context &&
              audioNodesRef.context.state === "suspended"
            ) {
              await audioNodesRef.context.resume();
            }
            audio.src = stations[index].url;
            await audio.play();
          } catch (error) {
            console.error("Error changing station and playing:", error);
            setHasError(true);
            setIsLoading(false);
            setIsPlaying(false);
          }
        }
      }, 50); // A small delay
    } else {
      // If not playing, just update the src for the audio element
      // So next play action uses the new station
      if (audioRef.current) {
        audioRef.current.src = stations[index].url;
      }
    }
  };

  const handleVolumeChange = (value) => {
    const newVolume = parseInt(value);
    setVolume(newVolume);
    // audioRef.current.volume is handled by useEffect [volume]
    setLastVolume(newVolume); // Keep track of volume before mute
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (isMuted) {
      // Unmute: restore to lastVolume or a default if lastVolume was 0
      const newVolume = lastVolume > 0 ? lastVolume : 50;
      setVolume(newVolume);
      if (audioRef.current) audioRef.current.volume = newVolume / 100;
      setIsMuted(false);
    } else {
      // Mute: store current volume, set volume to 0
      setLastVolume(volume);
      setVolume(0);
      if (audioRef.current) audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const getRadioIconClass = () => {
    if (isLoading) return "radio-icon loading";
    if (hasError) return "radio-icon error";
    if (isPlaying) return "radio-icon playing";
    return "radio-icon paused";
  };

  return (
    <>
      <div
        className="radio-player"
        onMouseEnter={() => setShowMenu(true)}
        onMouseLeave={() => setShowMenu(false)}
      >
        <div className={`radio-visualizer ${isPlaying ? "playing" : ""}`}>
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="wave-bar"
              style={{ height: "100%" /* Controlled by JS transform */ }}
            ></div>
          ))}
        </div>

        <div
          className={getRadioIconClass()}
          onClick={togglePlayPause}
          title="Click to play/pause"
        >
          <RadioIcon />
        </div>

        <RadioMenu
          stations={stations}
          currentStationIndex={currentStationIndex}
          isPlaying={isPlaying}
          volume={volume}
          showMenu={showMenu}
          onTogglePlayPause={togglePlayPause}
          onChangeStation={changeStation}
          onVolumeChange={handleVolumeChange}
          onToggleMute={toggleMute}
        />
      </div>

      <audio ref={audioRef} preload="metadata" crossOrigin="anonymous">
        Your browser does not support the audio element.
      </audio>
    </>
  );
}

export default RadioPlayer;
