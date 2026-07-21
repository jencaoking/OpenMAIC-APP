import React, { useRef, useCallback, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import type { PPTTextElement } from '@openmaic/dsl';
import { RNProsemirrorEditor, type RNProsemirrorEditorRef } from '../editor/RNProsemirrorEditor';
import {
  registerActiveTextEditor,
  type TextCommandPayload,
} from '../editor/activeEditorRegistry';
import { useTextEditorStore } from '../editor/textEditorStore';

interface RNTextElementProps {
  element: PPTTextElement;
  editable?: boolean;
  onContentChange?: (content: string) => void;
}

/**
 * Text element renderer — supports both playback (plain text) and editing (ProseMirror).
 *
 * When `editable` is true, renders a WebView-based ProseMirror editor with
 * identical schema, plugins, and commands as the Web side.
 *
 * When `editable` is false, renders plain text (existing behavior).
 */
export function RNTextElement({ element, editable = false, onContentChange }: RNTextElementProps) {
  const editorRef = useRef<RNProsemirrorEditorRef>(null);
  const editingElementId = useTextEditorStore((s) => s.editingElementId);
  const isEditing = editable && editingElementId === element.id;

  const vAlign = element.vAlign ?? 'top';
  const justifyContent =
    vAlign === 'middle' ? 'center' : vAlign === 'bottom' ? 'flex-end' : 'flex-start';

  // Register the editor runner for command routing
  const runCommand = useCallback(
    (payload: TextCommandPayload) => {
      if (!editorRef.current) return;

      // Map TextCommandPayload to editor commands
      switch (payload.command) {
        case 'bold':
          editorRef.current.execCommand('bold');
          break;
        case 'em':
          editorRef.current.execCommand('em');
          break;
        case 'underline':
          editorRef.current.execCommand('underline');
          break;
        case 'fontname':
          editorRef.current.execCommand('fontname', payload.value);
          break;
        case 'fontsize':
          editorRef.current.execCommand('fontsize', payload.value);
          break;
        case 'forecolor':
          editorRef.current.execCommand('color', payload.value);
          break;
        case 'align-left':
          editorRef.current.execCommand('align', 'left');
          break;
        case 'align-center':
          editorRef.current.execCommand('align', 'center');
          break;
        case 'align-right':
          editorRef.current.execCommand('align', 'right');
          break;
        case 'bulletList':
          editorRef.current.execCommand('bulletList');
          break;
      }
    },
    [],
  );

  // Register/unregister when editing
  useEffect(() => {
    if (!isEditing) return;
    const off = registerActiveTextEditor(element.id, runCommand);
    return off;
  }, [isEditing, element.id, runCommand]);

  // If not in editable mode, render plain text
  if (!isEditing) {
    const textContent = stripHtmlTags(element.content || '');

    return (
      <View
        style={[
          styles.container,
          {
            backgroundColor: element.fill,
            justifyContent,
          },
        ]}
      >
        <Text
          style={[
            styles.text,
            {
              color: element.defaultColor || '#333333',
              fontFamily: element.defaultFontName || undefined,
              fontSize: 14,
              lineHeight: element.lineHeight ? element.lineHeight * 14 : 20,
              letterSpacing: element.wordSpace,
            },
          ]}
          numberOfLines={0}
        >
          {textContent}
        </Text>
      </View>
    );
  }

  // Editable mode — render ProseMirror in WebView
  return (
    <View style={[styles.container, { backgroundColor: element.fill }]}>
      <RNProsemirrorEditor
        ref={editorRef}
        elementId={element.id}
        value={element.content || ''}
        editable
        autoFocus
        placeholder="Type something..."
        defaultColor={element.defaultColor || '#333333'}
        defaultFontName={element.defaultFontName || ''}
        onUpdate={({ value }) => onContentChange?.(value)}
      />
    </View>
  );
}

/** Strip HTML tags for plain text rendering */
function stripHtmlTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]*>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    height: '100%',
  },
  text: {
    // Default style, overridden by element attributes
  },
});
