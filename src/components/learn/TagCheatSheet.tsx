import React from 'react';
import { CheatSheet } from './CheatSheet';

interface TagCheatSheetProps {
  onOpenInEditor?: (code: string) => void;
}

export const TagCheatSheet: React.FC<TagCheatSheetProps> = ({ onOpenInEditor }) => {
  return <CheatSheet course="html" onOpenInEditor={onOpenInEditor} />;
};

export default TagCheatSheet;
