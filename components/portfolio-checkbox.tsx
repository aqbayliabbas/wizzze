'use client';

import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

export interface CheckboxItem {
  id: string;
  label: string;
  checked: boolean;
}

interface CheckboxItemProps {
  item: CheckboxItem;
  onChange: (id: string, checked: boolean) => void;
}

export function CheckboxItem({ item, onChange }: CheckboxItemProps) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`checkbox-${item.id}`}
        checked={item.checked}
        onCheckedChange={(checked) => onChange(item.id, checked as boolean)}
      />
      <Label htmlFor={`checkbox-${item.id}`} className="text-sm font-normal">
        {item.label}
      </Label>
    </div>
  );
}

interface CheckboxListProps {
  items: CheckboxItem[];
  onChange: (id: string, checked: boolean) => void;
}

export function CheckboxList({ items, onChange }: CheckboxListProps) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <CheckboxItem key={item.id} item={item} onChange={onChange} />
      ))}
    </div>
  );
}