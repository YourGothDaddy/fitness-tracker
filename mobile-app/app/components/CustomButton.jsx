import { TouchableOpacity, Text } from "react-native";
import React from "react";

const CustomButton = ({
  title,
  handleOnPress,
  containerStyles,
  containerClasses,
  TextStyles,
  isLoading,
}) => {
  return (
    <TouchableOpacity
      onPress={handleOnPress}
      style={containerStyles}
      className={`${containerClasses} ${isLoading ? "opacity-50" : ""}`}
      disabled={isLoading}
    >
      <Text style={TextStyles} className="font-psemibold">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
