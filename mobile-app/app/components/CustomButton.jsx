import { TouchableOpacity, Text } from "react-native";
import React from "react";

const CustomButton = ({
  title,
  handleOnPress,
  containerStyles,
  textStyles,
  isLoading,
}) => {
  return (
    <TouchableOpacity
      onPress={handleOnPress}
      style={containerStyles}
      className={`${isLoading ? "opacity-50" : ""} justify-center`}
      disabled={isLoading}
    >
      <Text style={textStyles} className="text-center font-psemibold">
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default CustomButton;
