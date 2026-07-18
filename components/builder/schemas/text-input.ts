import type { PropertySchema } from './types';

export const TextInputPropertySchema: PropertySchema = {
  placeholder: {
    type: 'string',
    label: '占位文本',
    control: 'input',
    placeholder: '输入占位文本...',
  },
  style: {
    width: {
      type: 'number',
      label: '宽度',
      control: 'slider',
      min: 100,
      max: 500,
      step: 10,
    },
    padding: {
      type: 'number',
      label: '内边距',
      control: 'slider',
      min: 4,
      max: 32,
      step: 2,
    },
    borderRadius: {
      type: 'number',
      label: '圆角',
      control: 'slider',
      min: 0,
      max: 20,
      step: 2,
    },
    fontSize: {
      type: 'number',
      label: '字号',
      control: 'slider',
      min: 12,
      max: 24,
      step: 1,
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
    backgroundColor: {
      type: 'string',
      label: '背景色',
      control: 'color-picker',
    },
    color: {
      type: 'string',
      label: '文字颜色',
      control: 'color-picker',
    },
  },
};