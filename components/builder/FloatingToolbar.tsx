'use client';

import {
  Edit3,
  Eye,
  Undo,
  Redo,
  Save,
  PanelLeftOpen,
  Download,
  Copy,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { useEditMode } from '@/lib/contexts/edit-mode-context';
import { useBuilderStore } from '@/lib/store/builder';
import { toast } from 'sonner';

export function FloatingToolbar() {
  const { isEditMode, toggleEditMode } = useEditMode();
  const {
    undo,
    redo,
    canUndo,
    canRedo,
    exportJson,
    selectNode,
    selectedNodeId,
    deleteNode,
    toggleMaterialPanel,
    isMaterialPanelOpen,
  } = useBuilderStore();

  const handleSaveJson = () => {
    const json = exportJson();
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'dsl-schema.json';
    a.click();
    URL.revokeObjectURL(url);
    toast.success('DSL schema exported successfully');
  };

  const handleCopyJson = () => {
    const json = exportJson();
    navigator.clipboard.writeText(json);
    toast.success('DSL schema copied to clipboard');
  };

  const handleDeleteNode = () => {
    if (selectedNodeId) {
      deleteNode(selectedNodeId);
      toast.info('Node deleted');
    }
  };

  const handleUndo = () => {
    undo();
  };

  const handleRedo = () => {
    redo();
  };

  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50">
      <div className="flex items-center gap-2 rounded-full bg-background/80 backdrop-blur-md border border-border shadow-lg px-3 py-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isEditMode ? 'default' : 'outline'}
              size="icon"
              onClick={toggleEditMode}
              className="rounded-full"
            >
              {isEditMode ? <Eye className="h-4 w-4" /> : <Edit3 className="h-4 w-4" />}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {isEditMode ? 'Exit Edit Mode' : 'Enter Edit Mode'}
          </TooltipContent>
        </Tooltip>

        <div className="h-6 w-px bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleUndo}
              disabled={!canUndo()}
              className="rounded-full"
            >
              <Undo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Undo</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleRedo}
              disabled={!canRedo()}
              className="rounded-full"
            >
              <Redo className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Redo</TooltipContent>
        </Tooltip>

        <div className="h-6 w-px bg-border" />

        {isEditMode && selectedNodeId && (
          <>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleDeleteNode}
                  className="rounded-full text-destructive hover:bg-destructive/10"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Selected</TooltipContent>
            </Tooltip>

            <div className="h-6 w-px bg-border" />
          </>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMaterialPanel}
              className={`rounded-full ${isMaterialPanelOpen ? 'bg-accent' : ''}`}
            >
              <PanelLeftOpen className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Material Panel</TooltipContent>
        </Tooltip>

        <div className="h-6 w-px bg-border" />

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopyJson}
              className="rounded-full"
            >
              <Copy className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy JSON</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveJson}
              className="rounded-full"
            >
              <Download className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Export JSON</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleSaveJson}
              className="rounded-full"
            >
              <Save className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Save</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}