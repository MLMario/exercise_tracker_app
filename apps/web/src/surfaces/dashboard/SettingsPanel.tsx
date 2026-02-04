/**
 * SettingsPanel Component
 *
 * Slide-in panel from the right side of the dashboard.
 * Contains settings menu with internal sub-navigation.
 * Always rendered in DOM -- visibility controlled via CSS `.open` class.
 */

import { useState, useEffect } from 'preact/hooks';
import { SettingsMenu } from './SettingsMenu';
import { MyExercisesList } from './MyExercisesList';

interface SettingsPanelProps {
  /** Whether the panel is currently open */
  isOpen: boolean;
  /** Callback to close the panel */
  onClose: () => void;
  /** Logout callback passed through to SettingsMenu */
  onLogout?: () => void;
  /** Callback when an exercise is deleted, to refresh charts */
  onExerciseDeleted?: () => void;
}

type PanelView = 'menu' | 'exercises';

export function SettingsPanel({ isOpen, onClose, onLogout, onExerciseDeleted }: SettingsPanelProps) {
  const [panelView, setPanelView] = useState<PanelView>('menu');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleOpenCreate = () => setShowCreateModal(true);

  // Reset to menu view after close animation finishes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setPanelView('menu');
        if (!isCreating) {
          setShowCreateModal(false);
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isCreating]);

  const handleBack = () => {
    if (isCreating) return;
    if (panelView === 'exercises') {
      setPanelView('menu');
    } else {
      onClose();
    }
  };

  const handleBackdropClick = () => {
    if (isCreating) return;
    onClose();
  };

  const headerTitle = panelView === 'menu' ? 'Settings' : 'My Exercises';
  const backLabel = panelView === 'menu' ? 'Back' : 'Settings';

  return (
    <>
      <div
        class={`settings-backdrop ${isOpen ? 'open' : ''}`}
        onClick={handleBackdropClick}
      />
      <div class={`settings-panel ${isOpen ? 'open' : ''}`}>
        {/* Panel header */}
        <div class="settings-panel-header">
          <div class="settings-header-left">
            <button class="settings-back-btn" onClick={handleBack} type="button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 12H5M12 19l-7-7 7-7"></path>
              </svg>
              {backLabel}
            </button>
            <span class="settings-header-title">{headerTitle}</span>
          </div>
          {panelView === 'exercises' && (
            <button type="button" class="btn btn-primary btn-sm" style={{ marginLeft: 'auto' }} onClick={handleOpenCreate}>
              + Create
            </button>
          )}
        </div>

        {/* Panel content */}
        <div class="settings-panel-content">
          {panelView === 'menu' && (
            <SettingsMenu
              onMyExercises={() => setPanelView('exercises')}
              onLogout={onLogout}
            />
          )}
          {panelView === 'exercises' && (
            <MyExercisesList
              onExerciseDeleted={onExerciseDeleted}
              showCreateModal={showCreateModal}
              onOpenCreate={handleOpenCreate}
              onCloseCreate={() => setShowCreateModal(false)}
              onCreatingChange={setIsCreating}
            />
          )}
        </div>
      </div>
    </>
  );
}
