import type { PropertySchema } from './types';

export const ViewPropertySchema: PropertySchema = {
  style: {
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
      max: 100,
      step: 4,
    },
    borderRadius: {
      type: 'number',
      label: '圆角',
      control: 'slider',
      min: 0,
      max: 50,
      step: 2,
    },
    flexDirection: {
      type: 'string',
      label: '排列方向',
      control: 'select',
      options: ['column', 'row'],
    },
    gap: {
      type: 'number',
      label: '间距',
      control: 'slider',
      min: 0,
      max: 60,
      step: 4,
    },
    alignItems: {
      type: 'string',
      label: '对齐方式',
      control: 'select',
      options: ['stretch', 'flex-start', 'flex-end', 'center', 'baseline'],
    },
    justifyContent: {
      type: 'string',
      label: '分布方式',
      control: 'select',
      options: [
        'flex-start',
        'flex-end',
        'center',
        'space-between',
        'space-around',
        'space-evenly',
      ],
    },
    borderWidth: {
      type: 'number',
      label: '边框宽度',
      control: 'slider',
      min: 0,
      max: 20,
      step: 1,
    },
    borderColor: {
      type: 'string',
      label: '边框颜色',
      control: 'color-picker',
    },
  },
};
