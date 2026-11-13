import React, { useMemo } from 'react';
import { EffectColorMode, PatternType } from '../../types/theme';
import { buildStaticPatternStyle } from '../../lib/background/patterns';

interface PatternThumbnailProps {
  patternType: PatternType;
  accentColor: string;
  accentColor2?: string;
  colorMode?: EffectColorMode;
  customColor?: string;
}

export const PatternThumbnail: React.FC<PatternThumbnailProps> = ({
  patternType,
  accentColor,
  accentColor2,
  colorMode = 'palette',
  customColor,
}) => {
  const style = useMemo(() => {
    return buildStaticPatternStyle({
      patternType,
      opacity: 0.55,
      scale: 0.65,
      angle: 0,
      density: 1,
      colorMode,
      customColor,
      accentColor,
      accentColor2,
      vignette: false,
    });
  }, [patternType, accentColor, accentColor2, colorMode, customColor]);

  return (
    <div
      aria-hidden="true"
      className="w-full h-14 rounded-[calc(var(--radius-sm)-2px)] bg-app border border-subtle overflow-hidden relative"
    >
      {style && (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: style.backgroundImage,
            backgroundSize: style.backgroundSize,
            backgroundRepeat: 'repeat',
            opacity: style.opacity,
          }}
        />
      )}
    </div>
  );
};
