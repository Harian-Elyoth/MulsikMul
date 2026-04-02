import { useCallback, useRef, useState } from 'react';
import { ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LanguageToggle } from '../src/ui/LanguageToggle';
import PageDots from '../src/ui/PageDots';
import PlantsScreen from '../src/screens/PlantsScreen';
import ScheduleScreen from '../src/screens/ScheduleScreen';
import AddPlantScreen from '../src/screens/AddPlantScreen';
import { colors } from '../src/ui/theme';

export default function SwipeNavigator() {
  const { width } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh plant data whenever this screen gains focus (e.g. back from plant detail)
  useFocusEffect(
    useCallback(() => {
      setRefreshKey((k) => k + 1);
    }, [])
  );

  function scrollToPage(index: number) {
    scrollRef.current?.scrollTo({ x: index * width, animated: true });
    setCurrentPage(index);
  }

  function handleSaved() {
    scrollToPage(0);
    setRefreshKey((k) => k + 1);
  }

  return (
    <View style={styles.container}>
      {/* Floating language toggle */}
      <View style={[styles.langToggle, { top: insets.top + 8 }]}>
        <LanguageToggle />
      </View>

      {/* Swipe pages */}
      <ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(e) => {
          const page = Math.round(e.nativeEvent.contentOffset.x / width);
          setCurrentPage(page);
        }}
        style={styles.scroll}
        contentContainerStyle={{ width: width * 3 }}
      >
        <View style={{ width, flex: 1 }}>
          <PlantsScreen
            onNavigateToAdd={() => scrollToPage(2)}
            refreshKey={refreshKey}
            topInset={insets.top}
          />
        </View>
        <View style={{ width, flex: 1 }}>
          <ScheduleScreen
            onNavigateToAdd={() => scrollToPage(2)}
            refreshKey={refreshKey}
            topInset={insets.top}
          />
        </View>
        <View style={{ width, flex: 1 }}>
          <AddPlantScreen onSaved={handleSaved} onCancel={() => scrollToPage(0)} isActive={currentPage === 2} topInset={insets.top} />
        </View>
      </ScrollView>

      {/* Pagination dots */}
      <View style={[styles.dotsContainer, { paddingBottom: insets.bottom + 8 }]}>
        <PageDots total={3} current={currentPage} onPress={scrollToPage} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  langToggle: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
  },
  scroll: {
    flex: 1,
  },
  dotsContainer: {
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.06)',
  },
});
