// src/components/Themes.tsx
import { CheckCircle } from 'lucide-react';
import { Profile } from '../lib/supabase';

interface ThemePreset {
  value: string;
  name: string;
  desc: string;
  colors: {
    primary: string;
    accent: string;
    background: string;
    text: string;
    textOnPrimary: string;
    surface: string;
    border: string;
    textSecondary: string;
    surfaceHover: string;
  };
}

const presets: ThemePreset[] = [
  {
    value: 'default-theme',
    name: 'Excite',
    desc: 'default theme',
    colors: {
      primary: '191, 123, 255',
      accent: '120, 80, 220',
      background: '15, 10, 25',
      text: '240, 230, 255',
      textOnPrimary: '255, 255, 255',
      surface: '28, 20, 45',
      border: '60, 45, 90',
      textSecondary: '160, 145, 190',
      surfaceHover: '40, 30, 65',
    },
  },
  {
    value: 'liaoverse',
    name: 'Liaoverse',
    desc: '',
    colors: {
      primary: '255, 69, 0',
      accent: '255, 140, 0',
      background: '255, 255, 255',
      text: '17, 24, 39',
      textOnPrimary: '255, 255, 255',
      surface: '255, 255, 255',
      border: '229, 231, 235',
      textSecondary: '107, 114, 128',
      surfaceHover: '249, 250, 251',
    },
  },
  {
    value: 'cooper-black',
    name: 'Cooper Black',
    desc: '',
    colors: {
      primary: '232, 183, 7',
      accent: '255, 234, 0',
      background: '20, 20, 20',
      text: '250, 250, 239',
      textOnPrimary: '0, 0, 0',
      surface: '35, 35, 35',
      border: '60, 60, 60',
      textSecondary: '150, 150, 150',
      surfaceHover: '45, 45, 45',
    },
  },
  {
    value: 'knightspeak',
    name: 'Knightspeak',
    desc: '',
    colors: {
      primary: '150, 40, 50',
      accent: '255, 190, 0',
      background: '245, 235, 220',
      text: '40, 40, 40',
      textOnPrimary: '255, 255, 255',
      surface: '255, 250, 240',
      border: '180, 170, 150',
      textSecondary: '90, 75, 55',
      surfaceHover: '235, 225, 210',
    },
  },
  {
    value: 'wildest-dimensions',
    name: 'Wildest Dimensions',
    desc: '',
    colors: {
      primary: '255, 10, 69',
      accent: '255, 0, 150',
      background: '10, 0, 20',
      text: '240, 240, 255',
      textOnPrimary: '255, 255, 255',
      surface: '25, 10, 40',
      border: '50, 30, 70',
      textSecondary: '170, 150, 190',
      surfaceHover: '35, 20, 50',
    },
  },
  {
    value: 'one-one-one',
    name: 'One One One',
    desc: '',
    colors: {
      primary: '255, 0, 0',
      accent: '255, 50, 50',
      background: '0, 0, 0',
      text: '255, 255, 255',
      textOnPrimary: '0, 0, 0',
      surface: '10, 0, 0',
      border: '50, 0, 0',
      textSecondary: '150, 150, 150',
      surfaceHover: '20, 0, 0',
    },
  },
  {
    value: 'cyberlush',
    name: 'Show Em Greens',
    desc: '',
    colors: {
      primary: '50, 255, 50',
      accent: '0, 150, 50',
      background: '5, 15, 5',
      text: '200, 255, 200',
      textOnPrimary: '0, 0, 0',
      surface: '12, 25, 12',
      border: '30, 60, 30',
      textSecondary: '100, 160, 100',
      surfaceHover: '20, 40, 20',
    },
  },
  {
    value: 'frostbyte',
    name: 'Frozen Garden',
    desc: '',
    colors: {
      primary: '0, 210, 255',
      accent: '160, 233, 255',
      background: '240, 248, 255',
      text: '30, 50, 80',
      textOnPrimary: '255, 255, 255',
      surface: '255, 255, 255',
      border: '190, 220, 240',
      textSecondary: '100, 130, 160',
      surfaceHover: '230, 240, 250',
    },
  },
  {
    value: 'soulamber',
    name: 'Old is Gold',
    desc: '',
    colors: {
      primary: '255, 174, 0',
      accent: '255, 120, 0',
      background: '28, 22, 15',
      text: '255, 240, 210',
      textOnPrimary: '40, 20, 0',
      surface: '42, 34, 25',
      border: '75, 60, 45',
      textSecondary: '180, 160, 140',
      surfaceHover: '55, 45, 35',
    },
  },
  {
    value: 'suwuicide',
    name: 'Suwuicide',
    desc: 'collaboration theme',
    colors: {
      primary: '159, 240, 255',
      accent: '250, 98, 240',
      background: '255, 252, 248',
      text: '55, 45, 42',
      textOnPrimary: '255, 255, 255',
      surface: '255, 245, 248',
      border: '240, 220, 225',
      textSecondary: '150, 130, 125',
      surfaceHover: '252, 235, 240',
    },
  },
  {
    value: 'muxday',
    name: 'MuxDay',
    desc: '',
    colors: {
      primary: '139, 232, 203',
      accent: '126, 162, 170',
      background: '24, 28, 26',
      text: '245, 248, 248',
      textOnPrimary: '10, 20, 15',
      surface: '38, 44, 41',
      border: '65, 75, 70',
      textSecondary: '150, 165, 160',
      surfaceHover: '50, 58, 54',
    },
  },
  {
    value: 'ocelot',
    name: 'Ocelot',
    desc: 'collaboration theme',
    colors: {
      primary: '176, 142, 171',
      accent: '136, 141, 167',
      background: '20, 22, 30',
      text: '240, 235, 245',
      textOnPrimary: '20, 15, 20',
      surface: '35, 38, 55',
      border: '75, 80, 105',
      textSecondary: '165, 170, 190',
      surfaceHover: '50, 55, 75',
    },
  },
];

