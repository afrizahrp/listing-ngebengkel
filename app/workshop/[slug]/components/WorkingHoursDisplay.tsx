'use client';

import { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';
import { useWorkingHours, type WorkingHour } from '@/queryHooks/useWorkingHours';

const WEEKDAY_NAMES = [
  'Minggu',
  'Senin',
  'Selasa',
  'Rabu',
  'Kamis',
  'Jumat',
  'Sabtu',
] as const;

interface WorkingHoursDisplayProps {
  waitingListId: string;
}

export function WorkingHoursDisplay({ waitingListId }: WorkingHoursDisplayProps) {
  const { data: workingHours = [], isLoading, isError } = useWorkingHours({
    waitingListId,
    enabled: Boolean(waitingListId),
  });

  // Sort working hours by weekday (0=Sun, 1=Mon, ..., 6=Sat)
  const sortedWorkingHours = useMemo(() => {
    return [...workingHours].sort((a, b) => a.weekday - b.weekday);
  }, [workingHours]);

  // Check if currently open based on current day and time
  const currentStatus = useMemo(() => {
    if (sortedWorkingHours.length === 0) return null;

    const now = new Date();
    const currentDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const todayWorkingHour = sortedWorkingHours.find((wh) => wh.weekday === currentDay);

    if (!todayWorkingHour || !todayWorkingHour.isOpen) {
      return { isOpen: false, message: 'Tutup' };
    }

    if (!todayWorkingHour.openTime || !todayWorkingHour.closeTime) {
      return { isOpen: true, message: 'Buka 24 Jam' };
    }

    const isCurrentlyOpen =
      currentTime >= todayWorkingHour.openTime &&
      currentTime <= todayWorkingHour.closeTime;

    if (isCurrentlyOpen) {
      return {
        isOpen: true,
        message: `Buka - Tutup ${todayWorkingHour.closeTime}`,
      };
    }

    // Check if it's before opening time or after closing time
    if (currentTime < todayWorkingHour.openTime) {
      return {
        isOpen: false,
        message: `Tutup - Buka ${todayWorkingHour.openTime}`,
      };
    }

    return {
      isOpen: false,
      message: `Tutup - Buka ${todayWorkingHour.openTime} (Besok)`,
    };
  }, [sortedWorkingHours]);

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Jam Operasional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Memuat jam operasional...</p>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return null; // Jangan tampilkan jika error
  }

  if (sortedWorkingHours.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Jam Operasional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Jam kerja belum tersedia</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          Jam Operasional
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status Saat Ini */}
        {currentStatus && (
          <div className="flex items-center gap-2 pb-3 border-b">
            {currentStatus.isOpen ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <XCircle className="h-5 w-5 text-red-600" />
            )}
            <div>
              <p className="text-sm font-medium">Status Saat Ini</p>
              <p className="text-sm text-muted-foreground">{currentStatus.message}</p>
            </div>
          </div>
        )}

        {/* Daftar Jam Operasional per Hari */}
        <div className="space-y-2">
          {sortedWorkingHours.map((wh) => {
            const isToday = new Date().getDay() === wh.weekday;
            return (
              <div
                key={wh.id}
                className={`flex items-center justify-between py-2 px-3 rounded-lg ${
                  isToday ? 'bg-primary/5 border border-primary/20' : ''
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium min-w-[80px]">
                    {WEEKDAY_NAMES[wh.weekday]}
                    {isToday && (
                      <Badge variant="secondary" className="ml-2 text-xs">
                        Hari Ini
                      </Badge>
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {wh.isOpen ? (
                    <>
                      {wh.openTime && wh.closeTime ? (
                        <span className="text-sm text-muted-foreground">
                          {wh.openTime} - {wh.closeTime}
                        </span>
                      ) : (
                        <Badge variant="outline" className="text-xs">
                          24 Jam
                        </Badge>
                      )}
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                    </>
                  ) : (
                    <>
                      <span className="text-sm text-muted-foreground">Tutup</span>
                      <XCircle className="h-4 w-4 text-red-600" />
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

