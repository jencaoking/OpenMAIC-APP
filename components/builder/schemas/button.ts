import type { PropertySchema } from './types';

export const ButtonPropertySchema: PropertySchema = {
  label: {
    type: 'string',
    label: '按钮文字',
    control: 'input',
    placeholder: '按钮文字',
  },
  style: {
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
    fontSize: {
      type: 'number',
      label: '字号',
      control: 'slider',
      min: 10,
      max: 32,
      step: 1,
    },
    padding: {
      type: 'number',
      label: '内边距',
      control: 'slider',
      min: 4,
      max: 40,
      step: 2,
    },
    borderRadius: {
      type: 'number',
      label: '圆角',
      control: 'slider',
      min: 0,
      max: 50,
      step: 2,
    },
    fontWeight: {
      type: 'string',
      label: '字重',
      control: 'select',
      options: ['normal', 'bold', '500', '600', '700'],
    },
  },
};
