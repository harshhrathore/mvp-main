/**
 * VoiceRecorder Component
 * Visual interface for voice recording with state indicators
 */

import React from 'react';
import { motion } from 'framer-motion';
import { formatDuration } from '../../utils/audioUtils';

interface VoiceRecorderProps {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioLevel: number;
  onStart: () => void;
  onStop: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
  error?: string | null;
}

const VoiceRecorder: React.FC<VoiceRecorderProps> = ({
  isRecording,
  isPaused,
  duration,
  audioLevel,
  onStart,
  onStop,
  onPause,
  onResume,
  onCancel,
  error,
}) => {
  return (
    <div style={styles.container}>
      {/* Recording Indicator */}
      {isRecording && (
        <motion.div
          style={styles.recordingIndicator}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
        >
          <div style={styles.recordingDot}>
            <motion.div
              style={styles.recordingPulse}
              animate={{
                scale: isPaused ? 1 : [1, 1.3, 1],
                opacity: isPaused ? 0.5 : [1, 0.5, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            />
          </div>
          <span style={styles.recordingText}>
            {isPaused ? 'Paused' : 'Recording'}
          </span>
        </motion.div>
      )}

      {/* Duration Timer */}
      {isRecording && (
        <motion.div
          style={styles.durationTimer}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {formatDuration(duration)}
        </motion.div>
      )}

      {/* Audio Level Indicator */}
      {isRecording && !isPaused && (
        <motion.div
          style={styles.audioLevelContainer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <div style={styles.audioLevelBar}>
            <motion.div
              style={{
                ...styles.audioLevelFill,
                width: `${audioLevel}%`,
              }}
              animate={{ width: `${audioLevel}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>
        </motion.div>
      )}

      {/* Control Buttons */}
      <div style={styles.controls}>
        {!isRecording ? (
          <motion.button
            style={styles.startButton}
            onClick={onStart}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <span style={styles.buttonIcon}>🎤</span>
            Start Recording
          </motion.button>
        ) : (
          <>
            {!isPaused ? (
              <motion.button
                style={styles.pauseButton}
                onClick={onPause}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span style={styles.buttonIcon}>⏸</span>
                Pause
              </motion.button>
            ) : (
              <motion.button
                style={styles.resumeButton}
                onClick={onResume}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span style={styles.buttonIcon}>▶️</span>
                Resume
              </motion.button>
            )}
            <motion.button
              style={styles.stopButton}
              onClick={onStop}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span style={styles.buttonIcon}>⏹</span>
              Stop
            </motion.button>
            <motion.button
              style={styles.cancelButton}
              onClick={onCancel}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span style={styles.buttonIcon}>✕</span>
              Cancel
            </motion.button>
          </>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <motion.div
          style={styles.errorMessage}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.div>
      )}
    </div>
  );
};

export default VoiceRecorder;

/* ===================== STYLES ===================== */

const styles: { [key: string]: React.CSSProperties } = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
    background: 'linear-gradient(135deg, #DCEAD7 0%, #D0E4CB 100%)',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
  },

  recordingIndicator: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },

  recordingDot: {
    position: 'relative',
    width: '16px',
    height: '16px',
  },

  recordingPulse: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    borderRadius: '50%',
    background: '#FF4444',
  },

  recordingText: {
    fontSize: '16px',
    fontWeight: 600,
    color: '#2B2B2B',
  },

  durationTimer: {
    fontSize: '24px',
    fontWeight: 700,
    color: '#2B2B2B',
    fontFamily: 'monospace',
  },

  audioLevelContainer: {
    width: '100%',
    maxWidth: '300px',
  },

  audioLevelBar: {
    width: '100%',
    height: '8px',
    background: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '4px',
    overflow: 'hidden',
  },

  audioLevelFill: {
    height: '100%',
    background: 'linear-gradient(90deg, #8FA98F 0%, #6B8F6B 100%)',
    transition: 'width 0.1s ease',
  },

  controls: {
    display: 'flex',
    gap: '12px',
    flexWrap: 'wrap',
    justifyContent: 'center',
  },

  startButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px 24px',
    background: 'linear-gradient(135deg, #8FA98F 0%, #6B8F6B 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '16px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(143, 169, 143, 0.3)',
  },

  pauseButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #FFF3D9 0%, #FFF0C8 100%)',
    color: '#2B2B2B',
    border: '1px solid #F0C08A',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(240, 192, 138, 0.2)',
  },

  resumeButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #8FA98F 0%, #6B8F6B 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(143, 169, 143, 0.3)',
  },

  stopButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #FF6B6B 0%, #EE5A5A 100%)',
    color: '#FFFFFF',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(255, 107, 107, 0.3)',
  },

  cancelButton: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 20px',
    background: '#E0E0E0',
    color: '#2B2B2B',
    border: 'none',
    borderRadius: '12px',
    fontSize: '14px',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },

  buttonIcon: {
    fontSize: '18px',
  },

  errorMessage: {
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #FFE5E5 0%, #FFD5D5 100%)',
    border: '1px solid #FF9999',
    borderRadius: '8px',
    color: '#CC0000',
    fontSize: '14px',
    fontWeight: 500,
    textAlign: 'center',
  },
};
