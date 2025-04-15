import React, { useRef, useEffect } from "react"
import { View, TouchableOpacity, Text, TouchableWithoutFeedback, Animated, Platform, StyleSheet } from "react-native"
import { BlurView } from "expo-blur"
import { Ionicons } from "@expo/vector-icons"
import { ScrollView } from "react-native-gesture-handler"

const menuItems = [
  { icon: "search-outline", label: "Search" },
  { icon: "trophy", label: "Mes Ligues" },
  { icon: "star", label: "Mes Équipes" },
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
    outputRange: [36, Platform.OS === "web" ? 210 : 190],
  })

  const width = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [120, 200],
  })

  const borderRadius = expandAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [20, 18],
  })

  const opacity = animatedValue.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0, 1],
  })

  return (
    <>
      {isOpen && (
        <TouchableWithoutFeedback onPress={onToggle}>
          <View className="absolute -top-[1000px] -left-[1000px] -right-[1000px] -bottom-[1000px] z-[99]" />
        </TouchableWithoutFeedback>
      )}
      <View className="absolute top-2 right-0 z-[100]">
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
            elevation: 8
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
                    paddingTop: 3,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between'
                  }}>
                    {!isOpen && (
                      <View style={styles.closedMenuContainer}>
                        <Ionicons name="search-outline" size={18} color="white" />
                        <Text style={styles.searchText}>Search</Text>
                        <Ionicons
                          name="menu-outline"
                          size={18}
                          color="white"
                          style={{ opacity: 0.6 }}
                        />
                      </View>
                    )}
                  </Animated.View>
                </TouchableOpacity>

                <Animated.View style={{ opacity }}>
                  <ExpandedHeader />
                  <ScrollView
                    bounces={true}
                    showsVerticalScrollIndicator={false}
                    className="px-2"
                  >
                    <View style={{ paddingBottom: 6 }}>
                      {menuItems.map((item, index) => (
                        <TouchableOpacity
                          key={index}
                          style={[
                            styles.menuItem,
                            item.icon === "search-outline" ? styles.activeMenuItem : null
                          ]}
                          activeOpacity={0.7}
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
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  searchText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 6,
    marginRight: 6,
    flex: 1,
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

