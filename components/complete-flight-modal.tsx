"use client";

import { useState } from 'react';
import { X, Calendar, CheckCircle, Clock } from 'lucide-react';
import { updateFerryFlightAction } from '@/lib/actions/ferry-flights';
import { useRouter } from 'next/navigation';

interface CompleteFlightModalProps {
  flightId: string;
  isOpen: boolean;
  onClose: () => void;
  plannedDeparture?: string | null;
}

export function CompleteFlightModal({
  flightId,
  isOpen,
  onClose,
  plannedDeparture,
}: CompleteFlightModalProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actualDeparture, setActualDeparture] = useState('');
  const [actualArrival, setActualArrival] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Convert datetime-local value to UTC ISO string
  const convertToUTC = (datetimeLocal: string): string => {
    if (!datetimeLocal) return '';
    // datetime-local gives us a value like "2026-01-05T14:30" in local time
    // We need to create a Date object which will interpret it as local time,
    // then convert to UTC ISO string
    const localDate = new Date(datetimeLocal);
    return localDate.toISOString();
  };

  // Pre-fill actual_departure with planned_departure if available
  const getDefaultDeparture = () => {
    if (plannedDeparture) {
      const date = new Date(plannedDeparture);
      // Convert UTC ISO string to datetime-local format (YYYY-MM-DDTHH:mm)
      // datetime-local expects local time, so we use getFullYear, getMonth, etc. (not UTC versions)
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}`;
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate that both dates are provided (required)
    if (!actualDeparture) {
      setError('Actual departure date and time are required');
      return;
    }

    if (!actualArrival) {
      setError('Actual arrival date and time are required');
      return;
    }

    // Validate that actual_arrival is not before actual_departure
    const departureDate = new Date(actualDeparture);
    const arrivalDate = new Date(actualArrival);
    if (arrivalDate <= departureDate) {
      setError('Actual arrival must be after actual departure');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert datetime-local values to UTC ISO strings
      const departureUTC = convertToUTC(actualDeparture);
      const arrivalUTC = convertToUTC(actualArrival);

      const updates: any = {
        status: 'completed',
        actual_departure: departureUTC,
        actual_arrival: arrivalUTC,
      };

      const result = await updateFerryFlightAction(flightId, updates);

      if (result) {
        // Close modal and refresh the page to show updated status
        onClose();
        router.refresh();
      } else {
        setError('Failed to update flight. Please try again.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting) {
      setError(null);
      setActualDeparture('');
      setActualArrival('');
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.15)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
      }}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
            <h2 className="text-xl font-semibold text-gray-900">Mark Flight as Complete</h2>
          </div>
          <button
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Actual Departure Date & Time (UTC) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  id="actual-departure-input"
                  value={actualDeparture || getDefaultDeparture()}
                  onChange={(e) => setActualDeparture(e.target.value)}
                  max={actualArrival || undefined}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 text-gray-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('actual-departure-input');
                    if (input) {
                      (input as HTMLInputElement).showPicker?.();
                      input.focus();
                    }
                  }}
                  disabled={isSubmitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 cursor-pointer"
                  title="Open date picker"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Enter in your local time - will be converted to UTC automatically
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Actual Arrival Date & Time (UTC) <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="datetime-local"
                  id="actual-arrival-input"
                  value={actualArrival}
                  onChange={(e) => setActualArrival(e.target.value)}
                  min={actualDeparture || undefined}
                  required
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 text-gray-900 bg-white"
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.getElementById('actual-arrival-input');
                    if (input) {
                      (input as HTMLInputElement).showPicker?.();
                      input.focus();
                    }
                  }}
                  disabled={isSubmitting}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 disabled:text-gray-300 cursor-pointer"
                  title="Open date picker"
                >
                  <Calendar className="w-5 h-5" />
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Enter in your local time - will be converted to UTC automatically
              </p>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !actualDeparture || !actualArrival}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <span className="animate-spin">⏳</span>
                  Completing...
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  Mark Complete
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
