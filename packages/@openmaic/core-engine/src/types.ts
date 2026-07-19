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

export type DslAction =
  | { type: 'NAVIGATE'; payload: { path: string } }
  | { type: 'UPDATE_STATE'; payload: { key: string; value: unknown } }
  | {
      type: 'FETCH_DATA';
      payload: { endpoint: string; method?: string; body?: Record<string, unknown> };
    }
  | { type: 'SET_VALUE'; payload: { target: string; value: string } }
  | { type: 'CUSTOM'; name: string; payload?: Record<string, unknown> };

export interface IDslNode<T extends DslComponentType = DslComponentType> {
  type: T;
  props?: Record<string, unknown>;
  children?: (IDslNode | string)[];
  id?: string;
  actions?: Record<string, DslAction>;
}

export type ComponentMap = {
  [K in DslComponentType]: React.ComponentType<Record<string, unknown>>;
};

export type DslContext = Record<string, unknown>;

export type ActionHandler<TContext extends DslContext = DslContext> = (
  action: DslAction,
  context: TContext,
) => void;

export type DslRenderOptions<TContext extends DslContext = DslContext> = {
  componentMap: ComponentMap;
  context?: TContext;
  onAction?: ActionHandler<TContext>;
};

export type DslSchema = IDslNode | IDslNode[];
