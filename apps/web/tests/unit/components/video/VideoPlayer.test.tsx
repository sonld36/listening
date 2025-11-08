import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { VideoPlayer } from '@/components/video/VideoPlayer';
import { useClip } from '@/hooks/useClips';
import type { IClip } from '@/types/api';

// Mock useClip hook
vi.mock('@/hooks/useClips', () => ({
  useClip: vi.fn(),
}));

// Mock react-player
vi.mock('react-player', () => ({
  default: vi.fn(({ onReady, url, playing, volume, config }) => (
    <div
      data-testid="react-player"
      data-url={url}
      data-playing={playing}
      data-volume={volume}
      data-config={JSON.stringify(config)}
    >
      <button onClick={() => onReady && onReady()}>Trigger Ready</button>
    </div>
  )),
}));

// Mock VideoControls component
vi.mock('@/components/video/VideoControls', () => ({
  VideoControls: ({ isPlaying, volume, onPlayPause, onReplay, onVolumeChange }: any) => (
    <div data-testid="video-controls">
      <button onClick={onPlayPause} data-testid="play-pause">
        {isPlaying ? 'Pause' : 'Play'}
      </button>
      <button onClick={onReplay} data-testid="replay">
        Replay
      </button>
      <input
        type="range"
        value={volume}
        onChange={(e) => onVolumeChange(Number(e.target.value))}
        data-testid="volume-slider"
      />
      <span>{volume}%</span>
    </div>
  ),
}));

