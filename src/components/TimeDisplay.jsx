import { useState, useEffect } from "react";

function TimeDisplay() {
  const [time, setTime] = useState(new Date());
  const [isLoaded, setIsLoaded] = useState(false);
  const [currentFontIndex, setCurrentFontIndex] = useState(0);

  // Curated list of 40 beautiful fonts (20 professional + 20 funky)
  const fonts = [
    { name: "Inter", className: "font-inter", displayName: "Inter" },
    { name: "Roboto", className: "font-roboto", displayName: "Roboto" },
    {
      name: "Montserrat",
      className: "font-montserrat",
      displayName: "Montserrat",
    },
    { name: "Poppins", className: "font-poppins", displayName: "Poppins" },
    { name: "Open Sans", className: "font-opensans", displayName: "Open Sans" },
    { name: "Lato", className: "font-lato", displayName: "Lato" },
    { name: "Work Sans", className: "font-worksans", displayName: "Work Sans" },
    {
      name: "Nunito Sans",
      className: "font-nunitosans",
      displayName: "Nunito Sans",
    },
    {
      name: "Source Sans Pro",
      className: "font-sourcesanspro",
      displayName: "Source Sans Pro",
    },
    { name: "Raleway", className: "font-raleway", displayName: "Raleway" },
    { name: "Ubuntu", className: "font-ubuntu", displayName: "Ubuntu" },
    { name: "Fira Sans", className: "font-firasans", displayName: "Fira Sans" },
    {
      name: "IBM Plex Sans",
      className: "font-ibmplexsans",
      displayName: "IBM Plex Sans",
    },
    {
      name: "Space Grotesk",
      className: "font-spacegrotesk",
      displayName: "Space Grotesk",
    },
    {
      name: "JetBrains Mono",
      className: "font-jetbrainsmono",
      displayName: "JetBrains Mono",
    },
    { name: "Orbitron", className: "font-orbitron", displayName: "Orbitron" },
    { name: "Exo 2", className: "font-exo2", displayName: "Exo 2" },
    { name: "Oswald", className: "font-oswald", displayName: "Oswald" },
    {
      name: "Playfair Display",
      className: "font-playfairdisplay",
      displayName: "Playfair Display",
    },
    {
      name: "Merriweather",
      className: "font-merriweather",
      displayName: "Merriweather",
    },
    // Funky Fonts
    {
      name: "Creepster",
      className: "font-creepster",
      displayName: "Creepster",
    },
    { name: "Bungee", className: "font-bungee", displayName: "Bungee" },
    { name: "Monoton", className: "font-monoton", displayName: "Monoton" },
    {
      name: "Fredoka One",
      className: "font-fredokaone",
      displayName: "Fredoka One",
    },
    { name: "Bangers", className: "font-bangers", displayName: "Bangers" },
    {
      name: "Righteous",
      className: "font-righteous",
      displayName: "Righteous",
    },
    { name: "Nosifer", className: "font-nosifer", displayName: "Nosifer" },
    {
      name: "Faster One",
      className: "font-fasterone",
      displayName: "Faster One",
    },
    { name: "Ewert", className: "font-ewert", displayName: "Ewert" },
    {
      name: "Audiowide",
      className: "font-audiowide",
      displayName: "Audiowide",
    },
    { name: "Kalam", className: "font-kalam", displayName: "Kalam" },
    { name: "Satisfy", className: "font-satisfy", displayName: "Satisfy" },
    {
      name: "Dancing Script",
      className: "font-dancingscript",
      displayName: "Dancing Script",
    },
    { name: "Pacifico", className: "font-pacifico", displayName: "Pacifico" },
    { name: "Lobster", className: "font-lobster", displayName: "Lobster" },
    {
      name: "Comfortaa",
      className: "font-comfortaa",
      displayName: "Comfortaa",
    },
    {
      name: "Bowlby One",
      className: "font-bowlbyone",
      displayName: "Bowlby One",
    },
    {
      name: "Bungee Shade",
      className: "font-bungeeshade",
      displayName: "Bungee Shade",
    },
    {
      name: "Squada One",
      className: "font-squadaone",
      displayName: "Squada One",
    },
    {
      name: "Black Ops One",
      className: "font-blackopsone",
      displayName: "Black Ops One",
    },
  ];

  // Load saved font preference from Chrome storage
  useEffect(() => {
    const loadSavedFont = async () => {
      try {
        let savedFontIndex = null;

        // Try Chrome storage first (for extension environment)
        if (typeof chrome !== "undefined" && chrome.storage) {
          const result = await chrome.storage.local.get(["selectedFontIndex"]);
          savedFontIndex = result.selectedFontIndex;
        } else {
          // Fallback to localStorage (for development/testing)
          const saved = localStorage.getItem("selectedFontIndex");
          savedFontIndex = saved ? parseInt(saved, 10) : null;
        }

        if (
          savedFontIndex !== null &&
          savedFontIndex >= 0 &&
          savedFontIndex < fonts.length
        ) {
          setCurrentFontIndex(savedFontIndex);
        }
      } catch (error) {
        console.log("Failed to load font preference:", error);
      }
    };

    loadSavedFont();
  }, [fonts.length]);

  // Save font preference to Chrome storage
  const saveFontPreference = async (fontIndex) => {
    try {
      // Try Chrome storage first (for extension environment)
      if (typeof chrome !== "undefined" && chrome.storage) {
        await chrome.storage.local.set({ selectedFontIndex: fontIndex });
      } else {
        // Fallback to localStorage (for development/testing)
        localStorage.setItem("selectedFontIndex", fontIndex.toString());
      }
    } catch (error) {
      console.log("Failed to save font preference:", error);
    }
  };

  useEffect(() => {
    // Set initial load animation
    const loadTimer = setTimeout(() => setIsLoaded(true), 100);

    const timer = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(loadTimer);
    };
  }, []);

  const handleFontCycle = () => {
    const newIndex = (currentFontIndex + 1) % fonts.length;
    setCurrentFontIndex(newIndex);
    saveFontPreference(newIndex);
  };

  const hours = time.getHours().toString().padStart(2, "0");
  const minutes = time.getMinutes().toString().padStart(2, "0");

  const dateString = time.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const currentFont = fonts[currentFontIndex];

  return (
    <div className={`header ${isLoaded ? "loaded" : ""}`}>
      <div
        className={`time-display ${currentFont.className}`}
        onClick={handleFontCycle}
        style={{ cursor: "pointer" }}
      >
        {hours}:{minutes}
      </div>
      <div className={`date-display ${currentFont.className}`}>
        {dateString}
      </div>
    </div>
  );
}

export default TimeDisplay;
