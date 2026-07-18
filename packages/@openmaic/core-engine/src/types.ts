export type DslComponentType = 'View' | 'Text' | 'Button' | 'Image' | 'TextInput' | 'ScrollView';

export interface ViewProps {
  style?: Record<string, unknown>;
  accessibilityLabel?: string;
  testID?: string;
}

export interface TextProps {
  style?: Record<string, unknown>;
  children?: string;
  testID?: string;
}

export interface ButtonProps {
  style?: Record<string, unknown>;
  children?: string;
  onPress?: () => void;
  disabled?: boolean;
  testID?: string;
}

export interface ImageProps {
  style?: Record<string, unknown>;
  source?: { uri: string } | number;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'repeat' | 'center';
  testID?: string;
}

export interface TextInputProps {
  style?: Record<string, unknown>;
  placeholder?: string;
  value?: string;
  onChangeText?: (text: string) => void;
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad';
  secureTextEntry?: boolean;
  testID?: string;
}

export interface ScrollViewProps {
  style?: Record<string, unknown>;
  horizontal?: boolean;
  showsVerticalScrollIndicator?: boolean;
  showsHorizontalScrollIndicator?: boolean;
  testID?: string;
}

export interface IDslNode<T extends DslComponentType = DslComponentType> {
  type: T;
  props?: Record<string, unknown>;
  children?: (IDslNode | string)[];
  id?: string;
}

export type ComponentMap = {
  [K in DslComponentType]: React.ComponentType<Record<string, unknown>>;
};

export type DslRenderOptions = {
  componentMap: ComponentMap;
  onEvent?: (eventName: string, payload: unknown) => void;
};

export type DslSchema = IDslNode | IDslNode[];