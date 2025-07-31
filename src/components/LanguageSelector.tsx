"use client"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export type Language = {
  code: string;
  name: string;
  localName: string;
  flag: string;
  ttsCode: string;
};

export const languages: Language[] = [
  { code: 'en-US', name: 'English', localName: 'English', flag: '🇺🇸', ttsCode: 'en-US' },
  { code: 'hi-IN', name: 'Hindi', localName: 'हिंदी', flag: '🇮🇳', ttsCode: 'hi-IN' },
  { code: 'ta-IN', name: 'Tamil', localName: 'தமிழ்', flag: '🇮🇳', ttsCode: 'ta' },
  { code: 'te-IN', name: 'Telugu', localName: 'తెలుగు', flag: '🇮🇳', ttsCode: 'te' },
];

interface LanguageSelectorProps {
  selectedLanguage: string;
  onSelectLanguage: (code: string) => void;
}

export function LanguageSelector({ selectedLanguage, onSelectLanguage }: LanguageSelectorProps) {
  return (
    <Select value={selectedLanguage} onValueChange={onSelectLanguage}>
      <SelectTrigger className="w-auto md:w-[180px]">
        <SelectValue placeholder="Select language" />
      </SelectTrigger>
      <SelectContent>
        {languages.map((lang) => (
          <SelectItem key={lang.code} value={lang.code}>
            <div className="flex items-center gap-2">
              <span className="text-lg">{lang.flag}</span>
              <span className="hidden md:inline">{lang.name} ({lang.localName})</span>
              <span className="md:hidden">{lang.localName}</span>
            </div>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
