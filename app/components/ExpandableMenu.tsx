import React, { useRef, useEffect, useState } from "react"
import { View, TouchableOpacity, Text, TouchableWithoutFeedback, Animated, Platform, StyleSheet, LayoutChangeEvent } from "react-native"
import { BlurView } from "expo-blur"
import { Ionicons } from "@expo/vector-icons"
import { ScrollView } from "react-native-gesture-handler"
import { useRouter, usePathname } from "expo-router"

type RouteType = "/home" | "/search" | "/league" | "/team"

const menuItems = [
  { icon: "home-outline", label: "Accueil", route: "/home" },
  { icon: "search-outline", label: "Rechercher", route: "/search" },
  { icon: "trophy-outline", label: "Mes Ligues", route: "/league" },
  { icon: "star-outline", label: "Mes Équipes", route: "/team" },
] as const

interface ExpandableMenuProps {
  isOpen: boolean
  onToggle: () => void
}

const ExpandedHeader = () => {
  return (
    <View className="flex-row items-center justify-end px-3 py-1.5">
      <TouchableOpacity className="rounded-full bg-white/10 items-center justify-center px-3 py-1" style={styles.button}>
        <Text style={styles.buttonText}>Home</Text>
      </TouchableOpacity>
    </View>
  )
}

export default function ExpandableMenu({ isOpen, onToggle }: ExpandableMenuProps) {
  const router = useRouter()
  const pathname = usePathname()
  const animatedValue = useRef(new Animated.Value(0)).current
  const expandAnimation = useRef(new Animated.Value(0)).current
  // State to track the content width
  const [textWidth, setTextWidth] = useState(0)

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

  // Calculate the required width for the closed state based on text content + padding + icon
  // Use minimum 120px, but allow for more space if needed
  const requiredClosedWidth = Math.max(50, textWidth > 0 ? textWidth + 50 : 120)
  
  const width = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [requiredClosedWidth, 300],
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

  const getCurrentIcon = () => {
    const currentItem = menuItems.find(item => item.route === pathname) || menuItems[0]
    return currentItem.icon
  }

  const getCurrentLabel = () => {
    const currentItem = menuItems.find(item => item.route === pathname) || menuItems[0]
    return currentItem.label
  }

  // Function to measure text width
  const onTextLayout = (e: LayoutChangeEvent) => {
    const { width } = e.nativeEvent.layout
    if (width > 0 && width !== textWidth) {
      setTextWidth(width)
    }
  }

  return (
    <>
      {isOpen && (
        <TouchableWithoutFeedback onPress={onToggle}>
          <View className="absolute -top-[1000px] -left-[1000px] -right-[1000px] -bottom-[1000px] z-[99]" />
        </TouchableWithoutFeedback>
      )}
      <View className="absolute top-[12px] right-0 z-[100]">
        <Animated.View
          className="overflow-hidden"
          style={{
            height,
            width,
            borderRadius,
            shadowColor: "#000",
            shadowOffset: {
              width: 0,
              height: 5,
            },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 8,
            maxWidth: 200
          }}
        >
          <BlurView 
            intensity={isOpen ? 70 : 20} 
            tint="dark" 
            style={styles.blurContainer}
          >
            <TouchableWithoutFeedback
              onPress={(e) => {
                e.stopPropagation()
              }}
            >
              <View>
                <TouchableOpacity 
                  onPress={onToggle}
                  activeOpacity={0.7}
                  style={{ paddingTop: 0 }}
                >
                  <Animated.View style={{ 
                    opacity: animatedValue.interpolate({
                      inputRange: [0, 0],
                      outputRange: [1, 0]
                    }),
                    height: animatedValue.interpolate({
                      inputRange: [0, 0],
                      outputRange: [36, 0]
                    }),
                    borderRadius: 20,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    {!isOpen && (
                      <View style={[styles.closedMenuContainer, { paddingTop: 8 }]}>
                        <Ionicons name={getCurrentIcon()} size={18} color="white" style={{ marginRight: 8 }} />
                        <Text 
                          style={styles.searchText}
                          numberOfLines={1}
                          ellipsizeMode="tail"
                          onLayout={onTextLayout}
                        >
                          {getCurrentLabel()}
                        </Text>
                      </View>
                    )}
                  </Animated.View>
                </TouchableOpacity>

                <Animated.View style={{ opacity }}>
                  <ScrollView
                    bounces={false}
                    showsVerticalScrollIndicator={false}
                    className="px-2 pt-2"
                  >
                    <View style={{ paddingBottom: 6 }}>
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
                            <Ionicons name={item.icon} size={14} color="white" />
                          </View>
                          <Text style={styles.menuItemText}>{item.label}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
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
    overflow: 'hidden',
    height: '100%',
    borderWidth: 0.5,
    borderColor: 'rgba(255, 255, 255, 0.08)'
  },
  closedMenuContainer: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
  },
  searchText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
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
  button: {
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    shadowColor: "#FFC107",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    fontFamily: Platform.OS === 'ios' ? '-apple-system' : 'sans-serif',
  }
});