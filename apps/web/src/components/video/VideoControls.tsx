'use client';

export interface VideoControlsProps {
  isPlaying: boolean;
  volume: number; // 0-100
  onPlayPause: () => void;
  onReplay: () => void;
  onVolumeChange: (volume: number) => void;
}

export function VideoControls({
  isPlaying,
  volume,
  onPlayPause,
  onReplay,
  onVolumeChange,
}: VideoControlsProps) {
  return (
    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        {/* Left side: Playback controls */}
        <div className="flex items-center gap-3">
          {/* Play/Pause Button */}
          <button
            onClick={onPlayPause}
            className="w-12 h-12 flex items-center justify-center bg-green-600 hover:bg-green-700 text-white rounded-full shadow-lg transition-all focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-black"
            aria-label={isPlaying ? 'Pause' : 'Play'}
            title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
          >
            {isPlaying ? (
              <svg
                className="w-6 h-6"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-6 h-6 ml-1"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </button>

          {/* Replay Button */}
          <button
            onClick={onReplay}
            className="w-10 h-10 flex items-center justify-center bg-white/20 hover:bg-white/30 text-white rounded-full shadow transition-all focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
            aria-label="Replay from beginning"
            title="Replay (R)"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Right side: Volume control */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Volume Icon */}
          <div className="text-white flex-shrink-0">
            {volume === 0 ? (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : volume < 50 ? (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM14.657 5.757a1 1 0 011.414 0A9.972 9.972 0 0118 10a9.972 9.972 0 01-1.929 4.243 1 1 0 01-1.414-1.414A7.971 7.971 0 0016 10c0-1.537-.433-2.974-1.186-4.186a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 20 20"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  fillRule="evenodd"
                  d="M9.383 3.076A1 1 0 0110 4v12a1 1 0 01-1.707.707L4.586 13H2a1 1 0 01-1-1V8a1 1 0 011-1h2.586l3.707-3.707a1 1 0 011.09-.217zM12.293 7.293a1 1 0 011.414 0L15 8.586l1.293-1.293a1 1 0 111.414 1.414L16.414 10l1.293 1.293a1 1 0 01-1.414 1.414L15 11.414l-1.293 1.293a1 1 0 01-1.414-1.414L13.586 10l-1.293-1.293a1 1 0 010-1.414z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>

          {/* Volume Slider */}
          <div className="relative flex-1 sm:w-32">
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => onVolumeChange(Number(e.target.value))}
              className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
              aria-label="Volume"
              title={`Volume: ${volume}%`}
            />
            <style jsx>{`
              .slider::-webkit-slider-thumb {
                appearance: none;
                width: 16px;
                height: 16px;
                background: white;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
              .slider::-moz-range-thumb {
                width: 16px;
                height: 16px;
                background: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
              }
              .slider::-webkit-slider-runnable-track {
                background: linear-gradient(
                  to right,
                  rgb(34, 197, 94) 0%,
                  rgb(34, 197, 94) ${volume}%,
                  rgba(255, 255, 255, 0.2) ${volume}%,
                  rgba(255, 255, 255, 0.2) 100%
                );
                height: 8px;
                border-radius: 4px;
              }
              .slider::-moz-range-track {
                background: rgba(255, 255, 255, 0.2);
                height: 8px;
                border-radius: 4px;
              }
              .slider::-moz-range-progress {
                background: rgb(34, 197, 94);
                height: 8px;
                border-radius: 4px;
              }
            `}</style>
          </div>

          {/* Volume Percentage */}
          <span className="text-white text-sm font-medium w-10 text-right">
            {volume}%
          </span>
        </div>
      </div>
    </div>
  );
}
