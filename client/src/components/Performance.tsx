// Performance.tsx - Extreme PageSpeed optimization component
import React, { Suspense } from 'react';

// Enhanced lazy loading with preload hints
export const LazyComponent = ({ 
  importFunc, 
  fallback = <div>Loading...</div>,
  preload = false 
}: {
  importFunc: () => Promise<any>;
  fallback?: React.ReactNode;
  preload?: boolean;
}) => {
  const Component = React.lazy(importFunc);
  
  // Preload component on hover or intersection
  React.useEffect(() => {
    if (preload) {
      importFunc();
    }
  }, [importFunc, preload]);
  
  return (
    <Suspense fallback={fallback}>
      <Component />
    </Suspense>
  );
};

// Critical resource preloader
export const ResourcePreloader = () => {
  React.useEffect(() => {
    // Preload critical assets
    const criticalAssets = [
      '/logo.svg',
      '/favicon.svg'
    ];
    
    criticalAssets.forEach(asset => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = asset;
      link.as = asset.endsWith('.svg') ? 'image' : 'document';
      document.head.appendChild(link);
    });
    
    // Preload critical fonts (if any)
    const criticalFonts: string[] = [
      // Add font URLs here if using web fonts
    ];
    
    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.href = font;
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      document.head.appendChild(link);
    });
  }, []);
  
  return null;
};

// Enhanced image component with lazy loading and optimization
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  priority = false,
  className = '',
  ...props
}: {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  priority?: boolean;
  className?: string;
  [key: string]: any;
}) => {
  const [isLoaded, setIsLoaded] = React.useState(false);
  const [isInView, setIsInView] = React.useState(priority);
  const imgRef = React.useRef<HTMLImageElement>(null);
  
  // Intersection Observer for lazy loading
  React.useEffect(() => {
    if (priority) return;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );
    
    if (imgRef.current) {
      observer.observe(imgRef.current);
    }
    
    return () => observer.disconnect();
  }, [priority]);
  
  return (
    <div 
      ref={imgRef}
      className={`relative overflow-hidden ${className}`}
      style={{ width, height }}
    >
      {/* Placeholder while loading */}
      {!isLoaded && (
        <div 
          className="absolute inset-0 bg-gray-200 animate-pulse"
          style={{ width, height }}
        />
      )}
      
      {/* Actual image */}
      {isInView && (
        <img
          src={src}
          alt={alt}
          width={width}
          height={height}
          loading={priority ? 'eager' : 'lazy'}
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${
            isLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          {...props}
        />
      )}
    </div>
  );
};

// Performance monitoring hook
export const usePerformanceMonitoring = () => {
  React.useEffect(() => {
    // Monitor Core Web Vitals
    const observeWebVitals = () => {
      // First Contentful Paint
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.name === 'first-contentful-paint') {
            console.log('🎯 FCP:', entry.startTime);
          }
        }
      }).observe({ entryTypes: ['paint'] });
      
      // Largest Contentful Paint
      new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        console.log('🎯 LCP:', lastEntry.startTime);
      }).observe({ entryTypes: ['largest-contentful-paint'] });
      
      // Cumulative Layout Shift
      new PerformanceObserver((list) => {
        let cumulativeScore = 0;
        for (const entry of list.getEntries()) {
          const layoutShiftEntry = entry as any; // Layout shift specific properties
          if (!layoutShiftEntry.hadRecentInput) {
            cumulativeScore += layoutShiftEntry.value;
          }
        }
        console.log('🎯 CLS:', cumulativeScore);
      }).observe({ entryTypes: ['layout-shift'] });
      
      // First Input Delay
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fidEntry = entry as any; // First input delay specific properties
          console.log('🎯 FID:', fidEntry.processingStart - fidEntry.startTime);
        }
      }).observe({ entryTypes: ['first-input'] });
    };
    
    // Run after page load
    if (document.readyState === 'complete') {
      observeWebVitals();
    } else {
      window.addEventListener('load', observeWebVitals);
    }
  }, []);
};

// Service Worker registration for caching
export const registerServiceWorker = () => {
  if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('🔧 SW registered:', registration);
        })
        .catch((error) => {
          console.log('🔧 SW registration failed:', error);
        });
    });
  }
};

// Critical CSS injector hook
export const useCriticalCSS = () => {
  React.useEffect(() => {
    // Inject critical CSS for above-the-fold content
    const criticalCSS = `
      /* Critical CSS for initial render */
      .hero-section { display: block; }
      .main-nav { display: flex; }
      .loading-spinner { 
        animation: spin 1s linear infinite;
      }
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `;
    
    const style = document.createElement('style');
    style.textContent = criticalCSS;
    document.head.insertBefore(style, document.head.firstChild);
  }, []);
};

// Prefetch router for faster navigation
export const usePrefetchRouter = () => {
  React.useEffect(() => {
    // Prefetch likely next pages on hover
    const prefetchOnHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a[href^="/"]') as HTMLAnchorElement;
      
      if (link && !link.dataset.prefetched) {
        link.dataset.prefetched = 'true';
        const prefetchLink = document.createElement('link');
        prefetchLink.rel = 'prefetch';
        prefetchLink.href = link.href;
        document.head.appendChild(prefetchLink);
      }
    };
    
    document.addEventListener('mouseover', prefetchOnHover);
    return () => document.removeEventListener('mouseover', prefetchOnHover);
  }, []);
};

// Bundle size analyzer (development only)
export const BundleAnalyzer = () => {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      // Analyze bundle size and log optimization suggestions
      const analyzeBundle = () => {
        const scripts = Array.from(document.querySelectorAll('script[src]'));
        const totalSize = scripts.reduce((acc, script) => {
          const src = (script as HTMLScriptElement).src;
          // Estimate size based on URL (simplified)
          return acc + (src.length * 100); // Rough estimate
        }, 0);
        
        console.log(`📦 Estimated bundle size: ${Math.round(totalSize / 1024)}KB`);
        
        if (totalSize > 500000) { // 500KB
          console.warn('⚠️ Bundle size is large. Consider code splitting.');
        }
      };
      
      window.addEventListener('load', analyzeBundle);
    }
  }, []);
  
  return null;
};
