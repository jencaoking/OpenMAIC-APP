import type { PropertySchema } from './types';

export const ScrollViewPropertySchema: PropertySchema = {
  style: {
    height: {
      type: 'number',
      label: '高度',
      control: 'slider',
      min: 100,
      max: 600,
      step: 20,
    },
    backgroundColor: {
      type: 'string',
      label: '背景色',
      control: 'color-picker',
    },
    padding: {
      type: 'number',
      label: '内边距',
      control: 'slider',
      min: 0,
      max: 40,
      step: 4,
    },
    borderRadius: {
      type: 'number',
      label: '圆角',
      control: 'slider',
      min: 0,
      max: 20,
      step: 2,
    },
    borderWidth: {
      type: 'number',
      label: '边框宽度',
      control: 'slider',
      min: 0,
      max: 4,
      step: 1,
    },
    borderColor: {
      type: 'string',
      label: '边框颜色',
      control: 'color-picker',
    },
  },
};