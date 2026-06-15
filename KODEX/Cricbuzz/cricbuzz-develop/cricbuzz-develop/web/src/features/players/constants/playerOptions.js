const PLAYER_ROLE_OPTIONS = [
  { value: 'BATSMAN', label: 'Batsman' },
  { value: 'BOWLER', label: 'Bowler' },
  { value: 'ALL_ROUNDER', label: 'All-rounder' },
  { value: 'WICKET_KEEPER', label: 'Wicket keeper' },
];

const PLAYER_BATTING_STYLE_OPTIONS = [
  { value: 'RIGHT_HAND_BAT', label: 'Right-hand bat' },
  { value: 'LEFT_HAND_BAT', label: 'Left-hand bat' },
];

const PLAYER_BOWLING_STYLE_OPTIONS = [
  { value: 'RIGHT_ARM_FAST', label: 'Right-arm fast' },
  { value: 'RIGHT_ARM_FAST_MEDIUM', label: 'Right-arm fast-medium' },
  { value: 'RIGHT_ARM_MEDIUM', label: 'Right-arm medium' },
  { value: 'LEFT_ARM_FAST', label: 'Left-arm fast' },
  { value: 'LEFT_ARM_FAST_MEDIUM', label: 'Left-arm fast-medium' },
  { value: 'LEFT_ARM_MEDIUM', label: 'Left-arm medium' },
  { value: 'RIGHT_ARM_OFF_BREAK', label: 'Right-arm off break' },
  { value: 'RIGHT_ARM_LEG_BREAK', label: 'Right-arm leg break' },
  { value: 'LEFT_ARM_ORTHODOX', label: 'Left-arm orthodox' },
  { value: 'LEFT_ARM_WRIST_SPIN', label: 'Left-arm wrist spin' },
];

function formatPlayerOptionValue(value = '') {
  return value
    .split('_')
    .filter(Boolean)
    .map((part) => part.charAt(0) + part.slice(1).toLowerCase())
    .join(' ');
}

export {
  PLAYER_BATTING_STYLE_OPTIONS,
  PLAYER_BOWLING_STYLE_OPTIONS,
  PLAYER_ROLE_OPTIONS,
  formatPlayerOptionValue,
};
