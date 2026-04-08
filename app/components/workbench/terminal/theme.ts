import type { ITheme } from '@xterm/xterm';

const style = getComputedStyle(document.documentElement);
const cssVar = (token: string) => style.getPropertyValue(token) || undefined;

export function getTerminalTheme(overrides?: ITheme): ITheme {
  return {
    cursor: cssVar('--buildstack-elements-terminal-cursorColor'),
    cursorAccent: cssVar('--buildstack-elements-terminal-cursorColorAccent'),
    foreground: cssVar('--buildstack-elements-terminal-textColor'),
    background: cssVar('--buildstack-elements-terminal-backgroundColor'),
    selectionBackground: cssVar('--buildstack-elements-terminal-selection-backgroundColor'),
    selectionForeground: cssVar('--buildstack-elements-terminal-selection-textColor'),
    selectionInactiveBackground: cssVar('--buildstack-elements-terminal-selection-backgroundColorInactive'),

    // ansi escape code colors
    black: cssVar('--buildstack-elements-terminal-color-black'),
    red: cssVar('--buildstack-elements-terminal-color-red'),
    green: cssVar('--buildstack-elements-terminal-color-green'),
    yellow: cssVar('--buildstack-elements-terminal-color-yellow'),
    blue: cssVar('--buildstack-elements-terminal-color-blue'),
    magenta: cssVar('--buildstack-elements-terminal-color-magenta'),
    cyan: cssVar('--buildstack-elements-terminal-color-cyan'),
    white: cssVar('--buildstack-elements-terminal-color-white'),
    brightBlack: cssVar('--buildstack-elements-terminal-color-brightBlack'),
    brightRed: cssVar('--buildstack-elements-terminal-color-brightRed'),
    brightGreen: cssVar('--buildstack-elements-terminal-color-brightGreen'),
    brightYellow: cssVar('--buildstack-elements-terminal-color-brightYellow'),
    brightBlue: cssVar('--buildstack-elements-terminal-color-brightBlue'),
    brightMagenta: cssVar('--buildstack-elements-terminal-color-brightMagenta'),
    brightCyan: cssVar('--buildstack-elements-terminal-color-brightCyan'),
    brightWhite: cssVar('--buildstack-elements-terminal-color-brightWhite'),

    ...overrides,
  };
}
