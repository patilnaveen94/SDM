import { useAnimatedScrollHandler, useSharedValue, useAnimatedStyle, interpolate, Extrapolation } from 'react-native-reanimated';

/**
 * Reanimated-powered scroll-zoom hook for cinematic parallax header effects.
 * Replicates the Hombale Films deep-field camera scroll movement natively at 60fps.
 */
export const useScrollZoom = (headerHeight: number = 350) => {
  const scrollY = useSharedValue(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const headerAnimatedStyle = useAnimatedStyle(() => {
    const scale = interpolate(
      scrollY.value,
      [-headerHeight, 0, headerHeight],
      [2, 1, 0.8],
      Extrapolation.CLAMP
    );

    const translateY = interpolate(
      scrollY.value,
      [-headerHeight, 0, headerHeight],
      [-headerHeight / 2, 0, headerHeight * 0.4],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, headerHeight * 0.6, headerHeight],
      [1, 0.6, 0.2],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ scale }, { translateY }],
      opacity,
    };
  });

  const overlayAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      scrollY.value,
      [0, headerHeight * 0.5, headerHeight],
      [0.3, 0.6, 0.9],
      Extrapolation.CLAMP
    );

    return { opacity };
  });

  const titleAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      scrollY.value,
      [0, headerHeight],
      [0, -60],
      Extrapolation.CLAMP
    );

    const opacity = interpolate(
      scrollY.value,
      [0, headerHeight * 0.3],
      [1, 0],
      Extrapolation.CLAMP
    );

    return {
      transform: [{ translateY }],
      opacity,
    };
  });

  return {
    scrollHandler,
    headerAnimatedStyle,
    overlayAnimatedStyle,
    titleAnimatedStyle,
    scrollY,
  };
};
