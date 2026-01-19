"use client";

import { useState, useMemo, useEffect, useRef } from 'react';
import { ChecklistView } from '@/components/checklist-view';
import { RoleView } from '@/components/role-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Plane, CheckCircle2, ArrowLeft, User, Briefcase, Shield, MapPin, Navigation, Target, Upload, FileText, Image, X, File, ChevronDown, ChevronUp, Clock, MessageSquare, Activity, Send, Download, CheckCircle, AlertCircle, FileCheck, Route, Cloud, Wind, Plus, Trash2, UserCheck, Wrench, Menu, List } from 'lucide-react';
import { DeleteFlightButton } from '@/components/delete-flight-button';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { checklistData } from '@/lib/data/checklist-data';
import { AccountMenu } from '@/components/account-menu';
import { processPhases, getCurrentPhase } from '@/lib/data/phase-definitions';
import type { FerryFlightStatus } from '@/lib/types/database';
import { CompleteFlightModal } from '@/components/complete-flight-modal';
import { StatusTimeline } from '@/components/status-history';

export interface UploadedFile {
  id: string;
  file: File;
  type: 'image' | 'pdf' | 'other';
  category: string;
}

export interface FlightInfo {
  owner: string;
  aircraft: {
    model: string;
    registration: string;
  };
  pilot: {
    name: string;
    ratings: string;
  };
  mechanic: {
    name: string;
    certification: string;
  };
  insurance: {
    company: string;
    policy: string;
  };
  departure: {
    name: string;
    code: string;
  };
  arrival: {
    name: string;
    code: string;
  };
}

export interface FlightPageProps {
  flightType: string;
  flightInfo: FlightInfo;
  initialFiles?: UploadedFile[];
  flightStatus?: FerryFlightStatus;
  flightId?: string;
  tailNumber?: string | null;
  plannedDeparture?: string | null;
  userEmail?: string;
  statusHistory?: any[];
}

type PermitStatus = 'not-submitted' | 'submitted' | 'under-review' | 'approved' | 'rejected' | 'needs-revision';

interface Note {
  id: string;
  text: string;
  author: string;
  timestamp: Date;
}

interface ActivityLogEntry {
  id: string;
  action: string;
  user: string;
  timestamp: Date;
  type: 'file' | 'checklist' | 'status' | 'note' | 'permit';
}

