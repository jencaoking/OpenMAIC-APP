import React, { useMemo } from 'react';
import { View, StyleSheet } from 'react-native';
import { ElementTypes, type PPTElement, type SlideTheme } from '@openmaic/dsl';
import { RNTextElement } from './elements/RNTextElement';
import { RNImageElement } from './elements/RNImageElement';
import { RNShapeElement } from './elements/RNShapeElement';
import { RNLineElement } from './elements/RNLineElement';
import { RNTableElement } from './elements/RNTableElement';
import { RNCodeElement } from './elements/RNCodeElement';
import { RNLatexElement } from './elements/RNLatexElement';
import { RNChartElement } from './elements/RNChartElement';

interface RNSlideElementProps {
  element: PPTElement;
  index: number;
  theme?: Pick<SlideTheme, 'fontColor' | 'fontName'>;
}

export function RNSlideElement({ element, index, theme }: RNSlideElementProps) {
  const renderElement = useMemo(() => {
    switch (element.type) {
      case ElementTypes.TEXT:
        return <RNTextElement element={element} />;
      case ElementTypes.IMAGE:
        return <RNImageElement element={element} />;
      case ElementTypes.SHAPE:
        return <RNShapeElement element={element} />;
      case ElementTypes.LINE:
        return <RNLineElement element={element} />;
      case ElementTypes.TABLE:
        return <RNTableElement element={element} />;
      case ElementTypes.CODE:
        return <RNCodeElement element={element} />;
      case ElementTypes.LATEX:
        return <RNLatexElement element={element} />;
      case ElementTypes.CHART:
        return <RNChartElement element={element} />;
      case ElementTypes.VIDEO:
      case ElementTypes.AUDIO:
        // 视频/音频暂时用占位符
        return <View style={styles.placeholder} />;
      default:
        return null;
    }
  }, [element]);

  if (!renderElement) return null;

  // 从 PPTElement 联合类型中安全提取公共字段
  const el = element as unknown as Record<string, unknown>;

  return (
    <View
      style={[
        styles.element,
        {
          left: element.left,
          top: element.top,
          width: element.width,
          height: (el.height as number) ?? 100,
          zIndex: index + 1,
          opacity: (el.opacity as number) ?? 1,
        },
      ]}
    >
      <View
        style={[
          styles.rotateWrapper,
          {
            transform: [{ rotate: `${(el.rotate as number) ?? 0}deg` }],
          },
        ]}
      >
        {renderElement}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  element: {
    position: 'absolute',
  },
  rotateWrapper: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 4,
  },
});
