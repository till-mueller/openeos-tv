import React, { useCallback } from 'react';
import { Pressable, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation';
import { useTheme } from '@/hooks/useTheme';
import { TV_SIZES } from '@/constants';

interface FocusableCardProps {
  children: React.ReactNode;
  onPress?: () => void;
  focusKey?: string;
  // StyleProp<ViewStyle>, not a bare ViewStyle: every call site passes an
  // array of style objects (e.g. [styles.card, { borderLeftColor: ... }]),
  // which is the normal RN pattern — a bare ViewStyle type only happened to
  // accept that by accident until ViewStyle gained a same-named `filter`
  // property (CSS filter effects) that collided with Array.prototype.filter.
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
  selected?: boolean;
}

export const FocusableCard: React.FC<FocusableCardProps> = ({
  children,
  onPress,
  focusKey,
  style,
  disabled = false,
  selected = false,
}) => {
  const { colors } = useTheme();

  const handlePress = useCallback(() => {
    if (!disabled && onPress) {
      onPress();
    }
  }, [disabled, onPress]);

  const { ref, focused } = useFocusable({
    focusKey,
    onEnterPress: handlePress,
  });

  const getBackgroundColor = (): string => {
    if (selected) {
      return colors.primaryLight + '30'; // 30% opacity
    }
    if (focused) {
      return colors.surfaceVariant;
    }
    return colors.surface;
  };

  const getBorderColor = (): string => {
    if (focused) {
      return colors.focusBorder;
    }
    if (selected) {
      return colors.primary;
    }
    return colors.border;
  };

  return (
    <Pressable
      ref={ref}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.card,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: focused ? TV_SIZES.focusBorderWidth : 2,
          transform: focused ? [{ scale: 1.02 }] : [{ scale: 1 }],
          opacity: disabled ? 0.5 : 1,
        },
        style,
      ]}>
      {children}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: TV_SIZES.radiusLg,
    padding: TV_SIZES.spacingMd,
    minWidth: TV_SIZES.cardMinWidth,
    minHeight: TV_SIZES.cardMinHeight,
  },
});
