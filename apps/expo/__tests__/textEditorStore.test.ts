import { useTextEditorStore } from '../src/features/slides/editor/textEditorStore';

describe('textEditorStore', () => {
  beforeEach(() => {
    useTextEditorStore.getState().resetEditorState();
  });

  it('should set rich text attrs', () => {
    useTextEditorStore.getState().setRichtextAttrs({
      bold: true,
      em: false,
      underline: false,
      strikethrough: false,
      superscript: false,
      subscript: false,
      code: false,
      color: '#000',
      backcolor: '',
      fontsize: '16px',
      fontname: '',
      link: '',
      align: 'left',
      bulletList: false,
      orderedList: false,
      blockquote: false,
    });
    expect(useTextEditorStore.getState().richTextAttrs.bold).toBe(true);
  });

  it('should set editing element id', () => {
    useTextEditorStore.getState().setEditingElementId('el1');
    expect(useTextEditorStore.getState().editingElementId).toBe('el1');
    expect(useTextEditorStore.getState().formatBarVisible).toBe(true);
  });

  it('should reset editor state', () => {
    useTextEditorStore.getState().setEditingElementId('el1');
    useTextEditorStore.getState().resetEditorState();
    expect(useTextEditorStore.getState().editingElementId).toBe('');
    expect(useTextEditorStore.getState().formatBarVisible).toBe(false);
  });
});
