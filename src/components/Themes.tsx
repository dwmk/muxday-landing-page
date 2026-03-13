// src/components/Themes.tsx
import { CheckCircle } from 'lucide-react';
import { Profile } from '../lib/supabase';

interface ThemePreset {
  value: string;
  name: string;
  desc: string;
}

const presets: ThemePreset[] = [
  { value: 'default-theme', name: 'Excite', desc: ''},
  { value: 'liaoverse', name: 'Liaoverse', desc: '' },
  { value: 'cooper-black', name: 'Cooper Black', desc: '' },
  { value: 'knightspeak', name: 'Knightspeak', desc: '' },
  { value: 'wildest-dimensions', name: 'Wildest Dimensions', desc: ''},
  { value: 'one-one-one', name: 'One One One', desc: ''},
  { value: 'cyberlush', name: 'Cyber Lush', desc: ''},
  { value: 'frostbyte', name: 'Frost Byte', desc: ''},
  { value: 'soulamber', name: 'Soul Amber', desc: ''},
  { value: 'suwuicide', name: 'Suwuicide', desc: 'collaboration theme'}

];

interface ThemesProps {
  currentTheme: string;
  onChange: (theme: string) => void;
  loading?: boolean;
}

export const Themes = ({ currentTheme, onChange, loading }: ThemesProps) => {
  return (
    <div className="space-y-2">
      {presets.map((preset) => (
        <div
          key={preset.value}
          className={`p-3 rounded-lg cursor-pointer transition-all border ${
            currentTheme === preset.value
              ? 'bg-[rgba(var(--color-primary),0.1)] border-[rgb(var(--color-primary))]' 
              : 'bg-[rgb(var(--color-surface-hover))] border-[rgb(var(--color-border))] hover:bg-[rgb(var(--color-border))]'
          }`}
          onClick={() => !loading && onChange(preset.value)}
        >
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-[rgb(var(--color-text))]">{preset.name}</h4>
              <p className="text-sm text-[rgb(var(--color-text-secondary))]">{preset.desc}</p>
            </div>
            {currentTheme === preset.value && <CheckCircle size={16} className="text-[rgb(var(--color-primary))]" />}
          </div>
        </div>
      ))}
    </div>
  );
};
