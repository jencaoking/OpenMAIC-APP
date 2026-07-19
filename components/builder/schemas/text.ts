import type { PropertySchema } from './types';

export const TextPropertySchema: PropertySchema = {
  text: {
    type: 'string',
    label: '文本内容',
    control: 'textarea',
    placeholder: '输入文本内容...',
  },
  style: {
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
      max: 72,
      step: 1,
    },
    fontWeight: {
      type: 'string',
      label: '字重',
      control: 'select',
      options: ['normal', 'bold', '100', '200', '300', '400', '500', '600', '700', '800', '900'],
    },
    textAlign: {
      type: 'string',
      label: '对齐方式',
      control: 'select',
      options: ['left', 'center', 'right', 'justify'],
    },
    lineHeight: {
      type: 'number',
      label: '行高',
      control: 'slider',
      min: 1,
      max: 3,
      step: 0.1,
    },
  },
};
