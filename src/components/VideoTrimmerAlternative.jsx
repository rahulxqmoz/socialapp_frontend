import React, { useState, useRef } from 'react';
import videojs from 'video.js';

const VideoTrimmerAlternative = ({ videoUrl, onSave, onClose }) => {
  const playerRef = useRef(null);
  const [trimmedVideoUrl, setTrimmedVideoUrl] = useState(null);

  const handleSave = async () => {
    const start = 10; // start time in seconds
    const end = 20; // end time in seconds

    const player = videojs(playerRef.current, {
      controls: true,
      autoplay: false,
      preload: 'auto',
    });

    player.trim(start, end);

    player.on('trim', () => {
      const trimmedVideoUrl = player.src();
      setTrimmedVideoUrl(trimmedVideoUrl);
      onSave(trimmedVideoUrl);
    });
  };

  return (
    <div>
      <video ref={playerRef} src={videoUrl} />
      <button onClick={handleSave}>Trim Video</button>
    </div>
  );
};

export default VideoTrimmerAlternative;