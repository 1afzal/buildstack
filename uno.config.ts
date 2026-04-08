import { globSync } from 'fast-glob';
import fs from 'node:fs/promises';
import { basename } from 'node:path';
import { defineConfig, presetIcons, presetUno, transformerDirectives } from 'unocss';

const iconPaths = globSync('./icons/*.svg');

const collectionName = 'buildstack';

const customIconCollection = iconPaths.reduce(
  (acc, iconPath) => {
    const [iconName] = basename(iconPath).split('.');

    acc[collectionName] ??= {};
    acc[collectionName][iconName] = async () => fs.readFile(iconPath, 'utf8');

    return acc;
  },
  {} as Record<string, Record<string, () => Promise<string>>>,
);

const BASE_COLORS = {
  white: '#FFFFFF',
  gray: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#0A0A0A',
  },
  accent: {
    50: '#FAFAFA',
    100: '#F4F4F5',
    200: '#E4E4E7',
    300: '#D4D4D8',
    400: '#A1A1AA',
    500: '#71717A',
    600: '#52525B',
    700: '#3F3F46',
    800: '#27272A',
    900: '#18181B',
    950: '#09090B',
  },
  green: {
    50: '#F0FDF4',
    100: '#DCFCE7',
    200: '#BBF7D0',
    300: '#86EFAC',
    400: '#4ADE80',
    500: '#22C55E',
    600: '#16A34A',
    700: '#15803D',
    800: '#166534',
    900: '#14532D',
    950: '#052E16',
  },
  orange: {
    50: '#FFFAEB',
    100: '#FEEFC7',
    200: '#FEDF89',
    300: '#FEC84B',
    400: '#FDB022',
    500: '#F79009',
    600: '#DC6803',
    700: '#B54708',
    800: '#93370D',
    900: '#792E0D',
  },
  red: {
    50: '#FEF2F2',
    100: '#FEE2E2',
    200: '#FECACA',
    300: '#FCA5A5',
    400: '#F87171',
    500: '#EF4444',
    600: '#DC2626',
    700: '#B91C1C',
    800: '#991B1B',
    900: '#7F1D1D',
    950: '#450A0A',
  },
};

const COLOR_PRIMITIVES = {
  ...BASE_COLORS,
  alpha: {
    white: generateAlphaPalette(BASE_COLORS.white),
    gray: generateAlphaPalette(BASE_COLORS.gray[900]),
    red: generateAlphaPalette(BASE_COLORS.red[500]),
    accent: generateAlphaPalette(BASE_COLORS.accent[500]),
  },
};

