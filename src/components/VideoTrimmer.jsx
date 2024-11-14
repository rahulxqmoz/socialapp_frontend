import React, { useState, useRef } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';



const VideoTrimmer = ({ videoUrl, videoDuration, onSave, onClose }) => {
  const [startTime, setStartTime] = useState(0);
  const [endTime, setEndTime] = useState(videoDuration);
  const [trimmedVideo, setTrimmedVideo] = useState(null);
  const videoRef = useRef(null);
  const rangeRef = useRef(null);
  const ffmpegRef = useRef(null);

  const fetchFile = async (url) => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new File([blob], 'video.mp4', { type: 'video/mp4' });
  };
  const handleTrim = async () => {
    if (!ffmpegRef.current) {
      ffmpegRef.current = new FFmpeg({
        corePath:  "https://gw.alipayobjects.com/os/lib/ffmpeg/core/0.10.0/dist/ffmpeg-core.js",
      });
    }

    const ffmpeg = ffmpegRef.current;

    const videoFile = await fetchFile(videoUrl);
    const inputBuffer = await videoFile.arrayBuffer();
    await ffmpeg.load(inputBuffer, 'input.mp4');

    const outputOptions = [
      '-i', 'input.mp4', // input file
      '-ss', `${startTime}`, // start time
      '-t', `${endTime - startTime}`, // duration
      'output.mp4', // output file
    ];

    try {
      await ffmpeg.run(outputOptions);
      const outputBuffer = await ffmpeg.read('output.mp4');
      const reader = new FileReader();
      reader.onload = () => {
        const trimmedVideoFile = new File([new Uint8Array(reader.result)], 'trimmed_video.mp4', { type: 'video/mp4' });
        const trimmedVideoUrl = URL.createObjectURL(trimmedVideoFile);
        setTrimmedVideo(trimmedVideoUrl);
      };
      reader.readAsArrayBuffer(outputBuffer);
    } catch (error) {
      console.error('Error trimming video:', error);
    } finally {
      ffmpeg.terminate(); // Clean up resources (optional)
    }
  };

  const handleRangeChange = (e) => {
    const rangeValue = e.target.value;
    const startTime = rangeValue / 100 * videoDuration;
    const endTime = startTime + 60; // Trim to 1 minute
    setStartTime(startTime);
    setEndTime(endTime);
  };

  return (
    <div>
      <video
        ref={videoRef}
        src={videoUrl}
        controls
        width="100%"
        height="100%"
      />
      <input
        type="range"
        ref={rangeRef}
        min="0"
        max="100"
        value={(startTime / videoDuration) * 100}
        onChange={handleRangeChange}
      />
      <button onClick={handleTrim}>Trim</button>
      {trimmedVideo && (
        <video
          src={trimmedVideo}
          controls
          width="100%"
          height="100%"
        />
      )}
      <button onClick={onClose}>Close</button>
      <button onClick={() => onSave(trimmedVideo)}>Save</button>
    </div>
  );
};

export default VideoTrimmer;