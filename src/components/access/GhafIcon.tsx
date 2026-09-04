import { StyleSheet } from 'react-native';
import Svg, { Circle, G, Line, Path, Rect } from 'react-native-svg';

import { colors } from '@/design/tokens';
import type { TextDirection } from '@/models/familyGrowth';

export type GhafIconName =
  | 'arrow-back'
  | 'calendar'
  | 'check'
  | 'check-filled'
  | 'chevron'
  | 'child'
  | 'contrast'
  | 'dialpad'
  | 'energy-leaf'
  | 'family'
  | 'fingerprint'
  | 'flower'
  | 'ghaf-tree'
  | 'info'
  | 'language'
  | 'large-text'
  | 'leaf'
  | 'league'
  | 'lock'
  | 'media-off'
  | 'motion'
  | 'person'
  | 'person-add'
  | 'science'
  | 'shield'
  | 'simple'
  | 'sparkle'
  | 'water-drop';

export interface GhafIconProps {
  accessibilityLabel?: string;
  color?: string;
  direction?: TextDirection;
  name: GhafIconName;
  size?: number;
  strokeWidth?: number;
  testID?: string;
}

const dialpadDots = [
  [7, 6],
  [12, 6],
  [17, 6],
  [7, 11],
  [12, 11],
  [17, 11],
  [7, 16],
  [12, 16],
  [17, 16],
  [12, 21],
] as const;

