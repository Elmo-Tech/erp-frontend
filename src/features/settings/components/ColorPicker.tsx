"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';

const PRESET_COLORS = [
  '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#22c55e', '#14b8a6',
  '#06b6d4', '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#ec4899',
  '#f43f5e', '#64748b', '#1e293b', '#0ea5e9'
];

interface ColorPickerProps {
  value?: string;
  onChange: (color: string) => void;
}

export function ColorPicker({ value = '', onChange }: ColorPickerProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => onChange(color)}
            className={cn(
              "w-6 h-6 rounded-full border-2 focus:outline-none focus:ring-2 focus:ring-offset-1 transition-all",
              value === color ? "border-slate-800 scale-110" : "border-transparent hover:scale-110"
            )}
            style={{ backgroundColor: color }}
            title={color}
          />
        ))}
      </div>
      <div className="flex items-center gap-2">
        <div 
          className="w-8 h-8 rounded border shrink-0" 
          style={{ backgroundColor: value || 'transparent' }}
        />
        <Input 
          type="text" 
          value={value} 
          onChange={(e) => onChange(e.target.value)} 
          placeholder="#000000 or tailwind class"
          className="font-mono text-sm"
        />
      </div>
    </div>
  );
}
