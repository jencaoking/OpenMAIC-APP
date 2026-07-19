'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Field, FieldLabel, FieldDescription } from '@/components/ui/field';
import type { PropertySchema, PropertyField, PropertySection } from './schemas/types';

interface PropertyFormProps {
  schema: PropertySchema;
  values: Record<string, unknown>;
  onChange: (path: string[], value: unknown) => void;
}

interface ControlProps {
  field: PropertyField;
  value: unknown;
  onChange: (value: unknown) => void;
}

function ColorPicker({ field, value, onChange }: ControlProps) {
  return (
    <div className="flex items-center gap-3">
      <input
        type="color"
        value={(value as string) || '#000000'}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-10 rounded-md cursor-pointer border border-input"
      />
      <Input
        type="text"
        value={(value as string) || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={field.placeholder}
        className="flex-1"
      />
    </div>
  );
}

function InputControl({ field, value, onChange }: ControlProps) {
  return (
    <Input
      type="text"
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
    />
  );
}

function TextareaControl({ field, value, onChange }: ControlProps) {
  return (
    <Textarea
      value={(value as string) || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={field.placeholder}
      className="resize-none"
    />
  );
}

function SliderControl({ field, value, onChange }: ControlProps) {
  const [localValue, setLocalValue] = useState([(value as number) || field.min || 0]);

  useEffect(() => {
    setLocalValue([(value as number) || field.min || 0]);
  }, [value, field.min]);

  const handleChange = (values: number[]) => {
    setLocalValue(values);
    onChange(values[0]);
  };

  return (
    <div className="space-y-2">
      <Slider
        value={localValue}
        onValueChange={handleChange}
        min={field.min}
        max={field.max}
        step={field.step}
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>{field.min}</span>
        <span className="font-medium text-foreground">{localValue[0]}</span>
        <span>{field.max}</span>
      </div>
    </div>
  );
}

function SelectControl({ field, value, onChange }: ControlProps) {
  return (
    <Select value={(value as string) || ''} onValueChange={(v) => onChange(v)}>
      <SelectTrigger>
        <SelectValue placeholder={field.placeholder} />
      </SelectTrigger>
      <SelectContent>
        {field.options?.map((option) => (
          <SelectItem key={option} value={option}>
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

function SwitchControl({ field, value, onChange }: ControlProps) {
  return (
    <Switch
      checked={(value as boolean) || false}
      onCheckedChange={(checked) => onChange(checked)}
    />
  );
}

function NumberInputControl({ field, value, onChange }: ControlProps) {
  return (
    <Input
      type="number"
      value={(value as number) || ''}
      onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
      placeholder={field.placeholder}
      min={field.min}
      max={field.max}
      step={field.step}
    />
  );
}

function ControlRenderer({ field, value, onChange }: ControlProps) {
  const renderControl = () => {
    switch (field.control) {
      case 'input':
        return <InputControl field={field} value={value} onChange={onChange} />;
      case 'textarea':
        return <TextareaControl field={field} value={value} onChange={onChange} />;
      case 'slider':
        return <SliderControl field={field} value={value} onChange={onChange} />;
      case 'select':
        return <SelectControl field={field} value={value} onChange={onChange} />;
      case 'color-picker':
        return <ColorPicker field={field} value={value} onChange={onChange} />;
      case 'switch':
        return <SwitchControl field={field} value={value} onChange={onChange} />;
      case 'number-input':
        return <NumberInputControl field={field} value={value} onChange={onChange} />;
      default:
        return <InputControl field={field} value={value} onChange={onChange} />;
    }
  };

  return (
    <Field className="space-y-1">
      <FieldLabel className="text-sm font-medium">{field.label}</FieldLabel>
      {renderControl()}
    </Field>
  );
}

function SectionRenderer({
  section,
  path,
  values,
  onChange,
}: {
  section: PropertySection;
  path: string[];
  values: Record<string, unknown>;
  onChange: (path: string[], value: unknown) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(true);

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        className="w-full flex items-center justify-between py-3 px-4 hover:bg-accent/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <span className="font-medium text-sm">{path[path.length - 1]}</span>
        {isExpanded ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      <motion.div
        initial={false}
        animate={{ height: isExpanded ? 'auto' : 0, opacity: isExpanded ? 1 : 0 }}
        transition={{ duration: 0.2 }}
        className="overflow-hidden"
      >
        <div className="px-4 pb-4 space-y-3">
          {Object.entries(section).map(([key, item]) => {
            const currentPath = [...path, key];
            const currentValue = getNestedValue(values, currentPath);

            if ('control' in item) {
              return (
                <ControlRenderer
                  key={key}
                  field={item as PropertyField}
                  value={currentValue}
                  onChange={(value) => onChange(currentPath, value)}
                />
              );
            } else {
              return (
                <SectionRenderer
                  key={key}
                  section={item as PropertySection}
                  path={currentPath}
                  values={values}
                  onChange={onChange}
                />
              );
            }
          })}
        </div>
      </motion.div>
    </div>
  );
}

function getNestedValue(obj: Record<string, unknown>, path: string[]): unknown {
  return path.reduce<unknown>((current, key) => {
    if (current && typeof current === 'object' && key in current) {
      return (current as Record<string, unknown>)[key];
    }
    return undefined;
  }, obj);
}

export function PropertyForm({ schema, values, onChange }: PropertyFormProps) {
  return (
    <div className="space-y-0">
      {Object.entries(schema).map(([key, item]) => {
        const path = [key];
        const currentValue = getNestedValue(values, path);

        if ('control' in item) {
          return (
            <ControlRenderer
              key={key}
              field={item as PropertyField}
              value={currentValue}
              onChange={(value) => onChange(path, value)}
            />
          );
        } else {
          return (
            <SectionRenderer
              key={key}
              section={item as PropertySection}
              path={path}
              values={values}
              onChange={onChange}
            />
          );
        }
      })}
    </div>
  );
}
