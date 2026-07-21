import { create } from 'zustand';

/**
 * Text formatting attributes — mirrors Web's TextAttrs from lib/prosemirror/utils.ts.
 * Kept as a standalone type to avoid importing Web-only modules.
 */
export interface TextAttrs {
  bold: boolean;
  em: boolean;
  underline: boolean;
  strikethrough: boolean;
  superscript: boolean;
  subscript: boolean;
  code: boolean;
  color: string;
  backcolor: string;
  fontsize: string;
  fontname: string;
  link: string;
  align: string;
  bulletList: boolean;
  orderedList: boolean;
  blockquote: boolean;
}

export const defaultRichTextAttrs: TextAttrs = {
  bold: false,
  em: false,
  underline: false,
  strikethrough: false,
  superscript: false,
  subscript: false,
  code: false,
  color: '#000000',
  backcolor: '',
  fontsize: '16px',
  fontname: '',
  link: '',
  align: 'left',
  bulletList: false,
  orderedList: false,
  blockquote: false,
};

interface TextEditorState {
  richTextAttrs: TextAttrs;
  editingElementId: string;
  formatBarVisible: boolean;

  setRichtextAttrs: (attrs: TextAttrs) => void;
  setEditingElementId: (id: string) => void;
  setFormatBarVisible: (visible: boolean) => void;
  resetEditorState: () => void;
}

export const useTextEditorStore = create<TextEditorState>((set) => ({
  richTextAttrs: defaultRichTextAttrs,
  editingElementId: '',
  formatBarVisible: false,

  setRichtextAttrs: (attrs) => set({ richTextAttrs: attrs }),
  setEditingElementId: (id) => set({ editingElementId: id, formatBarVisible: !!id }),
  setFormatBarVisible: (visible) => set({ formatBarVisible: visible }),
  resetEditorState: () =>
    set({
      richTextAttrs: defaultRichTextAttrs,
      editingElementId: '',
      formatBarVisible: false,
    }),
}));
