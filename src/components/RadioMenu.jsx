import {
  PlayIcon,
  PauseIcon,
  VolumeOffIcon,
  VolumeLowIcon,
  VolumeMediumIcon,
  VolumeHighIcon,
} from "./Icons";

function RadioMenu({
  stations,
  currentStationIndex,
  isPlaying,
  volume,
  showMenu,
  onTogglePlayPause,
  onChangeStation,
  onVolumeChange,
  onToggleMute,
}) {
  // Function to get the appropriate volume icon based on volume level
  const getVolumeIcon = () => {
    if (volume === 0) {
      return <VolumeOffIcon />;
    } else if (volume <= 33) {
      return <VolumeLowIcon />;
    } else if (volume <= 66) {
      return <VolumeMediumIcon />;
    } else {
      return <VolumeHighIcon />;
    }
  };

  return (
    <div className={`radio-menu ${showMenu ? "show" : ""}`}>
      {/* Compact Header */}
      <div className="radio-menu-header">
        <div className="station-info">
          <span className="station-name">
            {stations[currentStationIndex].name}
          </span>
          <span className="station-type">
            {stations[currentStationIndex].type}
          </span>
        </div>
        <button
          className="play-btn"
          onClick={onTogglePlayPause}
          title="Play/Pause"
        >
          {isPlaying ? <PauseIcon /> : <PlayIcon />}
        </button>
      </div>

      {/* Compact Volume Control */}
      <div className="volume-control">
        <button className="volume-btn" onClick={onToggleMute} title="Volume">
          {getVolumeIcon()}
        </button>
        <input
          type="range"
          className="volume-slider"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => onVolumeChange(e.target.value)}
          title="Volume"
        />
        <span className="volume-text">{volume}</span>
      </div>

      {/* Compact Station List */}
      <div className="station-list">
        {stations.map((station, index) => (
          <div
            key={index}
            className={`station-item ${
              index === currentStationIndex ? "active" : ""
            }`}
            onClick={() => onChangeStation(index)}
          >
            <div className="station-content">
              <span className="station-title">{station.name}</span>
              <span className="station-genre">{station.type}</span>
            </div>
            {index === currentStationIndex && (
              <div className="active-indicator">
                <div className="dot"></div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RadioMenu;
