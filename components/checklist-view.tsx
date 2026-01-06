"use client";

import { useState } from 'react';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { AlertTriangle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { checklistData, ChecklistItem } from '@/lib/data/checklist-data';

interface ChecklistViewProps {
  completedItems: Set<string>;
  onToggle: (id: string) => void;
}

interface SelectableItemWrapperProps {
  item: ChecklistItem;
  completedItems: Set<string>;
  onToggle: (id: string) => void;
  getRoleBadgeColor: (role: string) => string;
}

function SelectableItemWrapper({ item, completedItems, onToggle, getRoleBadgeColor }: SelectableItemWrapperProps) {
  const [isOpen, setIsOpen] = useState(false);
  const selectedCount = item.selectableItems?.filter(si => completedItems.has(si.id)).length || 0;
  const totalCount = item.selectableItems?.length || 0;

  return (
    <div className="space-y-3">
      <div className="flex items-start gap-3">
        <Checkbox
          id={item.id}
          checked={completedItems.has(item.id)}
          onCheckedChange={() => onToggle(item.id)}
          className="mt-1"
        />
        <div className="flex-1 space-y-2">
          <label
            htmlFor={item.id}
            className={`cursor-pointer block ${
              completedItems.has(item.id)
                ? 'text-gray-500 line-through'
                : 'text-gray-900'
            }`}
          >
            {item.title}
          </label>

          {item.selectableItems && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(!isOpen)}
                  className="flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2 rounded px-2 py-1 -ml-2"
                >
                  {isOpen ? (
                    <ChevronUp className="size-4" />
                  ) : (
                    <ChevronDown className="size-4" />
                  )}
                  <span className="font-medium">
                    Select reasons ({selectedCount}/{totalCount} selected)
                  </span>
                </button>
              </div>
              {isOpen && (
                <div className="ml-6 mt-2 space-y-2 border-l-2 border-gray-200 pl-4">
                  {item.selectableItems.map((selectableItem) => (
                    <div key={selectableItem.id} className="flex items-start gap-2">
                      <Checkbox
                        id={selectableItem.id}
                        checked={completedItems.has(selectableItem.id)}
                        onCheckedChange={() => onToggle(selectableItem.id)}
                        className="mt-1"
                      />
                      <label
                        htmlFor={selectableItem.id}
                        className={`cursor-pointer block text-sm ${
                          completedItems.has(selectableItem.id)
                            ? 'text-gray-500 line-through'
                            : 'text-gray-700'
                        }`}
                      >
                        {selectableItem.title}
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {item.roles && item.roles.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.roles.map((role) => (
                <Badge
                  key={role}
                  variant="secondary"
                  className={getRoleBadgeColor(role)}
                >
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </Badge>
              ))}
            </div>
          )}

          {item.description && (
            <p className="text-gray-600 text-sm">{item.description}</p>
          )}

          {item.items && item.items.length > 0 && (
            <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
              {item.items.map((subItem, idx) => (
                <li key={idx}>{subItem}</li>
              ))}
            </ul>
          )}

          {item.warning && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-200 rounded-md">
              <AlertTriangle className="size-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-800 text-sm">{item.warning}</p>
            </div>
          )}

          {item.note && (
            <div className="flex items-start gap-2 p-3 bg-sky-50 border border-sky-200 rounded-md">
              <Info className="size-4 text-sky-600 shrink-0 mt-0.5" />
              <p className="text-sky-800 text-sm">{item.note}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChecklistView({ completedItems, onToggle }: ChecklistViewProps) {
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'bg-sky-100 text-sky-700 hover:bg-sky-100';
      case 'mechanic':
        return 'bg-orange-100 text-orange-700 hover:bg-orange-100';
      case 'pilot':
        return 'bg-green-100 text-green-700 hover:bg-green-100';
      default:
        return 'bg-gray-100 text-gray-700 hover:bg-gray-100';
    }
  };

  return (
    <div className="px-6 pb-6">
      <Accordion type="single" className="w-full" collapsible>
        {checklistData.map((section) => (
          <AccordionItem key={section.step} value={`section-${section.step}`}>
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-start gap-4 w-full">
                <div className="flex items-center justify-center size-10 rounded-full bg-sky-600 text-white shrink-0">
                  {section.step}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="text-lg font-semibold text-gray-900">{section.title}</h3>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <div className="space-y-4 pt-2">
                {section.items.map((item) => (
                  <SelectableItemWrapper
                    key={item.id}
                    item={item}
                    completedItems={completedItems}
                    onToggle={onToggle}
                    getRoleBadgeColor={getRoleBadgeColor}
                  />
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}

