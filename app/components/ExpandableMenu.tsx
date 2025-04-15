import React, { useRef, useEffect } from "react"
import { View, TouchableOpacity, Text, TouchableWithoutFeedback, Animated, Platform, StyleSheet } from "react-native"
import { BlurView } from "expo-blur"
import { Ionicons } from "@expo/vector-icons"
import { ScrollView } from "react-native-gesture-handler"
import { useRouter, usePathname } from "expo-router"

type RouteType = "/home" | "/search" | "/league" | "/team"

const menuItems = [
  { icon: "home-outline", label: "Accueil", route: "/home" },
  { icon: "trophy-outline", label: "Ligues", route: "/league" },
  { icon: "star-outline", label: "Équipes", route: "/team" },
  { icon: "search-outline", label: "Recherche", route: "/search" },
] as const

interface ExpandableMenuProps {
  isOpen: boolean
  onToggle: () => void
}

export default function ExpandableMenu({ isOpen, onToggle }: ExpandableMenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const animatedValue = useRef(new Animated.Value(0)).current
  const expandAnimation = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.parallel([
      Animated.spring(animatedValue, {
        toValue: isOpen ? 1 : 0,
        tension: 70,
        friction: 12,
        useNativeDriver: false,
      }),
      Animated.timing(expandAnimation, {
        toValue: isOpen ? 1 : 0,
        duration: 300,
        useNativeDriver: false,
      })
    ]).start()
  }, [isOpen, animatedValue])

  const height = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [36, Platform.OS === "web" ? 250 : 210],
  })

  const closedWidth = 140;
  const width = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [closedWidth, 200],
  })

  const borderRadius = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 18],
  })

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  })

  const handleNavigation = (route: RouteType) => {
    router.push(route)
    onToggle()
  }

  // Re-introduce logic to get current item based on pathname
  const currentItem = menuItems.find(item => item.route === pathname) || menuItems[0];

  return (
    <>
      {isOpen && (
        <TouchableWithoutFeedback onPress={onToggle}>
          <View className="absolute -top-[1000px] -left-[1000px] -right-[1000px] -bottom-[1000px] z-[99]" />
        </TouchableWithoutFeedback>
      )}
      <View className="absolute top-[6px] right-0 z-[100]">
        <Animated.View
          className="overflow-hidden"
          style={{
            height,
            width,
            borderRadius,
            shadowColor: "#FFC107",
            shadowOffset: {
              width: 0,
              height: 2,
            },
            shadowOpacity: 0.4,
            shadowRadius: 4,
            elevation: 8,
          }}
        >
          <BlurView
            intensity={isOpen ? 70 : 40}
            tint="dark"
            style={styles.blurContainer}
          >
            <TouchableWithoutFeedback
              onPress={isOpen ? undefined : onToggle} // Only toggle when closed
            >
              <View style={{ flex: 1 }}>
                {/* Closed State Content (Now Dynamic) */}
                <Animated.View style={[
                  styles.closedContentContainer,
                  {
                    opacity: animatedValue.interpolate({
                      inputRange: [0, 0.1],
                      outputRange: [1, 0]
                    }),
                    pointerEvents: isOpen ? 'none' : 'auto',
                  }
                ]}>
                  <Ionicons name={currentItem.icon as any} size={18} color="white" />
                  <Text style={styles.closedText} numberOfLines={1} ellipsizeMode="tail">{currentItem.label}</Text>
                </Animated.View>

                {/* Open State Content */}
                <Animated.View style={{
                  opacity,
                  flex: 1,
                  pointerEvents: isOpen ? 'auto' : 'none',
                }}>
                  <ScrollView
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    style={styles.scrollViewOpen}
                    contentContainerStyle={{ paddingBottom: 10 }}
                  >
                    {menuItems.map((item, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.menuItem,
                          pathname === item.route ? styles.activeMenuItem : null
                        ]}
                        activeOpacity={0.7}
                        onPress={() => handleNavigation(item.route as RouteType)}
                      >
                        <View style={styles.iconContainer}>
                          <Ionicons name={item.icon as any} size={14} color="white" />
                        </View>
                        <Text style={styles.menuItemText}>{item.label}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </Animated.View>
              </View>
            </TouchableWithoutFeedback>
          </BlurView>
        </Animated.View>
      </View>
    </>
  )
}

const styles = StyleSheet.create({
  blurContainer: {
    flex: 1,
    overflow: 'hidden',
  },
  closedContentContainer: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    zIndex: 5,
  },
  closedText: {
    flex: 1, // Allow text to take space and ellipse if needed
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginHorizontal: 8, // Adjusted margin
    textAlign: 'center', // Center text between icons
  },
  scrollViewOpen: {
    flex: 1,
    paddingHorizontal: 8,
    paddingTop: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginVertical: 3,
    borderRadius: 14,
  },
  activeMenuItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  iconContainer: {
    width: 28,
    height: 28,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 10,
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
  },
});