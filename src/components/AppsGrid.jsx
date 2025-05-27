import { useState, useEffect } from "react";
import {
  GoogleIcon,
  ChatGPTIcon,
  YouTubeIcon,
  XIcon,
  RedditIcon,
  InstagramIcon,
  RandomIcon,
} from "./Icons";

function AppsGrid() {
  const [randomSites, setRandomSites] = useState([]);

  useEffect(() => {
    loadRandomSites();
  }, []);

  const loadRandomSites = async () => {
    try {
      const response = await fetch("/random-sites.json");
      const data = await response.json();
      const allUrls = data.sites.reduce((acc, category) => {
        return acc.concat(category.urls);
      }, []);
      setRandomSites(allUrls);
    } catch (error) {
      console.error("Error loading random sites:", error);
      setRandomSites([
        "https://www.staggeringbeauty.com",
        "https://pointerpointer.com",
        "https://theuselessweb.com",
        "https://excalidraw.com",
        "https://www.photopea.com",
      ]);
    }
  };

  const getRandomSite = () => {
    if (randomSites.length === 0) return "https://theuselessweb.com";
    return randomSites[Math.floor(Math.random() * randomSites.length)];
  };

  const handleAppClick = (url) => {
    if (url === "random") {
      window.location.href = getRandomSite();
    } else {
      window.location.href = url;
    }
  };

  const apps = [
    {
      name: "Google",
      url: "https://www.google.com",
      icon: GoogleIcon,
      className: "google",
    },
    {
      name: "ChatGPT",
      url: "https://chat.openai.com",
      icon: ChatGPTIcon,
      className: "chatgpt",
    },
    {
      name: "YouTube",
      url: "https://www.youtube.com",
      icon: YouTubeIcon,
      className: "youtube",
    },
    { name: "X", url: "https://x.com", icon: XIcon, className: "twitter" },
    {
      name: "Reddit",
      url: "https://www.reddit.com",
      icon: RedditIcon,
      className: "reddit",
    },
    {
      name: "Gmail",
      url: "https://mail.google.com",
      image: "/images/gmail-icon.png",
      className: "gmail",
    },
    {
      name: "Figma",
      url: "https://www.figma.com",
      image: "/images/figma-icon.png",
      className: "figma",
    },
    {
      name: "Netflix",
      url: "https://www.netflix.com",
      image: "/images/netflix-icon.png",
      className: "netflix",
    },
    {
      name: "Instagram",
      url: "https://www.instagram.com",
      icon: InstagramIcon,
      className: "instagram",
    },
    {
      name: "Claude",
      url: "https://claude.ai",
      image: "/images/claude-icon.png",
      className: "claude",
    },
    {
      name: "Perplexity",
      url: "https://perplexity.ai",
      image: "/images/perplexity-icon.png",
      className: "perplexity",
    },
    { name: "Random", url: "random", icon: RandomIcon, className: "random" },
  ];

  return (
    <div className="apps-section">
      <div className="apps-grid">
        {apps.map((app) => (
          <div
            key={app.name}
            className="app-item"
            onClick={() => handleAppClick(app.url)}
            tabIndex="0"
            onKeyPress={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                handleAppClick(app.url);
              }
            }}
          >
            <div className={`app-icon ${app.className}`}>
              {app.icon ? <app.icon /> : <img src={app.image} alt={app.name} />}
            </div>
            <span className="app-label">{app.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AppsGrid;
