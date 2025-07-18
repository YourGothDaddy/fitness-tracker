import { View, TextInput } from "react-native";
import React from "react";

const CustomField = ({
  styles,
  placeholder,
  placeHolderTextColor,
  numeric = false,
  allowDecimal = false,
  value,
  onChangeText,
  textInputStyle,
}) => {
  const handleTextChange = (text) => {
    if (numeric) {
      if (allowDecimal) {
        const numericValue = text
          .replace(/[^0-9.]/g, "")
          .replace(/(\..*)\./g, "$1")
          .replace(/(\.\d{1})\d+/g, "$1");
        onChangeText(numericValue);
      } else {
        const numericValue = text.replace(/[^0-9]/g, "");
        onChangeText(numericValue);
      }
    } else {
      onChangeText(text);
    }
  };

  return (
    <View style={styles} className="space-y-2 justify-center">
      <TextInput
        placeholder={placeholder}
        placeholderTextColor={placeHolderTextColor}
        keyboardType={
          numeric ? (allowDecimal ? "decimal-pad" : "number-pad") : "default"
        }
        value={value}
        onChangeText={handleTextChange}
        style={textInputStyle}
      />
    </View>
  );
};

export default CustomField;