interface ThemesProps {
  currentTheme: string;
  onChange: (theme: string) => void;
  loading?: boolean;
}

export const Themes = ({ currentTheme, onChange, loading }: ThemesProps) => {
  return (
    <div className="grid grid-cols-2 gap-4">
      {presets.map((preset) => {
        const isSelected = currentTheme === preset.value;
        const previewStyle: React.CSSProperties = {
          '--color-primary': preset.colors.primary,
          '--color-accent': preset.colors.accent,
          '--color-background': preset.colors.background,
          '--color-text': preset.colors.text,
          '--color-text-on-primary': preset.colors.textOnPrimary,
          '--color-surface': preset.colors.surface,
          '--color-border': preset.colors.border,
          '--color-text-secondary': preset.colors.textSecondary,
          '--color-surface-hover': preset.colors.surfaceHover,
        };

        return (
          <div
            key={preset.value}
            className={`rounded-xl overflow-hidden border transition-all cursor-pointer ${
              isSelected
                ? 'bg-[rgba(var(--color-primary),0.1)] border-[rgb(var(--color-primary))] ring-1 ring-[rgb(var(--color-primary))/30]'
                : 'bg-[rgb(var(--color-surface))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-surface-hover))]'
            }`}
            onClick={() => !loading && onChange(preset.value)}
          >
            {/* THEME PREVIEW SAMPLE */}
            <div className="bg-[rgb(var(--color-background))]" style={previewStyle}>
              <div className="p-4">
                <div className="bg-[rgb(var(--color-surface))] border border-[rgb(var(--color-border))] rounded-lg p-4">
                  {/* Mini header */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="px-3 py-1 bg-[rgb(var(--color-primary))] text-[rgb(var(--color-text-on-primary))] text-xs font-medium rounded">
                      Primary
                    </div>
                    <div className="text-[rgb(var(--color-text-secondary))] text-xs">Preview</div>
                  </div>

                  {/* Sample text lines */}
                  <div className="space-y-2 mb-4">
                    <div className="h-2 bg-[rgb(var(--color-text))] rounded w-3/4"></div>
                    <div className="h-2 bg-[rgb(var(--color-text-secondary))] rounded w-1/2"></div>
                  </div>

                  {/* Accent button */}
                  <button className="w-full py-2 bg-[rgb(var(--color-accent))] text-[rgb(var(--color-text-on-primary))] text-xs rounded-lg font-medium">
                    Accent Action
                  </button>
                </div>
              </div>
            </div>

            {/* LABEL */}
            <div className="p-3 flex items-center justify-between bg-[rgb(var(--color-surface))]">
              <div>
                <h4 className="font-semibold text-[rgb(var(--color-text))]">{preset.name}</h4>
                {preset.desc && (
                  <p className="text-sm text-[rgb(var(--color-text-secondary))]">{preset.desc}</p>
                )}
              </div>
              {isSelected && <CheckCircle size={16} className="text-[rgb(var(--color-primary))]" />}
            </div>
          </div>
        );
      })}
    </div>
  );
};