export function GhafIcon({
  accessibilityLabel,
  color = colors.ghafEmerald,
  direction = 'ltr',
  name,
  size = 24,
  strokeWidth = 1.8,
  testID,
}: GhafIconProps) {
  const isRtl = direction === 'rtl';
  const common = {
    fill: 'none',
    stroke: color,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    strokeWidth,
  };

  const glyph = (() => {
    switch (name) {
      case 'arrow-back':
        return (
          <G {...common}>
            <Line x1={isRtl ? 5 : 19} x2={isRtl ? 19 : 5} y1="12" y2="12" />
            <Path d={isRtl ? 'M14 7l5 5-5 5' : 'M10 7l-5 5 5 5'} />
          </G>
        );
      case 'chevron':
        return <Path {...common} d={isRtl ? 'M9 6l6 6-6 6' : 'M15 6l-6 6 6 6'} />;
      case 'language':
        return (
          <G {...common}>
            <Circle cx="12" cy="12" r="8.5" />
            <Path d="M3.8 12h16.4M12 3.5c2.2 2.3 3.2 5.1 3.2 8.5S14.2 18.2 12 20.5M12 3.5C9.8 5.8 8.8 8.6 8.8 12s1 6.2 3.2 8.5" />
          </G>
        );
      case 'family':
        return (
          <G {...common}>
            <Circle cx="8" cy="8" r="2.5" />
            <Circle cx="16.5" cy="9" r="2" />
            <Path d="M3.5 19v-1.5A4.5 4.5 0 018 13a4.5 4.5 0 014.5 4.5V19M13.5 14.5a3.5 3.5 0 015.5 2.9V19" />
          </G>
        );
      case 'child':
        return (
          <G {...common}>
            <Circle cx="12" cy="7.5" r="3" />
            <Path d="M6 20v-2a6 6 0 0112 0v2M9.5 5c.5-1.1 1.4-1.8 2.5-1.8S14 4 14.5 5" />
          </G>
        );
      case 'fingerprint':
        return (
          <G {...common}>
            <Path d="M6.4 10.5a5.7 5.7 0 0111.2 1.3c0 3.7-.8 6.1-2.4 8M9 11.8a3 3 0 016 0c0 4-.8 6.2-2 8.2M4.2 13.5c0-5.2 3.2-8.6 7.8-8.6 4 0 7 2.5 7.7 6.4M7 15.2c-.2 2-.7 3.4-1.5 4.6M11.8 12.3c.1 3.3-.5 5.9-1.5 7.7" />
          </G>
        );
      case 'lock':
        return (
          <G {...common}>
            <Rect height="9" rx="2" width="12" x="6" y="11" />
            <Path d="M8.7 11V8.4a3.3 3.3 0 016.6 0V11" />
            <Circle cx="12" cy="15.5" fill={color} r="1" stroke="none" />
          </G>
        );
      case 'dialpad':
        return (
          <G fill={color}>
            {dialpadDots.map(([x, y]) => (
              <Circle cx={x} cy={y} key={`${x}-${y}`} r="1.5" />
            ))}
          </G>
        );
      case 'check':
        return (
          <G {...common}>
            <Circle cx="12" cy="12" r="8.5" />
            <Path d="M8 12.2l2.6 2.6L16.5 9" />
          </G>
        );
      case 'check-filled':
        return (
          <G>
            <Circle cx="12" cy="12" fill={color} r="9" />
            <Path
              d="M7.8 12.2l2.7 2.7 5.9-6"
              fill="none"
              stroke={colors.onPrimary}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
            />
          </G>
        );
      case 'ghaf-tree':
        return (
          <G fill={color}>
            <Path d="M12 2.8L6.8 9h3L5 15h5v4h4v-4h5l-4.8-6h3L12 2.8z" />
            <Rect height="2" rx="1" width="7" x="8.5" y="19" />
          </G>
        );
      case 'leaf':
        return (
          <G {...common}>
            <Path d="M5 18C4.6 10.8 8.7 5.3 18.8 4.5c.4 9.7-4.5 14.6-13.8 13.5z" />
            <Path d="M6 17c3.8-4.3 7.4-7 11.2-9" />
          </G>
        );
      case 'flower':
        return (
          <G {...common}>
            <Path d="M12 11c-4.6.2-7.1-2.1-6.7-6.2 4-.3 6.3 2 6.7 6.2zM12 11c.2-4.6 2.5-7 6.6-6.6.3 4-2 6.3-6.6 6.6zM12 11c4.6.2 7 2.5 6.6 6.6-4 .3-6.3-2-6.6-6.6zM12 11c.2 4.6-2.1 7.1-6.2 6.7-.3-4 2-6.3 6.2-6.7z" />
            <Circle cx="12" cy="11" fill={color} r="1.5" stroke="none" />
          </G>
        );
      case 'energy-leaf':
        return (
          <G {...common}>
            <Path d="M5 18C4.6 10.8 8.7 5.3 18.8 4.5c.4 9.7-4.5 14.6-13.8 13.5z" />
            <Path d="M13.2 7.5l-3.4 5h2.8l-2 4" />
          </G>
        );
      case 'water-drop':
        return (
          <Path {...common} d="M12 3.5c3.8 4.7 6 7.8 6 10.4a6 6 0 11-12 0c0-2.6 2.2-5.7 6-10.4z" />
        );
      case 'person':
        return (
          <G {...common}>
            <Circle cx="12" cy="8" r="3" />
            <Path d="M6 20v-2a6 6 0 0112 0v2" />
          </G>
        );
      case 'person-add':
        return (
          <G {...common}>
            <Circle cx="9" cy="8" r="3" />
            <Path d="M3.5 20v-2a5.5 5.5 0 0111 0v2M18 8v6M15 11h6" />
          </G>
        );
      case 'info':
        return (
          <G {...common}>
            <Circle cx="12" cy="12" r="8.5" />
            <Line x1="12" x2="12" y1="11" y2="16" />
            <Circle cx="12" cy="8" fill={color} r="1" stroke="none" />
          </G>
        );
      case 'shield':
        return (
          <G {...common}>
            <Path d="M12 3.5l7 2.7v5.2c0 4.3-2.8 7.6-7 9.1-4.2-1.5-7-4.8-7-9.1V6.2L12 3.5z" />
            <Circle cx="12" cy="10" r="2" />
            <Path d="M8.8 16a3.2 3.2 0 016.4 0" />
          </G>
        );
      case 'media-off':
        return (
          <G {...common}>
            <Rect height="12" rx="2" width="16" x="4" y="6" />
            <Path d="M7 14l3-3 2.2 2.2 1.4-1.4L17 15M4 4l16 16" />
          </G>
        );
      case 'league':
        return (
          <G {...common}>
            <Circle cx="8" cy="9" r="2" />
            <Circle cx="16" cy="9" r="2" />
            <Circle cx="12" cy="6" r="2" />
            <Path d="M4.5 18a3.5 3.5 0 017 0M12.5 18a3.5 3.5 0 017 0M8.5 15a3.5 3.5 0 017 0" />
          </G>
        );
      case 'large-text':
        return (
          <G fill={color}>
            <Path d="M3 18L8.5 5h2L16 18h-2.4l-1.3-3.3H6.1L4.8 18H3zm3.9-5.4h4.6L9.2 6.8l-2.3 5.8z" />
            <Path d="M15 18l3.4-8h1.4l3.3 8h-1.8l-.7-1.9h-3.1l-.7 1.9H15zm3.1-3.5H20l-.9-2.5-1 2.5z" />
          </G>
        );
      case 'simple':
        return (
          <G {...common}>
            <Path d="M5 6h14M5 12h9M5 18h6" />
            <Circle cx="18" cy="15.5" r="2.5" />
            <Path d="M18 14v3M16.5 15.5h3" />
          </G>
        );
      case 'contrast':
        return (
          <G {...common}>
            <Circle cx="12" cy="12" r="8.5" />
            <Path d="M12 3.5v17A8.5 8.5 0 0012 3.5z" fill={color} />
          </G>
        );
      case 'motion':
        return (
          <G {...common}>
            <Path d="M5 7h9M2.5 12H14M5 17h9" />
            <Path d="M14 5l7 7-7 7" />
          </G>
        );
      case 'science':
        return (
          <G {...common}>
            <Path d="M9 3h6M10 3v6l-5 8.2A2.4 2.4 0 007 21h10a2.4 2.4 0 002-3.8L14 9V3M7.5 16h9" />
          </G>
        );
      case 'sparkle':
        return (
          <G {...common}>
            <Path d="M12 3c.7 4.6 2.4 6.3 7 7-4.6.7-6.3 2.4-7 7-.7-4.6-2.4-6.3-7-7 4.6-.7 6.3-2.4 7-7z" />
            <Path d="M19 15c.3 2.1 1.1 2.9 3 3-1.9.3-2.7 1.1-3 3-.3-1.9-1.1-2.7-3-3 1.9-.1 2.7-.9 3-3z" />
          </G>
        );
      case 'calendar':
        return (
          <G {...common}>
            <Rect height="15" rx="2" width="16" x="4" y="5" />
            <Path d="M8 3v4M16 3v4M4 9h16" />
          </G>
        );
      default:
        return null;
    }
  })();

  return (
    <Svg
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={accessibilityLabel ? 'image' : undefined}
      accessible={accessibilityLabel ? true : undefined}
      aria-hidden={accessibilityLabel ? undefined : true}
      height={Math.max(1, size)}
      style={styles.icon}
      testID={testID}
      viewBox="0 0 24 24"
      width={Math.max(1, size)}
    >
      {glyph}
    </Svg>
  );
}

const styles = StyleSheet.create({
  icon: {
    flexShrink: 0,
    pointerEvents: 'none',
  },
});
