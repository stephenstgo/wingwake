"use client";

import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { AlertTriangle, Info, Building, Wrench, Plane } from 'lucide-react';
import { checklistData } from '@/lib/data/checklist-data';

interface RoleViewProps {
  completedItems: Set<string>;
  onToggle: (id: string) => void;
}

export function RoleView({ completedItems, onToggle }: RoleViewProps) {
  // Helper function to create a short title from the full step title
  const getShortStepTitle = (title: string): string => {
    // Take first few words (up to 3-4 words) or first 25 characters
    const words = title.split(' ');
    if (words.length <= 3) {
      return title;
    }
    return words.slice(0, 3).join(' ') + '...';
  };

  // Group items by role
  const groupByRole = () => {
    const grouped: Record<string, any[]> = {
      owner: [],
      mechanic: [],
      pilot: []
    };

    checklistData.forEach((section) => {
      section.items.forEach((item) => {
        if (item.roles) {
          item.roles.forEach((role) => {
            grouped[role].push({
              ...item,
              stepNumber: section.step,
              stepTitle: section.title,
              shortStepTitle: getShortStepTitle(section.title)
            });
          });
        }
      });
    });

    return grouped;
  };

  const groupedData = groupByRole();

  const roleConfig = {
    owner: {
      title: 'Aircraft Owner / Operator',
      description: 'Includes LLCs, lessors, or managing operators',
      icon: Building,
      color: 'bg-sky-600',
      badgeColor: 'bg-sky-100 text-sky-700'
    },
    mechanic: {
      title: 'Certificated Mechanic (A&P / IA)',
      description: 'Responsible for safety inspections and documentation',
      icon: Wrench,
      color: 'bg-orange-600',
      badgeColor: 'bg-orange-100 text-orange-700'
    },
    pilot: {
      title: 'Pilot in Command (PIC)',
      description: 'Final authority under 14 CFR §91.3',
      icon: Plane,
      color: 'bg-green-600',
      badgeColor: 'bg-green-100 text-green-700'
    }
  };

  return (
    <div className="px-6 pb-6">
      <Accordion type="multiple" className="w-full" defaultValue={[]}>
        {(Object.keys(roleConfig) as Array<keyof typeof roleConfig>).map((role) => {
          const config = roleConfig[role];
          const Icon = config.icon;
          const items = groupedData[role];

          return (
            <AccordionItem key={role} value={`role-${role}`}>
              <AccordionTrigger className="px-6 py-4 hover:no-underline">
                <div className="flex items-start gap-4 w-full">
                  <div className={`flex items-center justify-center size-12 rounded-lg ${config.color} text-white shrink-0`}>
                    <Icon className="size-6" />
                  </div>
                  <div className="flex-1 text-left">
                    <h3 className="text-lg font-semibold text-gray-900">{config.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{config.description}</p>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-4 pt-2">
                  {items.map((item) => (
                    <div key={item.id} className="space-y-3 pb-4 border-b last:border-b-0 last:pb-0">
                      <div className="flex items-start gap-3">
                        <Checkbox
                          id={`${role}-${item.id}`}
                          checked={completedItems.has(item.id)}
                          onCheckedChange={() => onToggle(item.id)}
                          className="mt-1"
                        />
                        <div className="flex-1 space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <label
                              htmlFor={`${role}-${item.id}`}
                              className={`cursor-pointer block ${
                                completedItems.has(item.id)
                                  ? 'text-gray-500 line-through'
                                  : 'text-gray-900'
                              }`}
                            >
                              {item.title}
                            </label>
                            <Badge variant="outline" className="shrink-0 text-xs">
                              Step {item.stepNumber}: {item.shortStepTitle}
                            </Badge>
                          </div>

                          <p className="text-gray-500 text-sm font-medium">{item.stepTitle}</p>

                          {item.description && (
                            <p className="text-gray-600 text-sm">{item.description}</p>
                          )}

                          {item.items && item.items.length > 0 && (
                            <ul className="list-disc list-inside space-y-1 text-gray-600 text-sm ml-4">
                              {item.items.map((subItem: string, idx: number) => (
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
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

