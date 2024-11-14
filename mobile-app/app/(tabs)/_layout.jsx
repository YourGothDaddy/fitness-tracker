import {
  View,
  Image,
  Text,
  Pressable,
  StyleSheet,
  Animated,
} from "react-native";
import { Tabs } from "expo-router";
import { icons } from "../../constants";
import { Colors } from "../../constants/Colors";
import React from "react";
import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";

const TabIcon = ({ icon, color, name, focused, size }) => {
  return (
    <View style={styles.tabIconContainer}>
      <Image
        source={icon}
        resizeMode="contain"
        tintColor={color}
        style={size ? { width: size * 4, height: size * 4 } : styles.tabIcon}
      />
      {name && (
        <Text style={[styles.tabText, focused && styles.tabTextFocused]}>
          {name}
        </Text>
      )}
    </View>
  );
};

const TabsLayout = () => {
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  const scaleAnim = React.useRef(new Animated.Value(0)).current;
  const fadeAnim = React.useRef(new Animated.Value(0)).current;
  const router = useRouter();

  const showMenu = () => {
    setShowAddMenu(true);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const hideMenu = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => setShowAddMenu(false));
  };

  const handleTrackMeal = () => {
    hideMenu();
    router.push("/components/tabviews/add/trackMealView");
  };

  const handleLogWorkout = () => {
    hideMenu();
    router.push("/components/tabviews/add/trackExerciseView");
  };

  return (
    <View style={styles.container}>
      <Tabs
        screenOptions={{
          tabBarShowLabel: false,
          tabBarActiveTintColor: Colors.darkGreen.color,
          tabBarInactiveTintColor: Colors.green.color,
          tabBarStyle: styles.tabBar,
          tabBarBackground: () => <View style={styles.tabBarBackground} />,
        }}
      >
        <Tabs.Screen
          name="dashboard"
          options={{
            title: "Dashboard",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.home}
                color={color}
                name="Dashboard"
                focused={focused}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="add"
          options={{
            title: "Add",
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <Pressable onPress={showMenu} style={styles.addButton}>
                <Image
                  source={icons.plus}
                  resizeMode="contain"
                  tintColor="white"
                  style={styles.plusIcon}
                />
              </Pressable>
            ),
          }}
        />

        <Tabs.Screen
          name="more"
          options={{
            title: "More",
            headerShown: false,
            tabBarIcon: ({ color, focused }) => (
              <TabIcon
                icon={icons.menu}
                color={color}
                name="More"
                focused={focused}
              />
            ),
          }}
        />
      </Tabs>

      {showAddMenu && (
        <View style={styles.menuBackdrop}>
          <BlurView intensity={20} style={StyleSheet.absoluteFill} />
          <Pressable style={StyleSheet.absoluteFill} onPress={hideMenu} />
          <Animated.View
            style={[
              styles.menuContainer,
              {
                opacity: fadeAnim,
                transform: [
                  { scale: scaleAnim },
                  {
                    translateY: scaleAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [50, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <View style={styles.menuHeader}>
              <Text style={styles.menuTitle}>What would you like to add?</Text>
              <Text style={styles.menuSubtitle}>Choose an option below</Text>
            </View>

            <Pressable
              style={styles.menuItem}
              onPress={handleTrackMeal}
              android_ripple={{ color: "rgba(0,0,0,0.1)" }}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: "#FFF0F0" },
                ]}
              >
                <Image
                  source={icons.food}
                  style={styles.menuIcon}
                  tintColor="#FF6B6B"
                />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Track Meal</Text>
                <Text style={styles.menuItemSubtitle}>
                  Log your food intake and calories
                </Text>
              </View>
              <Image
                source={icons.chevronRight}
                style={styles.menuItemArrow}
                tintColor="#CCC"
              />
            </Pressable>

            <Pressable
              style={styles.menuItem}
              onPress={handleLogWorkout}
              android_ripple={{ color: "rgba(0,0,0,0.1)" }}
            >
              <View
                style={[
                  styles.menuIconContainer,
                  { backgroundColor: "#F0F8FF" },
                ]}
              >
                <Image
                  source={icons.exercise}
                  style={styles.menuIcon}
                  tintColor="#4DA6FF"
                />
              </View>
              <View style={styles.menuItemContent}>
                <Text style={styles.menuItemTitle}>Log Workout</Text>
                <Text style={styles.menuItemSubtitle}>
                  Record your exercise activity
                </Text>
              </View>
              <Image
                source={icons.chevronRight}
                style={styles.menuItemArrow}
                tintColor="#CCC"
              />
            </Pressable>

            <View style={styles.menuFooter}>
              <Pressable style={styles.cancelButton} onPress={hideMenu}>
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </Animated.View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabIconContainer: {
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    width: 24,
    height: 24,
  },
  tabText: {
    fontSize: 12,
    fontWeight: "400",
  },
  tabTextFocused: {
    fontWeight: "700",
  },
  tabBar: {
    position: "relative",
    height: 70,
    paddingVertical: 8,
    borderTopWidth: 0,
    elevation: 0,
    shadowOpacity: 0,
    backgroundColor: "white",
  },
  tabBarBackground: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: "100%",
    backgroundColor: "white",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  addButtonContainer: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 50,
    backgroundColor: Colors.darkGreen.color,
    alignItems: "center",
    justifyContent: "center",
  },
  plusIcon: {
    width: 45,
    height: 45,
  },
  menuBackdrop: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.4)",
  },

  menuContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 24,
    paddingTop: 24,
    paddingBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 20,
    },
    shadowOpacity: 0.35,
    shadowRadius: 35,
    elevation: 30,
  },

  menuHeader: {
    paddingHorizontal: 24,
    marginBottom: 20,
  },

  menuTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1A1A1A",
    marginBottom: 8,
  },

  menuSubtitle: {
    fontSize: 15,
    color: "#666",
    fontWeight: "500",
  },

  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginHorizontal: 12,
    marginVertical: 4,
    borderRadius: 16,
    backgroundColor: "#fff",
  },

  menuIconContainer: {
    width: 52,
    height: 52,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },

  menuIcon: {
    width: 26,
    height: 26,
  },

  menuItemContent: {
    flex: 1,
    marginLeft: 16,
  },

  menuItemTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: "#1A1A1A",
    marginBottom: 4,
  },

  menuItemSubtitle: {
    fontSize: 13,
    color: "#666",
    lineHeight: 18,
  },

  menuItemArrow: {
    width: 20,
    height: 20,
    marginLeft: 8,
  },

  menuFooter: {
    marginTop: 16,
    paddingHorizontal: 24,
    alignItems: "center",
  },

  cancelButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },

  cancelButtonText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#666",
  },
});

export default TabsLayout;
