import { useEffect, useState } from 'react';

interface ImageMetrics {
  totalImages: number;
  loadedImages: number;
  failedImages: number;
  averageLoadTime: number;
  cacheHitRate: number;
  networkType: string;
  preloadSuccessRate: number;
}

export default function ImagePerformanceMonitor() {
  const [metrics, setMetrics] = useState<ImageMetrics>({
    totalImages: 0,
    loadedImages: 0,
    failedImages: 0,
    averageLoadTime: 0,
    cacheHitRate: 0,
    networkType: 'unknown',
    preloadSuccessRate: 0
  });
  
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Only show in development
    if (process.env.NODE_ENV !== 'development') return;

    // Track image performance
    const performanceObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      const imageEntries = entries.filter(entry => 
        entry.name.match(/\.(jpg|jpeg|png|gif|webp|avif|svg)$/i)
      );

      const newMetrics = { ...metrics };
      
      imageEntries.forEach((entry) => {
        const imageEntry = entry as PerformanceResourceTiming;
        
        if (imageEntry.responseEnd > 0) {
          newMetrics.totalImages += 1;
          
          if (imageEntry.transferSize === 0) {
            // Cache hit
            newMetrics.loadedImages += 1;
          } else {
            // Network load
            const loadTime = imageEntry.responseEnd - imageEntry.requestStart;
            
            if (imageEntry.responseStatus === 200) {
              newMetrics.loadedImages += 1;
              newMetrics.averageLoadTime = (
                (newMetrics.averageLoadTime * (newMetrics.loadedImages - 1)) + loadTime
              ) / newMetrics.loadedImages;
            } else {
              newMetrics.failedImages += 1;
            }
          }
        }
      });

      newMetrics.cacheHitRate = newMetrics.totalImages > 0 
        ? ((newMetrics.totalImages - newMetrics.loadedImages) / newMetrics.totalImages) * 100 
        : 0;

      setMetrics(newMetrics);
    });

    performanceObserver.observe({ entryTypes: ['resource'] });

    // Get network information
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setMetrics(prev => ({ ...prev, networkType: connection.effectiveType }));
    }

    return () => {
      performanceObserver.disconnect();
    };
  }, [metrics]);

  // Add keyboard shortcut to toggle visibility
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'I') {
        setIsVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  if (!isVisible || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 bg-black/80 text-white p-4 rounded-lg text-xs font-mono z-50 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="font-bold text-yellow-400">Image Performance</h3>
        <button 
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-white"
        >
          ✕
        </button>
      </div>
      
      <div className="space-y-1">
        <div className="flex justify-between">
          <span>Network:</span>
          <span className={metrics.networkType.includes('2g') ? 'text-red-400' : 'text-green-400'}>
            {metrics.networkType}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Total Images:</span>
          <span>{metrics.totalImages}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Loaded:</span>
          <span className="text-green-400">{metrics.loadedImages}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Failed:</span>
          <span className="text-red-400">{metrics.failedImages}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Cache Hit Rate:</span>
          <span className="text-blue-400">{metrics.cacheHitRate.toFixed(1)}%</span>
        </div>
        
        <div className="flex justify-between">
          <span>Avg Load Time:</span>
          <span>{metrics.averageLoadTime.toFixed(0)}ms</span>
        </div>
        
        <div className="text-xs text-gray-400 mt-2">
          Press Ctrl+Shift+I to toggle this panel
        </div>
      </div>
    </div>
  );
}