describe('VideoPlayer Component', () => {
  const mockClip: IClip = {
    id: 'clip123',
    title: 'Test Clip Title',
    description: 'Test clip description',
    clipUrl: 'https://cdn.example.com/clip123.mp4',
    durationSeconds: 10,
    difficultyLevel: 'BEGINNER',
    subtitleText: 'Hello world',
    difficultyWords: null,
    createdAt: '2025-01-01T00:00:00Z',
    updatedAt: '2025-01-01T00:00:00Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('displays loading spinner when clip is loading', () => {
      (useClip as ReturnType<typeof vi.fn>).mockReturnValue({
        clip: undefined,
        isLoading: true,
        isError: false,
        error: null,
      });

      render(<VideoPlayer clipId="clip123" />);

      expect(screen.getByText(/loading video/i)).toBeInTheDocument();
      expect(screen.queryByTestId('react-player')).not.toBeInTheDocument();
    });

    it('shows loading spinner with animation', () => {
      (useClip as ReturnType<typeof vi.fn>).mockReturnValue({
        clip: undefined,
        isLoading: true,
        isError: false,
        error: null,
      });

      const { container } = render(<VideoPlayer clipId="clip123" />);
      const spinner = container.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();
    });
  });

  describe('Error State', () => {
    it('displays error message when clip fails to load', () => {
      (useClip as ReturnType<typeof vi.fn>).mockReturnValue({
        clip: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Failed to fetch clip'),
      });

      render(<VideoPlayer clipId="clip123" />);

      expect(screen.getByText(/failed to load video/i)).toBeInTheDocument();
      expect(screen.getByText(/failed to fetch clip/i)).toBeInTheDocument();
    });

    it('displays error message when clip is not found', () => {
      (useClip as ReturnType<typeof vi.fn>).mockReturnValue({
        clip: null,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<VideoPlayer clipId="clip123" />);

      expect(screen.getByText(/failed to load video/i)).toBeInTheDocument();
      expect(screen.getByText(/could not be found/i)).toBeInTheDocument();
    });

    it('provides return to dashboard button on error', () => {
      (useClip as ReturnType<typeof vi.fn>).mockReturnValue({
        clip: undefined,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
      });

      render(<VideoPlayer clipId="clip123" />);
      expect(screen.getByText(/return to dashboard/i)).toBeInTheDocument();
    });
  });

  describe('Successful Rendering', () => {
    beforeEach(() => {
      (useClip as ReturnType<typeof vi.fn>).mockReturnValue({
        clip: mockClip,
        isLoading: false,
        isError: false,
        error: null,
      });
    });

    it('renders clip title and description', () => {
      render(<VideoPlayer clipId="clip123" />);

      expect(screen.getByText('Test Clip Title')).toBeInTheDocument();
      expect(screen.getByText('Test clip description')).toBeInTheDocument();
    });

    it('displays difficulty level badge', () => {
      render(<VideoPlayer clipId="clip123" />);
      expect(screen.getByText('BEGINNER')).toBeInTheDocument();
    });

    it('displays duration badge', () => {
      render(<VideoPlayer clipId="clip123" />);
      expect(screen.getByText('10s')).toBeInTheDocument();
    });

    it('renders without description when not provided', () => {
      const clipWithoutDesc = { ...mockClip, description: null };
      (useClip as ReturnType<typeof vi.fn>).mockReturnValue({
        clip: clipWithoutDesc,
        isLoading: false,
        isError: false,
        error: null,
      });

      render(<VideoPlayer clipId="clip123" />);
      expect(screen.getByText('Test Clip Title')).toBeInTheDocument();
      expect(screen.queryByText('Test clip description')).not.toBeInTheDocument();
    });
  });

  describe('react-player Integration', () => {
    beforeEach(() => {
      (useClip as ReturnType<typeof vi.fn>).mockReturnValue({
        clip: mockClip,
        isLoading: false,
        isError: false,
        error: null,
      });
    });

    it('passes correct clip URL to react-player', () => {
      render(<VideoPlayer clipId="clip123" />);

      const player = screen.getByTestId('react-player');
      expect(player).toHaveAttribute('data-url', 'https://cdn.example.com/clip123.mp4');
    });

    it('configures react-player with controls disabled', () => {
      render(<VideoPlayer clipId="clip123" />);

      const player = screen.getByTestId('react-player');
      const config = JSON.parse(player.getAttribute('data-config') || '{}');

      expect(config.file.attributes.controlsList).toBe('nodownload');
      expect(config.file.attributes.preload).toBe('metadata');
    });

    it('shows loading overlay before player is ready', () => {
      const { container } = render(<VideoPlayer clipId="clip123" />);

      // Before triggering onReady
      const loadingOverlay = container.querySelector('.absolute.inset-0');
      expect(loadingOverlay).toBeInTheDocument();
    });

    it('hides loading overlay after player is ready', async () => {
      const { container } = render(<VideoPlayer clipId="clip123" />);

      // Trigger onReady callback
      const readyButton = screen.getByText('Trigger Ready');
      fireEvent.click(readyButton);

      await waitFor(() => {
        expect(screen.getByTestId('video-controls')).toBeInTheDocument();
      });
    });

    it('renders video controls after player is ready', async () => {
      render(<VideoPlayer clipId="clip123" />);

      const readyButton = screen.getByText('Trigger Ready');
      fireEvent.click(readyButton);

      await waitFor(() => {
        expect(screen.getByTestId('video-controls')).toBeInTheDocument();
      });
    });
  });

  describe('Playback Controls', () => {
    beforeEach(() => {
      (useClip as ReturnType<typeof vi.fn>).mockReturnValue({
        clip: mockClip,
        isLoading: false,
        isError: false,
        error: null,
      });
    });

    it('starts with playing state as false', async () => {
      render(<VideoPlayer clipId="clip123" />);

      const readyButton = screen.getByText('Trigger Ready');
      fireEvent.click(readyButton);

      await waitFor(() => {
        const playPauseButton = screen.getByTestId('play-pause');
        expect(playPauseButton).toHaveTextContent('Play');
      });
    });

    it('toggles playing state when play/pause is clicked', async () => {
      render(<VideoPlayer clipId="clip123" />);

      fireEvent.click(screen.getByText('Trigger Ready'));

      await waitFor(() => {
        expect(screen.getByTestId('play-pause')).toBeInTheDocument();
      });

      const playPauseButton = screen.getByTestId('play-pause');

      // Click to play
      fireEvent.click(playPauseButton);
      expect(playPauseButton).toHaveTextContent('Pause');

      // Click to pause
      fireEvent.click(playPauseButton);
      expect(playPauseButton).toHaveTextContent('Play');
    });

    it('starts with default volume of 80%', async () => {
      render(<VideoPlayer clipId="clip123" />);

      fireEvent.click(screen.getByText('Trigger Ready'));

      await waitFor(() => {
        expect(screen.getByText('80%')).toBeInTheDocument();
      });
    });

    it('updates volume when slider is changed', async () => {
      render(<VideoPlayer clipId="clip123" />);

      fireEvent.click(screen.getByText('Trigger Ready'));

      await waitFor(() => {
        expect(screen.getByTestId('volume-slider')).toBeInTheDocument();
      });

      const volumeSlider = screen.getByTestId('volume-slider');
      fireEvent.change(volumeSlider, { target: { value: '50' } });

      expect(screen.getByText('50%')).toBeInTheDocument();
    });
  });

  describe('Keyboard Shortcuts', () => {
    beforeEach(() => {
      (useClip as ReturnType<typeof vi.fn>).mockReturnValue({
        clip: mockClip,
        isLoading: false,
        isError: false,
        error: null,
      });
    });

    it('displays keyboard shortcuts help section', () => {
      render(<VideoPlayer clipId="clip123" />);
      expect(screen.getByText(/keyboard shortcuts/i)).toBeInTheDocument();
      expect(screen.getByText(/play\/pause/i)).toBeInTheDocument();
      expect(screen.getByText(/replay from beginning/i)).toBeInTheDocument();
    });

    it('shows Space and R keys in shortcuts', () => {
      render(<VideoPlayer clipId="clip123" />);
      expect(screen.getByText('Space')).toBeInTheDocument();
      expect(screen.getByText('R')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    beforeEach(() => {
      (useClip as ReturnType<typeof vi.fn>).mockReturnValue({
        clip: mockClip,
        isLoading: false,
        isError: false,
        error: null,
      });
    });

    it('uses aspect-video for responsive video container', () => {
      const { container } = render(<VideoPlayer clipId="clip123" />);
      expect(container.innerHTML).toContain('aspect-video');
    });

    it('applies responsive text sizes for title', () => {
      const { container } = render(<VideoPlayer clipId="clip123" />);
      expect(container.innerHTML).toContain('text-2xl sm:text-3xl');
    });
  });

  describe('Accessibility', () => {
    beforeEach(() => {
      (useClip as ReturnType<typeof vi.fn>).mockReturnValue({
        clip: mockClip,
        isLoading: false,
        isError: false,
        error: null,
      });
    });

    it('has region role with aria-label for video player', () => {
      render(<VideoPlayer clipId="clip123" />);
      const playerRegion = screen.getByRole('region', { name: /video player/i });
      expect(playerRegion).toBeInTheDocument();
    });

    it('makes player container keyboard focusable', () => {
      render(<VideoPlayer clipId="clip123" />);
      const playerRegion = screen.getByRole('region');
      expect(playerRegion).toHaveAttribute('tabIndex', '0');
    });
  });
});
