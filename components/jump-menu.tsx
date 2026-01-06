"use client";

import { useEffect, useState } from 'react';
import { ChevronUp, Menu } from 'lucide-react';
import { cn } from './ui/utils';
import { Card } from './ui/card';

export interface JumpMenuItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
}

interface JumpMenuProps {
  items: JumpMenuItem[];
  className?: string;
  position?: 'left' | 'right';
  sticky?: boolean;
  fullWidth?: boolean;
}

export function JumpMenu({ items, className, position = 'right', sticky = true, fullWidth = false }: JumpMenuProps) {
  const [activeSection, setActiveSection] = useState<string>(items[0]?.id || '');
  const [isOpen, setIsOpen] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // Show scroll to top button after scrolling down
      setShowScrollTop(window.scrollY > 400);

      // Find the active section based on scroll position
      const scrollPosition = window.scrollY + 150; // Offset for sticky header

      for (let i = items.length - 1; i >= 0; i--) {
        const element = document.getElementById(items[i].id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          
          if (scrollPosition >= elementTop) {
            setActiveSection(items[i].id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth',
      });
      setIsOpen(false);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  // Full width horizontal layout
  if (fullWidth) {
    return (
      <div className={cn('w-full mb-6', className)}>
        <Card className="p-4 bg-white shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-3">
            <Menu className="size-5 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wider">Jump to Section</h3>
          </div>
          <nav className="flex flex-wrap gap-2">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  'flex items-center gap-2 px-4 py-2 rounded-lg text-sm transition-colors whitespace-nowrap',
                  activeSection === item.id
                    ? 'bg-sky-600 text-white font-medium shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </Card>
      </div>
    );
  }

  // Fixed sidebar layout (original)
  return (
    <div
      className={cn(
        'fixed z-40',
        position === 'right' ? 'right-4' : 'left-4',
        sticky ? 'top-24' : 'top-4',
        className
      )}
    >
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed bottom-6 right-6 z-50 p-3 bg-sky-600 text-white rounded-full shadow-lg hover:bg-sky-700 transition-colors"
        aria-label="Toggle jump menu"
      >
        <Menu className="size-5" />
      </button>

      {/* Desktop Menu */}
      <div
        className={cn(
          'hidden md:block bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden',
          'transition-all duration-200'
        )}
      >
        <div className="p-2">
          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1 mb-1">
            Jump to
          </div>
          <nav className="space-y-1">
            {items.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={cn(
                  'w-full text-left px-3 py-2 rounded-md text-sm transition-colors flex items-center gap-2',
                  activeSection === item.id
                    ? 'bg-sky-100 text-sky-700 font-medium'
                    : 'text-gray-700 hover:bg-gray-100'
                )}
              >
                {item.icon && <span className="shrink-0">{item.icon}</span>}
                <span className="truncate">{item.label}</span>
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <>
          <div
            className="md:hidden fixed inset-0 bg-black/50 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-2xl z-50 max-h-[70vh] overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Jump to Section</h3>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            <nav className="p-4 space-y-1">
              {items.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={cn(
                    'w-full text-left px-4 py-3 rounded-lg text-base transition-colors flex items-center gap-3',
                    activeSection === item.id
                      ? 'bg-sky-100 text-sky-700 font-medium'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  {item.icon && <span className="shrink-0">{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        </>
      )}

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="hidden md:flex items-center justify-center w-10 h-10 mt-2 bg-sky-600 text-white rounded-lg shadow-lg hover:bg-sky-700 transition-colors"
          aria-label="Scroll to top"
        >
          <ChevronUp className="size-5" />
        </button>
      )}
    </div>
  );
}

