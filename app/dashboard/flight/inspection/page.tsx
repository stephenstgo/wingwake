"use client";

import { useState, useMemo } from 'react';
import { ChecklistView } from '@/components/checklist-view';
import { RoleView } from '@/components/role-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Plane, CheckCircle2, ArrowLeft, User, Building2, Briefcase, Shield, MapPin, Upload, FileText, Image, X, File, ChevronDown } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { checklistData } from '@/lib/data/checklist-data';

interface UploadedFile {
  id: string;
  file: File;
  type: 'image' | 'pdf' | 'other';
  category: string;
}

export default function InspectionFlightPage() {
  // Get all checklist item IDs and mark them as completed
  const allItemIds = useMemo(() => {
    const ids: string[] = [];
    checklistData.forEach((section) => {
      section.items.forEach((item) => {
        ids.push(item.id);
      });
    });
    return ids;
  }, []);

  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set(allItemIds));
  const [selectedCategory, setSelectedCategory] = useState<string>('registration');
  const [isDragging, setIsDragging] = useState(false);
  
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

  const initialFiles = useMemo<UploadedFile[]>(() => {
    const files: UploadedFile[] = [
      {
        id: 'reg-1',
        file: createMockFile('Aircraft_Registration_N99999.pdf', 'application/pdf', 245760),
        type: 'pdf',
        category: 'registration',
      },
      {
        id: 'aw-1',
        file: createMockFile('Airworthiness_Certificate.pdf', 'application/pdf', 189440),
        type: 'pdf',
        category: 'airworthiness',
      },
      {
        id: 'log-1',
        file: createMockFile('Engine_Logbook.pdf', 'application/pdf', 1024000),
        type: 'pdf',
        category: 'logbooks',
      },
      {
        id: 'log-2',
        file: createMockFile('Airframe_Logbook.pdf', 'application/pdf', 1536000),
        type: 'pdf',
        category: 'logbooks',
      },
      {
        id: 'log-3',
        file: createMockFile('Propeller_Logbook.pdf', 'application/pdf', 512000),
        type: 'pdf',
        category: 'logbooks',
      },
      {
        id: 'wb-1',
        file: createMockFile('Weight_Balance_Record.pdf', 'application/pdf', 307200),
        type: 'pdf',
        category: 'weight-balance',
      },
      {
        id: 'mech-1',
        file: createMockFile('Mechanic_Statement_Logbook_Entry.pdf', 'application/pdf', 128000),
        type: 'pdf',
        category: 'mechanic-statement',
      },
      {
        id: 'mech-2',
        file: createMockFile('Mechanic_Statement_Photo.jpg', 'image/jpeg', 245760),
        type: 'image',
        category: 'mechanic-statement',
      },
      {
        id: 'faa-1',
        file: createMockFile('FAA_Form_8130-6_Completed.pdf', 'application/pdf', 409600),
        type: 'pdf',
        category: 'faa-form',
      },
      {
        id: 'eq-1',
        file: createMockFile('Equipment_List.pdf', 'application/pdf', 102400),
        type: 'pdf',
        category: 'equipment-list',
      },
      {
        id: 'add-1',
        file: createMockFile('Insurance_Certificate.pdf', 'application/pdf', 204800),
        type: 'pdf',
        category: 'additional',
      },
    ];
    return files;
  }, []);

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>(initialFiles);

  const handleToggle = (id: string) => {
    setCompletedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const totalItems = allItemIds.length;
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
    setUploadedFiles((prev) => prev.filter((f) => f.id !== id));
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <Link 
            href="/dashboard"
            className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="size-4" />
            Back to Dashboard
          </Link>
          
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-sky-600 rounded-lg">
              <Plane className="size-8 text-white" />
            </div>
            <div>
              <h1 className="text-gray-900">Ferry Flight Checklist</h1>
              <p className="text-gray-600">14 CFR §21.197 / §21.199 and Part 91</p>
              <p className="text-sm text-gray-500 mt-1">Inspection Ferry: N99999 • KBOS → KBWI</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="shadow-sm">
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

            <Card className="p-6 bg-white shadow-sm mt-6">
              <div className="flex items-center gap-2 mb-6">
                <Upload className="size-5 text-gray-500" />
                <h2 className="text-xl font-semibold text-gray-900">Required Documents</h2>
              </div>
              
              <div className="mb-6 space-y-4">
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
          </div>

          <div className="lg:col-span-1">
            <Card className="p-6 bg-white shadow-sm sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Flight Information</h2>
              
              <div className="space-y-5">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Owner</label>
                  </div>
                  <p className="text-gray-900">Northeast Aviation Group</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Aircraft</label>
                  </div>
                  <p className="text-gray-900">Diamond DA40</p>
                  <p className="text-sm text-gray-600">N99999</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Pilot</label>
                  </div>
                  <p className="text-gray-900">Jennifer White</p>
                  <p className="text-sm text-gray-600">ATP, CFI, CFII</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">A&P Mechanic</label>
                  </div>
                  <p className="text-gray-900">Christopher Brown</p>
                  <p className="text-sm text-gray-600">A&P #6789012, IA</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Insurance Company</label>
                  </div>
                  <p className="text-gray-900">New England Aviation Insurance</p>
                  <p className="text-sm text-gray-600">Policy #NE-2024-147</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Departure Airport</label>
                  </div>
                  <p className="text-gray-900">Boston Logan International</p>
                  <p className="text-sm text-gray-600">KBOS</p>
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Arrival Airport</label>
                  </div>
                  <p className="text-gray-900">Baltimore/Washington International</p>
                  <p className="text-sm text-gray-600">KBWI</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

