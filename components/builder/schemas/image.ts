import type { PropertySchema } from './types';

export const ImagePropertySchema: PropertySchema = {
  style: {
    width: {
      type: 'number',
      label: '宽度',
      control: 'slider',
      min: 50,
      max: 500,
      step: 10,
    },
    height: {
      type: 'number',
      label: '高度',
      control: 'slider',
      min: 50,
      max: 500,
      step: 10,
    },
    borderRadius: {
      type: 'number',
      label: '圆角',
      control: 'slider',
      min: 0,
      max: 50,
      step: 2,
    },
    objectFit: {
      type: 'string',
      label: '填充方式',
      control: 'select',
      options: ['cover', 'contain', 'stretch', 'repeat', 'center'],
    },
  },
};
