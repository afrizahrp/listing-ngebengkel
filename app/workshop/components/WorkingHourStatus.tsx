'use client';

import { useMemo, useState, useEffect, useRef } from 'react';
import { useWorkingHours } from '@/queryHooks/useWorkingHours';

interface WorkingHourStatusProps {
  waitingListId: string;
  className?: string;
}

export function WorkingHourStatus({ waitingListId, className }: WorkingHourStatusProps) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  // Lazy load: hanya fetch saat element terlihat di viewport
  useEffect(() => {
    if (!ref.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }, // Start loading 50px sebelum terlihat
    );

    observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const { data: workingHours = [] } = useWorkingHours({
    waitingListId,
    enabled: Boolean(waitingListId) && isVisible, // Hanya fetch saat visible
  });

  const status = useMemo(() => {
    if (workingHours.length === 0) {
      return { isOpen: null, message: 'Jam kerja belum tersedia' };
    }

    const now = new Date();
    const currentDay = now.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
    const currentTime = now.toTimeString().slice(0, 5); // HH:MM format

    const todayWorkingHour = workingHours.find((wh) => wh.weekday === currentDay);

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
        message: `Buka hingga pukul ${todayWorkingHour.closeTime}`,
      };
    }

    return { isOpen: false, message: 'Tutup' };
  }, [workingHours]);

  return (
    <p
      ref={ref}
      className={`text-sm ${
        status.isOpen === null
          ? 'text-muted-foreground'
          : status.isOpen
            ? 'text-green-600'
            : 'text-red-600'
      } ${className || ''}`}
    >
      {status.message}
    </p>
  );
}

