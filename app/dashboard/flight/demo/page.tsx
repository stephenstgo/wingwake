"use client";

import { useState } from 'react';
import { ChecklistView } from '@/components/checklist-view';
import { RoleView } from '@/components/role-view';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Plane, CheckCircle2, ArrowLeft, User, Building2, Briefcase, Shield, MapPin } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';

export default function DemoFlightPage() {
  const [completedItems, setCompletedItems] = useState<Set<string>>(new Set());

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

  // Calculate progress - total items across all categories
  const totalItems = 76; // Total checklist items
  const completionPercentage = (completedItems.size / totalItems) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
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
              <p className="text-sm text-gray-500 mt-1">Demo Flight: N12345 • KORD → KLAX</p>
            </div>
          </div>

          {/* Progress Card */}
          <Card className="p-6 bg-white shadow-sm">
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
          </Card>
        </div>

        {/* Main Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Checklist Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="checklist" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="checklist">Sequential Checklist</TabsTrigger>
                <TabsTrigger value="roles">By Role</TabsTrigger>
              </TabsList>

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
          </div>

          {/* Right Column - Flight Information */}
          <div className="lg:col-span-1">
            <Card className="p-6 bg-white shadow-sm sticky top-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Flight Information</h2>
              
              <div className="space-y-5">
                {/* Owner */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Owner</label>
                  </div>
                  <p className="text-gray-900">Skyward Aviation LLC</p>
                </div>

                {/* Aircraft */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Plane className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Aircraft</label>
                  </div>
                  <p className="text-gray-900">Cessna 172N</p>
                  <p className="text-sm text-gray-600">N12345</p>
                </div>

                {/* Pilot */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <User className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Pilot</label>
                  </div>
                  <p className="text-gray-900">John Smith</p>
                  <p className="text-sm text-gray-600">ATP, CFI, CFII</p>
                </div>

                {/* A&P */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Briefcase className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">A&P Mechanic</label>
                  </div>
                  <p className="text-gray-900">Michael Johnson</p>
                  <p className="text-sm text-gray-600">A&P #1234567, IA</p>
                </div>

                {/* Insurance Company */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Insurance Company</label>
                  </div>
                  <p className="text-gray-900">Aviation Insurance Group</p>
                  <p className="text-sm text-gray-600">Policy #AIG-2024-789</p>
                </div>

                {/* Departure Airport */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Departure Airport</label>
                  </div>
                  <p className="text-gray-900">Chicago O'Hare International</p>
                  <p className="text-sm text-gray-600">KORD</p>
                </div>

                {/* Arrival Airport */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MapPin className="size-4 text-gray-500" />
                    <label className="text-sm font-medium text-gray-700">Arrival Airport</label>
                  </div>
                  <p className="text-gray-900">Los Angeles International</p>
                  <p className="text-sm text-gray-600">KLAX</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

