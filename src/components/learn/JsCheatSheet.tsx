import React from 'react';
import { CheatSheet } from './CheatSheet';

interface JsCheatSheetProps {
  onOpenInEditor?: (code: string) => void;
}

export const JsCheatSheet: React.FC<JsCheatSheetProps> = ({ onOpenInEditor }) => {
  return <CheatSheet course="js" onOpenInEditor={onOpenInEditor} />;
};

export default JsCheatSheet;
