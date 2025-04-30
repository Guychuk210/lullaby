/**
 * TypeScript declarations for react-native-phone-number-input
 * This file overrides the default type definitions to prevent defaultProps warnings
 */

declare module 'react-native-phone-number-input' {
  import { ReactNode, RefObject } from 'react';
  import { StyleProp, TextInputProps, TextStyle, ViewStyle } from 'react-native';

  interface PhoneInputProps {
    // Regular component props
    containerStyle?: StyleProp<ViewStyle>;
    textContainerStyle?: StyleProp<ViewStyle>;
    textInputStyle?: StyleProp<TextStyle>;
    textInputProps?: TextInputProps;
    defaultValue?: string;
    defaultCode?: string;
    layout?: 'first' | 'second';
    onChangeText?: (text: string) => void;
    onChangeFormattedText?: (text: string) => void;
    withDarkTheme?: boolean;
    withShadow?: boolean;
    autoFocus?: boolean;
    placeholder?: string;
    disabled?: boolean;
    disableArrowIcon?: boolean;
    flagButtonStyle?: StyleProp<ViewStyle>;
    countryPickerButtonStyle?: StyleProp<ViewStyle>;
    renderDropdownImage?: ReactNode;
    codeTextStyle?: StyleProp<TextStyle>;
    filterProps?: any;
    countryPickerProps?: any;
    ref?: RefObject<PhoneInput>;
  }

  export default class PhoneInput extends React.Component<PhoneInputProps> {
    isValidNumber: (number: string) => boolean;
    getNumberAfterPossiblyEliminatingZero: () => {
      number: string;
      formattedNumber: string;
    };
  }
} 