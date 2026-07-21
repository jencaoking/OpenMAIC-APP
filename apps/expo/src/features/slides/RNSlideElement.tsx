import React, { useMemo, useCallback } from 'react';
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
import { RNInteractiveScene } from './elements/RNInteractiveScene';
import type { InteractiveContent } from './interactiveTypes';
import { PBLRenderer } from './pbl';
import type { PBLContent } from './pbl/pblTypes';
import { useTextEditorStore } from './editor/textEditorStore';

interface RNSlideElementProps {
  element: PPTElement;
  index: number;
  theme?: Pick<SlideTheme, 'fontColor' | 'fontName'>;
  editable?: boolean;
  onElementContentChange?: (elementId: string, content: string) => void;
}

export function RNSlideElement({
  element,
  index,
  theme,
  editable = false,
  onElementContentChange,
}: RNSlideElementProps) {
  const setEditingElementId = useTextEditorStore((s) => s.setEditingElementId);

  const handleContentChange = useCallback(
    (content: string) => onElementContentChange?.(element.id, content),
    [element.id, onElementContentChange],
  );

  const handleDoubleClick = useCallback(() => {
    if (editable && element.type === ElementTypes.TEXT) {
      setEditingElementId(element.id);
    }
  }, [editable, element.id, element.type, setEditingElementId]);

  const renderElement = useMemo(() => {
    switch (element.type) {
      case ElementTypes.TEXT:
        return (
          <RNTextElement
            element={element}
            editable={editable}
            onContentChange={handleContentChange}
          />
        );
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
      case 'interactive':
        return <RNInteractiveScene element={element as unknown as InteractiveContent} />;
      case 'pbl':
        return <PBLRenderer content={element as unknown as PBLContent} sceneId={element.id} />;
      case ElementTypes.VIDEO:
      case ElementTypes.AUDIO:
        return <View style={styles.placeholder} />;
      default:
        return null;
    }
  }, [element, editable, handleContentChange]);

  if (!renderElement) return null;

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
      onTouchEnd={handleDoubleClick}
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
