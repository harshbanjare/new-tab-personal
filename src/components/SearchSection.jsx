import { useState, useEffect, useRef } from "react";
import {
  GoogleIcon,
  ChatGPTIcon,
  YouTubeIcon,
  RedditIcon,
  XIcon,
  PerplexityIcon,
} from "./Icons";

function SearchSection() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPlatform, setSelectedPlatform] = useState("google");
  const searchInputRef = useRef(null);
  const sliderRef = useRef(null);
  const chipRefs = useRef({});

  const platforms = [
    { id: "google", name: "Google", icon: GoogleIcon },
    { id: "chatgpt", name: "ChatGPT", icon: ChatGPTIcon },
    { id: "youtube", name: "YouTube", icon: YouTubeIcon },
    { id: "reddit", name: "Reddit", icon: RedditIcon },
    { id: "x", name: "X", icon: XIcon },
    { id: "perplexity", name: "Perplexity", icon: PerplexityIcon },
  ];

  const placeholders = {
    google: "Search Google or type a URL",
    chatgpt: "Ask ChatGPT a question",
    youtube: "Search YouTube videos",
    reddit: "Search Reddit posts",
    x: "Search X (Twitter)",
    perplexity: "Ask Perplexity anything",
  };

  // Get the currently selected platform's icon
  const getSelectedPlatformIcon = () => {
    const platform = platforms.find((p) => p.id === selectedPlatform);
    return platform ? platform.icon : GoogleIcon;
  };

  // Update slider position
  const updateSliderPosition = (platformId) => {
    const activeChip = chipRefs.current[platformId];
    const slider = sliderRef.current;

    if (activeChip && slider) {
      const chipRect = activeChip.getBoundingClientRect();
      const containerRect = activeChip.parentElement.getBoundingClientRect();

      const offsetX = chipRect.left - containerRect.left - 6; // Account for padding
      const width = chipRect.width;

      slider.style.width = `${width}px`;
      slider.style.transform = `translateX(${offsetX}px)`;
    }
  };

  // Initialize slider position on mount and when selectedPlatform changes
  useEffect(() => {
    const timer = setTimeout(() => {
      updateSliderPosition(selectedPlatform);
    }, 100);
    return () => clearTimeout(timer);
  }, [selectedPlatform]);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      updateSliderPosition(selectedPlatform);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedPlatform]);

  const handleSearch = (e) => {
    if (e.key === "Enter") {
      const query = searchQuery.trim();
      if (query) {
        if (selectedPlatform === "google" && isValidURL(query)) {
          window.location.href = query.startsWith("http")
            ? query
            : "https://" + query;
        } else {
          const searchUrls = {
            google: `https://www.google.com/search?q=${encodeURIComponent(
              query
            )}`,
            chatgpt: `https://chat.openai.com/?q=${encodeURIComponent(query)}`,
            youtube: `https://www.youtube.com/results?search_query=${encodeURIComponent(
              query
            )}`,
            reddit: `https://www.reddit.com/search/?q=${encodeURIComponent(
              query
            )}`,
            x: `https://x.com/search?q=${encodeURIComponent(query)}`,
            perplexity: `https://www.perplexity.ai/search?q=${encodeURIComponent(
              query
            )}`,
          };
          window.location.href = searchUrls[selectedPlatform];
        }
      }
    }
  };

  const isValidURL = (string) => {
    try {
      const urlPattern =
        /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
      return urlPattern.test(string);
    } catch (_) {
      return false;
    }
  };

  const handlePlatformChange = (platformId) => {
    setSelectedPlatform(platformId);
    updateSliderPosition(platformId);
    // Keep input focused without delay
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handlePlatformMouseDown = (e) => {
    // Prevent the button from stealing focus from the input
    e.preventDefault();
  };

  return (
    <div className="search-section">
      <div className="search-wrapper">
        <div className="search-container">
          <div
            className="search-input-wrapper"
            data-platform={selectedPlatform}
          >
            <div className="search-icon">
              {(() => {
                const IconComponent = getSelectedPlatformIcon();
                return <IconComponent />;
              })()}
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleSearch}
              placeholder={placeholders[selectedPlatform]}
              autoComplete="off"
              id="searchInput"
            />
          </div>
        </div>

        <div className="platform-selector">
          <div className="platform-chips">
            <div ref={sliderRef} className="chip-slider"></div>
            {platforms.map((platform) => (
              <button
                key={platform.id}
                ref={(el) => (chipRefs.current[platform.id] = el)}
                className={`platform-chip ${
                  selectedPlatform === platform.id ? "active" : ""
                }`}
                data-platform={platform.id}
                onMouseDown={handlePlatformMouseDown}
                onClick={() => handlePlatformChange(platform.id)}
              >
                <span className="chip-icon">
                  <platform.icon />
                </span>
                <span className="chip-label">{platform.name}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SearchSection;
