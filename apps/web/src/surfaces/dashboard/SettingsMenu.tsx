/**
 * SettingsMenu Component
 *
 * Menu view inside the Settings panel.
 * Shows "My Exercises" card item and "Log Out" button.
 */

interface SettingsMenuProps {
  /** Navigate to My Exercises sub-view */
  onMyExercises: () => void;
  /** Logout callback (conditionally renders button) */
  onLogout?: () => void;
}

export function SettingsMenu({ onMyExercises, onLogout }: SettingsMenuProps) {
  return (
    <div class="settings-menu">
      {/* My Exercises menu item */}
      <div class="settings-menu-item" onClick={onMyExercises}>
        <div class="settings-menu-item-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M6 5h12M6 12h12M6 19h12"></path>
            <circle cx="3" cy="5" r="1" fill="currentColor"></circle>
            <circle cx="3" cy="12" r="1" fill="currentColor"></circle>
            <circle cx="3" cy="19" r="1" fill="currentColor"></circle>
          </svg>
        </div>
        <div class="settings-menu-item-content">
          <span class="settings-menu-item-label">My Exercises</span>
        </div>
        <div class="settings-menu-item-chevron">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M9 18l6-6-6-6"></path>
          </svg>
        </div>
      </div>

      {/* Log Out button */}
      {onLogout && (
        <button class="settings-logout-btn" onClick={onLogout} type="button">
          Log Out
        </button>
      )}
    </div>
  );
}
