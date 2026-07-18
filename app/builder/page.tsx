'use client';

import { DslCanvas } from '@/components/builder/DslCanvas';
import { useEditMode } from '@/lib/contexts/edit-mode-context';
import { useBuilderStore } from '@/lib/store/builder';

export default function BuilderPage() {
  const { isEditMode } = useEditMode();

  if (!isEditMode) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">
            Please enter edit mode to use the builder
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] bg-background">
      <DslCanvas className="w-full" />
    </div>
  );
}