export default defineConfig({
  safelist: [...Object.keys(customIconCollection[collectionName] || {}).map((x) => `i-buildstack:${x}`)],
  shortcuts: {
    'buildstack-ease-cubic-bezier': 'ease-[cubic-bezier(0.4,0,0.2,1)]',
    'transition-theme': 'transition-[background-color,border-color,color] duration-150 buildstack-ease-cubic-bezier',
    kdb: 'bg-buildstack-elements-code-background text-buildstack-elements-code-text py-1 px-1.5 rounded-md font-mono text-[0.85em]',
    'max-w-chat': 'max-w-[var(--chat-max-width)]',
  },
  rules: [
    /**
     * This shorthand doesn't exist in Tailwind and we overwrite it to avoid
     * any conflicts with minified CSS classes.
     */
    ['b', {}],
  ],
  theme: {
    colors: {
      ...COLOR_PRIMITIVES,
      buildstack: {
        elements: {
          borderColor: 'var(--buildstack-elements-borderColor)',
          borderColorActive: 'var(--buildstack-elements-borderColorActive)',
          background: {
            depth: {
              1: 'var(--buildstack-elements-bg-depth-1)',
              2: 'var(--buildstack-elements-bg-depth-2)',
              3: 'var(--buildstack-elements-bg-depth-3)',
              4: 'var(--buildstack-elements-bg-depth-4)',
            },
          },
          textPrimary: 'var(--buildstack-elements-textPrimary)',
          textSecondary: 'var(--buildstack-elements-textSecondary)',
          textTertiary: 'var(--buildstack-elements-textTertiary)',
          code: {
            background: 'var(--buildstack-elements-code-background)',
            text: 'var(--buildstack-elements-code-text)',
          },
          button: {
            primary: {
              background: 'var(--buildstack-elements-button-primary-background)',
              backgroundHover: 'var(--buildstack-elements-button-primary-backgroundHover)',
              text: 'var(--buildstack-elements-button-primary-text)',
            },
            secondary: {
              background: 'var(--buildstack-elements-button-secondary-background)',
              backgroundHover: 'var(--buildstack-elements-button-secondary-backgroundHover)',
              text: 'var(--buildstack-elements-button-secondary-text)',
            },
            danger: {
              background: 'var(--buildstack-elements-button-danger-background)',
              backgroundHover: 'var(--buildstack-elements-button-danger-backgroundHover)',
              text: 'var(--buildstack-elements-button-danger-text)',
            },
          },
          item: {
            contentDefault: 'var(--buildstack-elements-item-contentDefault)',
            contentActive: 'var(--buildstack-elements-item-contentActive)',
            contentAccent: 'var(--buildstack-elements-item-contentAccent)',
            contentDanger: 'var(--buildstack-elements-item-contentDanger)',
            backgroundDefault: 'var(--buildstack-elements-item-backgroundDefault)',
            backgroundActive: 'var(--buildstack-elements-item-backgroundActive)',
            backgroundAccent: 'var(--buildstack-elements-item-backgroundAccent)',
            backgroundDanger: 'var(--buildstack-elements-item-backgroundDanger)',
          },
          actions: {
            background: 'var(--buildstack-elements-actions-background)',
            code: {
              background: 'var(--buildstack-elements-actions-code-background)',
            },
          },
          artifacts: {
            background: 'var(--buildstack-elements-artifacts-background)',
            backgroundHover: 'var(--buildstack-elements-artifacts-backgroundHover)',
            borderColor: 'var(--buildstack-elements-artifacts-borderColor)',
            inlineCode: {
              background: 'var(--buildstack-elements-artifacts-inlineCode-background)',
              text: 'var(--buildstack-elements-artifacts-inlineCode-text)',
            },
          },
          messages: {
            background: 'var(--buildstack-elements-messages-background)',
            linkColor: 'var(--buildstack-elements-messages-linkColor)',
            code: {
              background: 'var(--buildstack-elements-messages-code-background)',
            },
            inlineCode: {
              background: 'var(--buildstack-elements-messages-inlineCode-background)',
              text: 'var(--buildstack-elements-messages-inlineCode-text)',
            },
          },
          icon: {
            success: 'var(--buildstack-elements-icon-success)',
            error: 'var(--buildstack-elements-icon-error)',
            primary: 'var(--buildstack-elements-icon-primary)',
            secondary: 'var(--buildstack-elements-icon-secondary)',
            tertiary: 'var(--buildstack-elements-icon-tertiary)',
          },
          preview: {
            addressBar: {
              background: 'var(--buildstack-elements-preview-addressBar-background)',
              backgroundHover: 'var(--buildstack-elements-preview-addressBar-backgroundHover)',
              backgroundActive: 'var(--buildstack-elements-preview-addressBar-backgroundActive)',
              text: 'var(--buildstack-elements-preview-addressBar-text)',
              textActive: 'var(--buildstack-elements-preview-addressBar-textActive)',
            },
          },
          terminals: {
            background: 'var(--buildstack-elements-terminals-background)',
            buttonBackground: 'var(--buildstack-elements-terminals-buttonBackground)',
          },
          dividerColor: 'var(--buildstack-elements-dividerColor)',
          loader: {
            background: 'var(--buildstack-elements-loader-background)',
            progress: 'var(--buildstack-elements-loader-progress)',
          },
          prompt: {
            background: 'var(--buildstack-elements-prompt-background)',
          },
          sidebar: {
            dropdownShadow: 'var(--buildstack-elements-sidebar-dropdownShadow)',
            buttonBackgroundDefault: 'var(--buildstack-elements-sidebar-buttonBackgroundDefault)',
            buttonBackgroundHover: 'var(--buildstack-elements-sidebar-buttonBackgroundHover)',
            buttonText: 'var(--buildstack-elements-sidebar-buttonText)',
          },
          cta: {
            background: 'var(--buildstack-elements-cta-background)',
            text: 'var(--buildstack-elements-cta-text)',
          },
        },
      },
    },
  },
  transformers: [transformerDirectives()],
  presets: [
    presetUno({
      dark: {
        light: '[data-theme="light"]',
        dark: '[data-theme="dark"]',
      },
    }),
    presetIcons({
      warn: true,
      collections: {
        ...customIconCollection,
      },
      unit: 'em',
    }),
  ],
});

/**
 * Generates an alpha palette for a given hex color.
 *
 * @param hex - The hex color code (without alpha) to generate the palette from.
 * @returns An object where keys are opacity percentages and values are hex colors with alpha.
 *
 * Example:
 *
 * ```
 * {
 *   '1': '#FFFFFF03',
 *   '2': '#FFFFFF05',
 *   '3': '#FFFFFF08',
 * }
 * ```
 */
function generateAlphaPalette(hex: string) {
  return [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100].reduce(
    (acc, opacity) => {
      const alpha = Math.round((opacity / 100) * 255)
        .toString(16)
        .padStart(2, '0');

      acc[opacity] = `${hex}${alpha}`;

      return acc;
    },
    {} as Record<number, string>,
  );
}
