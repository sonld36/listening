'use client';

import { useState, useRef, useCallback } from 'react';
import ReactPlayer from 'react-player';
import { useClip } from '@/hooks/useClips';
import { VideoControls } from './VideoControls';

export interface VideoPlayerProps {
  clipId: string;
}

export function VideoPlayer({ clipId }: VideoPlayerProps) {
  const { clip, isLoading, isError, error } = useClip(clipId);
  const playerRef = useRef<ReactPlayer>(null);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(80); // 0-100%
  const [playerReady, setPlayerReady] = useState(false);

  // Handle play/pause toggle
  const handlePlayPause = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  // Handle replay (reset to beginning)
  const handleReplay = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.seekTo(0);
      setIsPlaying(true);
    }
  }, []);

  // Handle volume change (0-100%)
  const handleVolumeChange = useCallback((newVolume: number) => {
    setVolume(newVolume);
  }, []);

  // Handle player ready
  const handleReady = useCallback(() => {
    setPlayerReady(true);
  }, []);

  // Handle player error
  const handleError = useCallback((e: unknown) => {
    console.error('Video player error:', e);
    setIsPlaying(false);
  }, []);

  // Keyboard shortcuts
  const handleKeyPress = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        handlePlayPause();
      } else if (e.code === 'KeyR') {
        e.preventDefault();
        handleReplay();
      }
    },
    [handlePlayPause, handleReplay]
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="w-full aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading video...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isError || !clip) {
    return (
      <div className="w-full aspect-video bg-red-50 rounded-lg border-2 border-red-200 flex items-center justify-center">
        <div className="text-center p-6">
          <div className="text-5xl mb-4">⚠️</div>
          <h3 className="text-xl font-semibold text-red-900 mb-2">
            Failed to Load Video
          </h3>
          <p className="text-red-700">
            {error?.message || 'The requested clip could not be found.'}
          </p>
          <button
            onClick={() => window.location.href = '/dashboard'}
            className="mt-4 inline-flex items-center px-4 py-2 border border-red-300 rounded-md shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4">
      {/* Video Info */}
      <div className="mb-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
          {clip.title}
        </h1>
        {clip.description && (
          <p className="mt-2 text-gray-600">{clip.description}</p>
        )}
        <div className="mt-2 flex flex-wrap gap-2">
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            {clip.difficultyLevel}
          </span>
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {clip.durationSeconds}s
          </span>
        </div>
      </div>

      {/* Video Player Container */}
      <div
        className="relative w-full aspect-video bg-black rounded-lg overflow-hidden shadow-lg"
        onKeyDown={handleKeyPress}
        tabIndex={0}
        role="region"
        aria-label="Video player"
      >
        {/* react-player */}
        <ReactPlayer
          ref={playerRef}
          url={clip.clipUrl}
          playing={isPlaying}
          volume={volume / 100} // Convert 0-100 to 0-1
          controls={false} // Use custom controls
          width="100%"
          height="100%"
          onReady={handleReady}
          onError={handleError}
          config={{
            file: {
              attributes: {
                controlsList: 'nodownload',
                preload: 'metadata',
              },
            },
          }}
        />

        {/* Custom Controls Overlay */}
        {playerReady && (
          <VideoControls
            isPlaying={isPlaying}
            volume={volume}
            onPlayPause={handlePlayPause}
            onReplay={handleReplay}
            onVolumeChange={handleVolumeChange}
          />
        )}

        {/* Loading overlay while player initializes */}
        {!playerReady && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
          </div>
        )}
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="text-sm text-gray-600 bg-gray-50 rounded-md p-3">
        <p className="font-medium mb-1">Keyboard Shortcuts:</p>
        <ul className="space-y-1 text-xs">
          <li>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-800">
              Space
            </kbd>{' '}
            - Play/Pause
          </li>
          <li>
            <kbd className="px-2 py-1 bg-white border border-gray-300 rounded text-gray-800">
              R
            </kbd>{' '}
            - Replay from beginning
          </li>
        </ul>
      </div>
    </div>
  );
}