export function FlightPageTemplate({ flightType, flightInfo, initialFiles = [], flightStatus = 'draft', flightId, tailNumber, plannedDeparture, userEmail, statusHistory = [] }: FlightPageProps) {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());
  const [activeSection, setActiveSection] = useState<string>('flight-information');
  const [selectedCategory, setSelectedCategory] = useState<string>('registration');
  const [isJumpMenuOpen, setIsJumpMenuOpen] = useState<boolean>(false);
  const jumpMenuRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [permitStatus, setPermitStatus] = useState<PermitStatus>('not-submitted');
  const [isCompleteModalOpen, setIsCompleteModalOpen] = useState(false);
  
  // Get current phase from flight status
  const currentPhase = getCurrentPhase(flightStatus);
  const currentPhaseIndex = processPhases.findIndex(p => p.id === currentPhase.id);
  const [notes, setNotes] = useState<Note[]>([
    { id: '1', text: 'Waiting for mechanic statement before submitting to FAA.', author: 'John Smith', timestamp: new Date(Date.now() - 86400000) },
    { id: '2', text: 'All logbooks have been reviewed and are current.', author: 'Michael Johnson', timestamp: new Date(Date.now() - 43200000) },
  ]);
  const [newNote, setNewNote] = useState('');
  const [activityLog, setActivityLog] = useState<ActivityLogEntry[]>([
    { id: '1', action: 'Flight created', user: 'System', timestamp: new Date(Date.now() - 172800000), type: 'status' },
    { id: '2', action: 'Aircraft Registration uploaded', user: 'John Smith', timestamp: new Date(Date.now() - 86400000), type: 'file' },
    { id: '3', action: 'Airworthiness Certificate uploaded', user: 'John Smith', timestamp: new Date(Date.now() - 86400000), type: 'file' },
    { id: '4', action: 'Maintenance Logbooks uploaded', user: 'Michael Johnson', timestamp: new Date(Date.now() - 72000000), type: 'file' },
    { id: '5', action: 'Note added: Waiting for mechanic statement', user: 'John Smith', timestamp: new Date(Date.now() - 86400000), type: 'note' },
  ]);
  
  // Helper function to create mock File objects
  const createMockFile = (name: string, type: string, size: number): File => {
    const content = 'x'.repeat(Math.min(size, 1000));
    const blob = new Blob([content], { type });
    try {
      // @ts-expect-error - File constructor signature varies by environment
      const file = new File([blob], name, { type, lastModified: Date.now() });
      if (file.size !== size) {
        Object.defineProperty(file, 'size', { value: size, writable: false, configurable: true });
      }
      return file;
    } catch {
      const file = blob as unknown as File;
      Object.defineProperty(file, 'name', { value: name, writable: false });
      Object.defineProperty(file, 'size', { value: size, writable: false });
      return file;
    }
  };

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialFiles);

  const handleToggle = (id: string) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      const wasCompleted = newSet.has(id);
      if (wasCompleted) {
        newSet.delete(id);
        addActivityLog('Checklist item unchecked', 'User', 'checklist');
      } else {
        newSet.add(id);
        addActivityLog('Checklist item completed', 'User', 'checklist');
      }
      return newSet;
    });
  };

  const addActivityLog = (action: string, user: string, type: ActivityLogEntry['type']) => {
    const entry: ActivityLogEntry = {
      id: `${Date.now()}-${Math.random()}`,
      action,
      user,
      timestamp: new Date(),
      type,
    };
    setActivityLog(prev => [entry, ...prev]);
  };

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const note: Note = {
      id: `${Date.now()}-${Math.random()}`,
      text: newNote,
      author: 'Current User',
      timestamp: new Date(),
    };
    setNotes(prev => [note, ...prev]);
    setNewNote('');
    addActivityLog('Note added', 'Current User', 'note');
  };

  const handleDeleteNote = (id: string) => {
    setNotes(prev => prev.filter(n => n.id !== id));
    addActivityLog('Note deleted', 'Current User', 'note');
  };

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'submit-faa':
        setPermitStatus('submitted');
        addActivityLog('FAA Form 8130-6 submitted', 'Current User', 'permit');
        break;
      case 'export-docs':
        addActivityLog('Documents exported', 'Current User', 'file');
        // In a real app, this would trigger a download
        alert('Exporting all documents...');
        break;
      case 'mark-complete':
        if (flightId) {
          setIsCompleteModalOpen(true);
        } else {
          addActivityLog('Flight marked as completed', 'Current User', 'status');
        }
        break;
      case 'approve-permit':
        setPermitStatus('approved');
        addActivityLog('Permit approved', 'FAA', 'permit');
        break;
    }
  };

  const totalItems = useMemo(() => {
    let count = 0;
    checklistData.forEach((section) => {
      count += section.items.length;
    });
    return count;
  }, []);
  const completionPercentage = (completedItems.size / totalItems) * 100;

  const requiredDocuments = [
    { id: 'registration', label: 'Aircraft Registration', required: true },
    { id: 'airworthiness', label: 'Airworthiness Certificate', required: true },
    { id: 'logbooks', label: 'Maintenance Logbooks', required: true },
    { id: 'weight-balance', label: 'Weight & Balance', required: true },
    { id: 'mechanic-statement', label: 'Mechanic Statement', required: true },
    { id: 'faa-form', label: 'FAA Form 8130-6', required: true },
    { id: 'equipment-list', label: 'Equipment List', required: false },
    { id: 'additional', label: 'Additional Documentation', required: false },
  ];

  const getFileType = (file: File): 'image' | 'pdf' | 'other' => {
    if (file.type.startsWith('image/')) return 'image';
    if (file.type === 'application/pdf') return 'pdf';
    return 'other';
  };

  const processFiles = (files: FileList | File[], category: string) => {
    Array.from(files).forEach((file) => {
      const newFile: UploadedFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        type: getFileType(file),
        category,
      };
      setUploadedFiles((prev) => [...prev, newFile]);
      addActivityLog(`${file.name} uploaded to ${requiredDocuments.find(d => d.id === category)?.label}`, 'Current User', 'file');
    });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;
    processFiles(files, selectedCategory);
    event.target.value = '';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      processFiles(files, selectedCategory);
    }
  };

  const handleFileRemove = (id: string) => {
    const file = uploadedFiles.find(f => f.id === id);
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
    if (file) {
      addActivityLog(`${file.file.name} removed`, 'Current User', 'file');
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const getFilesByCategory = (category: string) => {
    return uploadedFiles.filter((f) => f.category === category);
  };

  const formatTimestamp = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Use unified phase definitions
  const timelinePhases = processPhases;

  const getPermitStatusInfo = () => {
    switch (permitStatus) {
      case 'not-submitted':
        return { label: 'Not Submitted', color: 'bg-gray-100 text-gray-700', icon: FileCheck };
      case 'submitted':
        return { label: 'Submitted', color: 'bg-blue-100 text-blue-700', icon: FileCheck };
      case 'under-review':
        return { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock };
      case 'approved':
        return { label: 'Approved', color: 'bg-green-100 text-green-700', icon: CheckCircle };
      case 'rejected':
        return { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: AlertCircle };
      case 'needs-revision':
        return { label: 'Needs Revision', color: 'bg-orange-100 text-orange-700', icon: AlertCircle };
      default:
        return { label: 'Unknown', color: 'bg-gray-100 text-gray-700', icon: FileCheck };
    }
  };

  const jumpMenuItems = useMemo(() => [
    { id: 'flight-information', label: 'Flight Information', icon: <Plane className="size-4" /> },
    { id: 'quick-actions', label: 'Quick Actions', icon: <Send className="size-4" /> },
    { id: 'status-timeline', label: 'Status Timeline', icon: <Clock className="size-4" /> },
    { id: 'route-details', label: 'Route Details', icon: <Route className="size-4" /> },
    { id: 'permit-status', label: 'Permit Status', icon: <FileCheck className="size-4" /> },
    { id: 'activity-log', label: 'Activity Log', icon: <Activity className="size-4" /> },
    { id: 'notes', label: 'Notes & Comments', icon: <MessageSquare className="size-4" /> },
    { id: 'required-documents', label: 'Required Documents', icon: <Upload className="size-4" /> },
    { id: 'checklist', label: 'Checklist', icon: <CheckCircle2 className="size-4" /> },
  ], []);

  // Track active section for scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 150;
      for (let i = jumpMenuItems.length - 1; i >= 0; i--) {
        const element = document.getElementById(jumpMenuItems[i].id);
        if (element) {
          const rect = element.getBoundingClientRect();
          const elementTop = rect.top + window.scrollY;
          if (scrollPosition >= elementTop) {
            setActiveSection(jumpMenuItems[i].id);
            break;
          }
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [jumpMenuItems]);

  // Close jump menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (jumpMenuRef.current && !jumpMenuRef.current.contains(event.target as Node)) {
        setIsJumpMenuOpen(false);
      }
    }

    if (isJumpMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isJumpMenuOpen]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      {/* Sticky Header and Jump Menu */}
      <div className="sticky top-0 z-50 bg-gradient-to-br from-sky-50 via-white to-blue-50 border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-4 py-4 max-w-7xl">
          <div className="flex items-center justify-between">
            {/* Header Content - Left */}
            <div className="flex items-center">
              <Link href="/dashboard" className="flex items-center">
                <Plane className="w-8 h-8 text-sky-600 mr-2" />
                <span className="text-xl text-gray-900 font-semibold">WingWake</span>
              </Link>
            </div>

            {/* Menus - Right */}
            <div className="flex items-center gap-2">
              {/* Jump to Section Menu */}
              <div className="relative" ref={jumpMenuRef}>
                <button
                  onClick={() => setIsJumpMenuOpen(!isJumpMenuOpen)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                  aria-expanded={isJumpMenuOpen}
                  aria-haspopup="true"
                >
                  <List className="w-4 h-4" />
                  <span className="hidden sm:inline">Sections</span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isJumpMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                {isJumpMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50 max-h-96 overflow-y-auto">
                    <div className="py-1">
                      {jumpMenuItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                          <button
                            key={item.id}
                            onClick={() => {
                              const element = document.getElementById(item.id);
                              if (element) {
                                const headerOffset = 120;
                                const elementPosition = element.getBoundingClientRect().top;
                                const offsetPosition = elementPosition + window.scrollY - headerOffset;
                                window.scrollTo({
                                  top: offsetPosition,
                                  behavior: 'smooth',
                                });
                                setIsJumpMenuOpen(false);
                              }
                            }}
                            className={`
                              w-full flex items-center gap-3 px-4 py-2 text-sm transition-colors text-left
                              ${isActive 
                                ? 'bg-sky-50 text-sky-700 font-medium' 
                                : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                              }
                            `}
                          >
                            {item.icon && <span className="shrink-0">{item.icon}</span>}
                            <span className="truncate">{item.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Account Menu */}
              <AccountMenu />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Flight Information - Full Width */}
        <Card id="flight-information" className="p-6 bg-white shadow-sm mb-6 scroll-mt-24">
          <div className="flex items-center gap-2 mb-6">
            <Plane className="size-5 text-gray-500" />
            <h2 className="text-xl font-semibold text-gray-900">Flight Information</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="size-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Owner</label>
              </div>
              <p className="text-gray-900">{flightInfo.owner}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Plane className="size-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Aircraft</label>
              </div>
              <p className="text-gray-900">{flightInfo.aircraft.model}</p>
              <p className="text-sm text-gray-600">{flightInfo.aircraft.registration}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <UserCheck className="size-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Pilot</label>
              </div>
              <p className="text-gray-900">{flightInfo.pilot.name}</p>
              <p className="text-sm text-gray-600">{flightInfo.pilot.ratings}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Wrench className="size-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">A&P Mechanic</label>
              </div>
              <p className="text-gray-900">{flightInfo.mechanic.name}</p>
              <p className="text-sm text-gray-600">{flightInfo.mechanic.certification}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Shield className="size-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Insurance Company</label>
              </div>
              <p className="text-gray-900">{flightInfo.insurance.company}</p>
              <p className="text-sm text-gray-600">{flightInfo.insurance.policy}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Navigation className="size-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Departure Location</label>
              </div>
              <p className="text-gray-900">{flightInfo.departure.name}</p>
              <p className="text-sm text-gray-600">{flightInfo.departure.code}</p>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target className="size-4 text-gray-500" />
                <label className="text-sm font-medium text-gray-700">Destination Location</label>
              </div>
              <p className="text-gray-900">{flightInfo.arrival.name}</p>
              <p className="text-sm text-gray-600">{flightInfo.arrival.code}</p>
            </div>
          </div>
        </Card>

        {/* Status Timeline and Quick Actions - Top Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Quick Actions */}
          <Card id="quick-actions" className="p-6 bg-white shadow-sm scroll-mt-24">
            <div className="flex items-center gap-2 mb-4">
              <Send className="size-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Quick Actions</h2>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleQuickAction('export-docs')}
                className="w-full px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Download className="size-4" />
                Export Documents
              </button>
              <button
                onClick={() => handleQuickAction('submit-faa')}
                disabled={permitStatus !== 'not-submitted' || currentPhase.id === 'completed'}
                className="w-full px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <Send className="size-4" />
                Submit to FAA
              </button>
              <button
                onClick={() => handleQuickAction('mark-complete')}
                disabled={currentPhase.id === 'completed'}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-sm font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle className="size-4" />
                Mark Complete
              </button>
              {flightId && (
                <DeleteFlightButton 
                  flightId={flightId} 
                  tailNumber={tailNumber || flightInfo.aircraft.registration} 
                />
              )}
            </div>
          </Card>

          {/* Status Timeline */}
          <Card id="status-timeline" className="p-6 bg-white shadow-sm lg:col-span-2 scroll-mt-24">
            <div className="flex items-center gap-2 mb-4">
              <Clock className="size-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Status Timeline</h2>
            </div>
            <div className="relative">
              <div className="flex items-center justify-between mb-4">
                {timelinePhases.map((phase, index) => {
                  const isActive = phase.id === currentPhase.id;
                  const isPast = currentPhaseIndex > index;
                  return (
                    <div key={phase.id} className="flex-1 flex flex-col items-center">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-colors ${
                        isActive ? 'bg-sky-600 text-white' : isPast ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-500'
                      }`}>
                        {isPast ? <CheckCircle className="size-6" /> : <span className="text-sm font-semibold">{index + 1}</span>}
                      </div>
                      <p className={`text-xs font-medium text-center ${isActive ? 'text-sky-600' : isPast ? 'text-green-600' : 'text-gray-500'}`}>
                        {phase.label}
                      </p>
                    </div>
                  );
                })}
              </div>
              <div className="mt-4 p-4 bg-sky-50 rounded-lg border border-sky-200">
                <p className="text-sm font-medium text-sky-900">
                  Current Phase: {currentPhase.label}
                </p>
                <p className="text-xs text-sky-700 mt-1">
                  {currentPhase.description}
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* Permit Status and Route Details - Second Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Route Details */}
          <Card id="route-details" className="p-6 bg-white shadow-sm scroll-mt-24">
            <div className="flex items-center gap-2 mb-4">
              <Route className="size-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Route Details</h2>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Navigation className="size-3 text-gray-500" />
                    <p className="text-xs text-gray-600">Departure</p>
                  </div>
                  <p className="font-semibold text-gray-900">{flightInfo.departure.code}</p>
                  <p className="text-xs text-gray-600">{flightInfo.departure.name}</p>
                </div>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-1.5 mb-1">
                    <Target className="size-3 text-gray-500" />
                    <p className="text-xs text-gray-600">Destination</p>
                  </div>
                  <p className="font-semibold text-gray-900">{flightInfo.arrival.code}</p>
                  <p className="text-xs text-gray-600">{flightInfo.arrival.name}</p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <Cloud className="size-4 text-gray-500" />
                  <span className="text-gray-700">Weather: <span className="font-medium text-green-600">VFR Conditions</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Wind className="size-4 text-gray-500" />
                  <span className="text-gray-700">Winds: <span className="font-medium">Light and variable</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Route className="size-4 text-gray-500" />
                  <span className="text-gray-700">Distance: <span className="font-medium">~1,745 nm</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="size-4 text-gray-500" />
                  <span className="text-gray-700">Est. Flight Time: <span className="font-medium">~8.5 hours</span></span>
                </div>
              </div>
              <div className="pt-2 border-t border-gray-200">
                <p className="text-xs text-gray-600 mb-2">NOTAMs</p>
                <p className="text-sm text-gray-700">No active NOTAMs affecting this route</p>
              </div>
            </div>
          </Card>

          {/* Permit Status */}
          <Card id="permit-status" className="p-6 bg-white shadow-sm scroll-mt-24">
            <div className="flex items-center gap-2 mb-4">
              <FileCheck className="size-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Permit Status</h2>
            </div>
            <div className="space-y-4">
              {(() => {
                const statusInfo = getPermitStatusInfo();
                const StatusIcon = statusInfo.icon;
                return (
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div className={`p-2 rounded-lg ${statusInfo.color}`}>
                      <StatusIcon className="size-5" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{statusInfo.label}</p>
                      <p className="text-sm text-gray-600">
                        {permitStatus === 'not-submitted' && 'FAA Form 8130-6 not yet submitted'}
                        {permitStatus === 'submitted' && 'Submitted to FAA, awaiting review'}
                        {permitStatus === 'under-review' && 'FAA is reviewing your application'}
                        {permitStatus === 'approved' && 'Special flight permit has been approved'}
                        {permitStatus === 'rejected' && 'Application was rejected, review required'}
                        {permitStatus === 'needs-revision' && 'Additional information needed'}
                      </p>
                    </div>
                  </div>
                );
              })()}
              {permitStatus === 'approved' && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm font-medium text-green-900 mb-2">Permit Details</p>
                  <div className="space-y-1 text-xs text-green-800">
                    <p>Permit Number: SF-2024-12345</p>
                    <p>Issued: {new Date().toLocaleDateString()}</p>
                    <p>Valid Until: {new Date(Date.now() + 30 * 86400000).toLocaleDateString()}</p>
                    <p className="mt-2 font-medium">Limitations: Day VFR only, No passengers</p>
                  </div>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Notes and Activity Log - New Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Timeline / Activity Log */}
          <Card id="activity-log" className="p-6 bg-white shadow-sm scroll-mt-24">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="size-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Status Timeline</h2>
            </div>
            {statusHistory && statusHistory.length > 0 ? (
              <StatusTimeline logs={statusHistory} />
            ) : (
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {activityLog.map((entry) => {
                  const getActivityIcon = () => {
                    switch (entry.type) {
                      case 'file':
                        return <FileText className="size-4 text-blue-500" />;
                      case 'checklist':
                        return <CheckCircle2 className="size-4 text-green-500" />;
                      case 'status':
                        return <Clock className="size-4 text-gray-500" />;
                      case 'note':
                        return <MessageSquare className="size-4 text-purple-500" />;
                      case 'permit':
                        return <FileCheck className="size-4 text-orange-500" />;
                      default:
                        return <Activity className="size-4 text-gray-500" />;
                    }
                  };
                  return (
                    <div key={entry.id} className="flex items-start gap-3 p-2 hover:bg-gray-50 rounded-lg">
                      <div className="shrink-0 mt-0.5">
                        {getActivityIcon()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-gray-900">{entry.action}</p>
                        <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                          <span>{entry.user}</span>
                          <span>•</span>
                          <span>{formatTimestamp(entry.timestamp)}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>

          {/* Notes/Comments */}
          <Card id="notes" className="p-6 bg-white shadow-sm scroll-mt-24">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare className="size-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Notes & Comments</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddNote()}
                  placeholder="Add a note or comment..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
                <button
                  onClick={handleAddNote}
                  className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 transition-colors"
                >
                  <Plus className="size-4" />
                </button>
              </div>
              <div className="space-y-3 max-h-64 overflow-y-auto">
                {notes.length === 0 ? (
                  <p className="text-sm text-gray-400 italic text-center py-4">No notes yet</p>
                ) : (
                  notes.map((note) => (
                    <div key={note.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <p className="text-sm text-gray-900 flex-1">{note.text}</p>
                        <button
                          onClick={() => handleDeleteNote(note.id)}
                          className="shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                          aria-label="Delete note"
                        >
                          <Trash2 className="size-3 text-gray-500" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <span>{note.author}</span>
                        <span>•</span>
                        <span>{formatTimestamp(note.timestamp)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* Overall Progress and Required Documents - Full Width Layout */}
        <div className="space-y-6">
          {/* Required Documents */}
          <Card id="required-documents" className="p-6 bg-white shadow-sm scroll-mt-24">
            <div className="flex items-center gap-2 mb-6">
              <Upload className="size-5 text-gray-500" />
              <h2 className="text-xl font-semibold text-gray-900">Required Documents</h2>
            </div>
            
            {/* Single Upload Area with Dropdown */}
            <div className="mb-6 space-y-4">
              {/* Category Selector */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Document Category
                </label>
                <div className="relative">
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="w-full appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2.5 pr-10 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 cursor-pointer"
                  >
                    {requiredDocuments.map((doc) => (
                      <option key={doc.id} value={doc.id}>
                        {doc.label} {doc.required && '*'}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 size-4 text-gray-500 pointer-events-none" />
                </div>
              </div>

              {/* Single Drag and Drop Area */}
              <label className="block">
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,.pdf,.doc,.docx"
                  multiple
                  onChange={handleFileUpload}
                />
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-lg p-8 transition-colors cursor-pointer ${
                    isDragging
                      ? 'border-sky-500 bg-sky-50'
                      : 'border-gray-300 hover:border-sky-400 hover:bg-sky-50'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center text-center">
                    <Upload className={`size-8 mb-3 ${isDragging ? 'text-sky-600' : 'text-gray-400'}`} />
                    <span className="text-sm font-medium text-gray-700 mb-1">
                      {isDragging ? 'Drop files here' : 'Click to upload or drag and drop'}
                    </span>
                    <span className="text-xs text-gray-500">
                      Images, PDFs, and documents
                    </span>
                    <span className="text-xs text-gray-400 mt-1">
                      Files will be uploaded to: <span className="font-medium text-gray-600">
                        {requiredDocuments.find(d => d.id === selectedCategory)?.label}
                      </span>
                    </span>
                  </div>
                </div>
              </label>
            </div>

            {/* File Lists by Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {requiredDocuments.map((doc) => {
                const categoryFiles = getFilesByCategory(doc.id);
                const hasFiles = categoryFiles.length > 0;
                
                return (
                  <div key={doc.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                        {doc.label}
                        {doc.required && (
                          <span className="text-red-500 text-xs">*</span>
                        )}
                      </label>
                      {hasFiles && (
                        <span className="text-xs text-green-600 font-medium">
                          {categoryFiles.length} file{categoryFiles.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    {/* Uploaded Files List */}
                    {hasFiles ? (
                      <div className="space-y-2">
                        {categoryFiles.map((uploadedFile) => (
                          <div
                            key={uploadedFile.id}
                            className="flex items-center gap-3 p-2 bg-gray-50 rounded-lg border border-gray-200"
                          >
                            <div className="shrink-0">
                              {uploadedFile.type === 'image' ? (
                                <Image className="size-5 text-blue-500" />
                              ) : uploadedFile.type === 'pdf' ? (
                                <FileText className="size-5 text-red-500" />
                              ) : (
                                <File className="size-5 text-gray-500" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {uploadedFile.file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(uploadedFile.file.size)}
                              </p>
                            </div>
                            <button
                              onClick={() => handleFileRemove(uploadedFile.id)}
                              className="shrink-0 p-1 hover:bg-gray-200 rounded transition-colors"
                              aria-label="Remove file"
                            >
                              <X className="size-4 text-gray-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-gray-400 italic">No files uploaded yet</p>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Overall Progress */}
          <Card id="checklist" className="shadow-sm scroll-mt-24">
            <div className="px-6 pt-6 pb-4 border-b">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-5 text-sky-600" />
                  <span className="text-gray-700">Overall Progress</span>
                </div>
                <span className="text-gray-900">
                  {completedItems.size} / {totalItems} items
                </span>
              </div>
              <Progress value={completionPercentage} className="h-2" />
            </div>

            <Tabs defaultValue="checklist" className="w-full">
              <div className="px-6 pt-6 pb-4">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="checklist">Sequential Checklist</TabsTrigger>
                  <TabsTrigger value="roles">By Role</TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="checklist" className="space-y-4">
                <ChecklistView 
                  completedItems={completedItems} 
                  onToggle={handleToggle} 
                />
              </TabsContent>

              <TabsContent value="roles" className="space-y-4">
                <RoleView 
                  completedItems={completedItems} 
                  onToggle={handleToggle} 
                />
              </TabsContent>
            </Tabs>
          </Card>
        </div>
      </div>

      {/* Complete Flight Modal */}
      {flightId && (
        <CompleteFlightModal
          flightId={flightId}
          isOpen={isCompleteModalOpen}
          onClose={() => setIsCompleteModalOpen(false)}
          plannedDeparture={plannedDeparture}
        />
      )}
    </div>
  );
}

