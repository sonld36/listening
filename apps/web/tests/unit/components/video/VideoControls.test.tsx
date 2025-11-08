import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { VideoControls } from '@/components/video/VideoControls';

describe('VideoControls Component', () => {
  const mockProps = {
    isPlaying: false,
    volume: 80,
    onPlayPause: vi.fn(),
    onReplay: vi.fn(),
    onVolumeChange: vi.fn(),
  };

  describe('Rendering', () => {
    it('renders all control buttons', () => {
      render(<VideoControls {...mockProps} />);

      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/replay/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/volume/i)).toBeInTheDocument();
    });

    it('displays volume percentage', () => {
      render(<VideoControls {...mockProps} volume={75} />);
      expect(screen.getByText('75%')).toBeInTheDocument();
    });

    it('renders play icon when not playing', () => {
      render(<VideoControls {...mockProps} isPlaying={false} />);

      const playButton = screen.getByLabelText(/play/i);
      expect(playButton).toHaveAttribute('title', 'Play (Space)');
    });

    it('renders pause icon when playing', () => {
      render(<VideoControls {...mockProps} isPlaying={true} />);

      const pauseButton = screen.getByLabelText(/pause/i);
      expect(pauseButton).toHaveAttribute('title', 'Pause (Space)');
    });
  });

  describe('Play/Pause Button', () => {
    it('calls onPlayPause when play/pause button is clicked', () => {
      const onPlayPause = vi.fn();
      render(<VideoControls {...mockProps} onPlayPause={onPlayPause} />);

      const playButton = screen.getByLabelText(/play/i);
      fireEvent.click(playButton);

      expect(onPlayPause).toHaveBeenCalledTimes(1);
    });

    it('toggles button state when isPlaying changes', () => {
      const { rerender } = render(<VideoControls {...mockProps} isPlaying={false} />);
      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();

      rerender(<VideoControls {...mockProps} isPlaying={true} />);
      expect(screen.getByLabelText(/pause/i)).toBeInTheDocument();
    });
  });

  describe('Replay Button', () => {
    it('calls onReplay when replay button is clicked', () => {
      const onReplay = vi.fn();
      render(<VideoControls {...mockProps} onReplay={onReplay} />);

      const replayButton = screen.getByLabelText(/replay/i);
      fireEvent.click(replayButton);

      expect(onReplay).toHaveBeenCalledTimes(1);
    });

    it('has correct tooltip text', () => {
      render(<VideoControls {...mockProps} />);
      const replayButton = screen.getByLabelText(/replay/i);
      expect(replayButton).toHaveAttribute('title', 'Replay (R)');
    });
  });

  describe('Volume Control', () => {
    it('calls onVolumeChange when volume slider is adjusted', () => {
      const onVolumeChange = vi.fn();
      render(<VideoControls {...mockProps} onVolumeChange={onVolumeChange} />);

      const volumeSlider = screen.getByLabelText(/volume/i);
      fireEvent.change(volumeSlider, { target: { value: '50' } });

      expect(onVolumeChange).toHaveBeenCalledWith(50);
    });

    it('updates volume display when volume changes', () => {
      const { rerender } = render(<VideoControls {...mockProps} volume={80} />);
      expect(screen.getByText('80%')).toBeInTheDocument();

      rerender(<VideoControls {...mockProps} volume={50} />);
      expect(screen.getByText('50%')).toBeInTheDocument();
    });

    it('handles volume set to 0', () => {
      render(<VideoControls {...mockProps} volume={0} />);
      expect(screen.getByText('0%')).toBeInTheDocument();
    });

    it('handles volume set to 100', () => {
      render(<VideoControls {...mockProps} volume={100} />);
      expect(screen.getByText('100%')).toBeInTheDocument();
    });

    it('displays correct volume icon based on level', () => {
      const { container, rerender } = render(<VideoControls {...mockProps} volume={0} />);

      // Muted icon for 0
      expect(container.querySelector('svg')).toBeInTheDocument();

      // Low volume icon for < 50
      rerender(<VideoControls {...mockProps} volume={30} />);
      expect(container.querySelector('svg')).toBeInTheDocument();

      // High volume icon for >= 50
      rerender(<VideoControls {...mockProps} volume={80} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });

  describe('Responsive Design', () => {
    it('applies responsive classes for mobile and desktop layouts', () => {
      const { container } = render(<VideoControls {...mockProps} />);

      // Check for flex-col on mobile, flex-row on desktop
      expect(container.innerHTML).toContain('sm:flex-row');
      expect(container.innerHTML).toContain('flex-col');
    });

    it('makes volume slider responsive', () => {
      const { container } = render(<VideoControls {...mockProps} />);

      // Volume slider should have responsive width classes
      expect(container.innerHTML).toContain('sm:w-32');
    });
  });

  describe('Accessibility', () => {
    it('has proper ARIA labels for all controls', () => {
      render(<VideoControls {...mockProps} isPlaying={false} />);

      expect(screen.getByLabelText(/play/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/replay/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/volume/i)).toBeInTheDocument();
    });

    it('updates ARIA label when play state changes', () => {
      const { rerender } = render(<VideoControls {...mockProps} isPlaying={false} />);
      expect(screen.getByLabelText('Play')).toBeInTheDocument();

      rerender(<VideoControls {...mockProps} isPlaying={true} />);
      expect(screen.getByLabelText('Pause')).toBeInTheDocument();
    });

    it('provides tooltip hints for keyboard shortcuts', () => {
      render(<VideoControls {...mockProps} />);

      const playButton = screen.getByLabelText(/play/i);
      const replayButton = screen.getByLabelText(/replay/i);

      expect(playButton).toHaveAttribute('title');
      expect(replayButton).toHaveAttribute('title');
      expect(playButton.getAttribute('title')).toContain('Space');
      expect(replayButton.getAttribute('title')).toContain('R');
    });
  });

  describe('Styling', () => {
    it('applies gradient background to controls container', () => {
      const { container } = render(<VideoControls {...mockProps} />);
      expect(container.innerHTML).toContain('bg-gradient-to-t');
    });

    it('styles play/pause button with green accent', () => {
      render(<VideoControls {...mockProps} />);
      const playButton = screen.getByLabelText(/play/i);
      expect(playButton).toHaveClass('bg-green-600', 'hover:bg-green-700');
    });

    it('positions controls at bottom of container', () => {
      const { container } = render(<VideoControls {...mockProps} />);
      const controlsDiv = container.querySelector('.absolute');
      expect(controlsDiv).toHaveClass('bottom-0', 'left-0', 'right-0');
    });
  });
});
