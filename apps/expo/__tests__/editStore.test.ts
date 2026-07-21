import { useEditStore } from '../src/features/slides/edit/editStore';

describe('editStore', () => {
  beforeEach(() => {
    useEditStore.getState().setEditMode(false);
    useEditStore.getState().setRailCollapsed(false);
    useEditStore.getState().setAgentPanelVisible(false);
  });

  it('should toggle edit mode', () => {
    useEditStore.getState().setEditMode(true);
    expect(useEditStore.getState().isEditMode).toBe(true);
  });

  it('should select element', () => {
    useEditStore.getState().selectElement('el1');
    expect(useEditStore.getState().selectedElementId).toBe('el1');
  });

  it('should deselect element', () => {
    useEditStore.getState().selectElement('el1');
    useEditStore.getState().selectElement(null);
    expect(useEditStore.getState().selectedElementId).toBeNull();
  });

  it('should toggle rail', () => {
    useEditStore.getState().toggleRail();
    expect(useEditStore.getState().railCollapsed).toBe(true);
    useEditStore.getState().toggleRail();
    expect(useEditStore.getState().railCollapsed).toBe(false);
  });

  it('should toggle agent panel', () => {
    useEditStore.getState().toggleAgentPanel();
    expect(useEditStore.getState().agentPanelVisible).toBe(true);
    useEditStore.getState().toggleAgentPanel();
    expect(useEditStore.getState().agentPanelVisible).toBe(false);
  });
});
