import React from "react";
import { Image } from "react-native";
import { MaterialIcons, Ionicons } from "@expo/vector-icons";
import { getIcon } from "../constants/icons";

const Icon = ({ name, size = 24, color = "#000", ...props }) => {
  const png = getIcon(name);
  if (png) {
    return (
      <Image
        source={png}
        style={{ width: size, height: size, tintColor: color }}
        resizeMode="contain"
        {...props}
      />
    );
  }

  if (
    MaterialIcons.hasOwnProperty("glyphMap") &&
    MaterialIcons.glyphMap[name]
  ) {
    return <MaterialIcons name={name} size={size} color={color} {...props} />;
  }

  return <Ionicons name={name} size={size} color={color} {...props} />;
};

export default Icon;
