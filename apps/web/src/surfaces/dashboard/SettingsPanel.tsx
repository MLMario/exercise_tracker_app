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
import { WorkoutHistoryList } from './WorkoutHistoryList';
import { WorkoutDetail } from './WorkoutDetail';

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

type PanelView = 'menu' | 'exercises' | 'history' | 'workout-detail';

export function SettingsPanel({ isOpen, onClose, onLogout, onExerciseDeleted }: SettingsPanelProps) {
  const [panelView, setPanelView] = useState<PanelView>('menu');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [selectedWorkoutId, setSelectedWorkoutId] = useState<string | null>(null);

  const handleOpenCreate = () => setShowCreateModal(true);

  const handleSelectWorkout = (workoutId: string) => {
    setSelectedWorkoutId(workoutId);
    setPanelView('workout-detail');
  };

  // Reset to menu view after close animation finishes
  useEffect(() => {
    if (!isOpen) {
      const timer = setTimeout(() => {
        setPanelView('menu');
        setSelectedWorkoutId(null);
        if (!isCreating) {
          setShowCreateModal(false);
        }
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isCreating]);

  const handleBack = () => {
    if (isCreating) return;
    if (panelView === 'workout-detail') {
      setPanelView('history');
      setSelectedWorkoutId(null);
    } else if (panelView === 'exercises' || panelView === 'history') {
      setPanelView('menu');
    } else {
      onClose();
    }
  };

  const handleBackdropClick = () => {
    if (isCreating) return;
    onClose();
  };

  const headerTitle =
    panelView === 'menu' ? 'Settings' :
    panelView === 'exercises' ? 'My Exercises' :
    panelView === 'workout-detail' ? 'Workout Details' :
    'Workout History';
  const backLabel =
    panelView === 'menu' ? 'Back' :
    panelView === 'workout-detail' ? 'History' :
    'Settings';

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
              onWorkoutHistory={() => setPanelView('history')}
              onLogout={onLogout}
            />
          )}
          {panelView === 'exercises' && (
            <MyExercisesList
              onExerciseDeleted={onExerciseDeleted}
              showCreateModal={showCreateModal}
              onOpenCreate={handleOpenCreate}
              onCloseCreate={() => setShowCreateModal(false)}
              isCreating={isCreating}
              onIsCreatingChange={setIsCreating}
            />
          )}
          {panelView === 'history' && (
            <WorkoutHistoryList onSelectWorkout={handleSelectWorkout} />
          )}
          {panelView === 'workout-detail' && selectedWorkoutId && (
            <WorkoutDetail
              workoutId={selectedWorkoutId}
              onBack={() => {
                setPanelView('history');
                setSelectedWorkoutId(null);
              }}
            />
          )}
        </div>
      </div>
    </>
  );
}
