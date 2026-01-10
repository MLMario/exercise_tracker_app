/**
 * Rest Timer Module
 * Manages rest periods between sets with countdown and bell notification
 */

// Internal state
let timerInterval = null;
let remaining = 0;
let total = 0;
let isRunning = false;
let isPaused = false;
let audio = null;
let onTickCallback = null;
let onCompleteCallback = null;

/**
 * Start a countdown timer
 * @param {number} seconds - Duration in seconds
 * @param {function} onTick - Callback called every second with remaining seconds
 * @param {function} onComplete - Callback called when timer reaches 0
 * @returns {number} Timer ID
 */
function startTimer(seconds, onTick, onComplete) {
  // Stop any existing timer first
  stopTimer();

  // Initialize state
  remaining = seconds;
  total = seconds;
  isRunning = true;
  isPaused = false;
  onTickCallback = onTick;
  onCompleteCallback = onComplete;

  // Call onTick immediately with starting value
  if (onTickCallback) {
    onTickCallback(remaining);
  }

  // Start countdown
  timerInterval = setInterval(() => {
    remaining--;

    // Call tick callback
    if (onTickCallback) {
      onTickCallback(remaining);
    }

    // Check if timer is complete
    if (remaining <= 0) {
      stopTimer();
      playBellSound();

      // Call completion callback
      if (onCompleteCallback) {
        onCompleteCallback();
      }
    }
  }, 1000);

  return timerInterval;
}

/**
 * Stop the current timer
 */
function stopTimer() {
  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  isRunning = false;
  isPaused = false;
  remaining = 0;
  total = 0;
  onTickCallback = null;
  onCompleteCallback = null;
}

/**
 * Pause the current timer
 */
function pauseTimer() {
  if (!isRunning || isPaused) {
    return;
  }

  if (timerInterval) {
    clearInterval(timerInterval);
    timerInterval = null;
  }

  isRunning = false;
  isPaused = true;
}

/**
 * Resume the paused timer
 */
function resumeTimer() {
  if (!isPaused || isRunning) {
    return;
  }

  isRunning = true;
  isPaused = false;

  // Restart countdown from remaining time
  timerInterval = setInterval(() => {
    remaining--;

    // Call tick callback
    if (onTickCallback) {
      onTickCallback(remaining);
    }

    // Check if timer is complete
    if (remaining <= 0) {
      stopTimer();
      playBellSound();

      // Call completion callback
      if (onCompleteCallback) {
        onCompleteCallback();
      }
    }
  }, 1000);
}

/**
 * Adjust the current timer by adding or subtracting seconds
 * @param {number} seconds - Seconds to add (positive) or subtract (negative)
 */
function adjustTimer(seconds) {
  if (!isRunning && !isPaused) {
    return;
  }

  remaining = Math.max(0, remaining + seconds);

  // Update total if we increased beyond original
  if (remaining > total) {
    total = remaining;
  }

  // Call tick callback with new value
  if (onTickCallback) {
    onTickCallback(remaining);
  }

  // If adjusted to 0 or below while running, complete the timer
  if (remaining <= 0 && isRunning) {
    stopTimer();
    playBellSound();

    if (onCompleteCallback) {
      onCompleteCallback();
    }
  }
}

/**
 * Get current timer state
 * @returns {object} State object with isRunning, isPaused, remaining, total
 */
function getTimerState() {
  return {
    isRunning: isRunning,
    isPaused: isPaused,
    remaining: remaining,
    total: total
  };
}

/**
 * Play the bell sound notification
 */
function playBellSound() {
  try {
    // Lazy load audio element on first use
    if (!audio) {
      audio = new Audio('./assets/bell.mp3');
    }

    // Reset to beginning in case it was played before
    audio.currentTime = 0;

    // Play the sound
    const playPromise = audio.play();

    // Handle browsers that require user gesture for autoplay
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        console.warn('Bell sound could not play (browser may require user interaction):', error);
      });
    }
  } catch (error) {
    console.error('Error playing bell sound:', error);
  }
}

/**
 * Format seconds into M:SS or MM:SS format
 * @param {number} seconds - Seconds to format
 * @returns {string} Formatted time string
 */
function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;

  // Pad seconds with leading zero if needed
  const secsPadded = secs.toString().padStart(2, '0');

  return `${mins}:${secsPadded}`;
}

// Export module to global scope
window.timer = {
  start: startTimer,
  stop: stopTimer,
  pause: pauseTimer,
  resume: resumeTimer,
  adjust: adjustTimer,
  getState: getTimerState,
  playBell: playBellSound,
  formatTime: formatTime
};
