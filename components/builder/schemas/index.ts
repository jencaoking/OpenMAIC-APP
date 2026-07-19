import type { ComponentPropertySchemas } from './types';
import { TextPropertySchema } from './text';
import { ButtonPropertySchema } from './button';
import { ViewPropertySchema } from './view';
import { ImagePropertySchema } from './image';
import { TextInputPropertySchema } from './text-input';
import { ScrollViewPropertySchema } from './scroll-view';

export const componentPropertySchemas: ComponentPropertySchemas = {
  View: ViewPropertySchema,
  Text: TextPropertySchema,
  Button: ButtonPropertySchema,
  Image: ImagePropertySchema,
  TextInput: TextInputPropertySchema,
  ScrollView: ScrollViewPropertySchema,
};

export {
  TextPropertySchema,
  ButtonPropertySchema,
  ViewPropertySchema,
  ImagePropertySchema,
  TextInputPropertySchema,
  ScrollViewPropertySchema,
};

export type {
  PropertySchema,
  PropertyField,
  PropertySection,
  ComponentPropertySchemas,
} from './types';
