export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_ID || '';

const isLocalhost =
  typeof window !== 'undefined' && window.location.hostname === 'localhost';
const COOKIE_DOMAIN = isLocalhost ? 'localhost' : '.ngebengkel.com';

declare global {
  interface Window {
    gtag: (
      command: 'config' | 'event' | 'js' | 'set' | 'consent',
      targetId: string | Date,
      config?: Record<string, unknown>
    ) => void;
  }
}

export const initializeGA = () => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('consent', 'default', {
      analytics_storage: 'denied',
      ad_storage: 'denied',
      functionality_storage: 'denied',
    });
  }
};

export const gtagPageView = (url: string, title?: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_title: title || document.title,
      page_location: url,
      cookie_domain: COOKIE_DOMAIN,
      cookie_flags: isLocalhost ? '' : 'SameSite=None;Secure',
    });
  }
};

export const gtagEvent = ({
  action,
  category,
  label,
  value,
}: {
  action: string;
  category?: string;
  label?: string;
  value?: number;
}) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value,
    });
  }
};

export const gtagCustomEvent = (
  eventName: string,
  parameters?: Record<string, unknown>
) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', eventName, parameters);
  }
};


