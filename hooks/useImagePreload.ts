import { useEffect, useState } from 'react';

interface PreloadOptions {
  priority?: boolean;
  as?: string;
  crossorigin?: string;
}

export function useImagePreload(src: string, options: PreloadOptions = {}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  
  useEffect(() => {
    // Create intersection observer for view detection
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '50px', // Start loading 50px before the image comes into view
        threshold: 0.01,
      }
    );
    
    // Create a hidden element to observe
    const observerElement = document.createElement('div');
    observerElement.style.position = 'absolute';
    observerElement.style.width = '1px';
    observerElement.style.height = '1px';
    observerElement.style.left = '-9999px';
    document.body.appendChild(observerElement);
    
    observer.observe(observerElement);
    
    return () => {
      observer.disconnect();
      try {
        if (document.body.contains(observerElement)) {
          document.body.removeChild(observerElement);
        }
      } catch (error) {
        // Node might have been removed already, ignore the error
        console.debug('Observer element cleanup error (expected):', error);
      }
    };
  }, []);
  
  useEffect(() => {
    if (!src) return;
    
    // Check if we should preload (only for priority images or specific patterns)
    const shouldPreload = options.priority || src.includes('beale') || src.includes('critical');
    
    if (!shouldPreload) {
      setIsLoaded(true);
      return;
    }
    
    // Check if we already have a preload link for this image
    const existingLink = document.querySelector(`link[rel="preload"][href="${src}"]`) as HTMLLinkElement;
    
    if (existingLink) {
      // Link already exists, just track it
      setIsLoaded(true);
      return;
    }
    
    // Create new preload link
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = options.as || 'image';
    link.href = src;
    
    if (options.crossorigin) {
      link.crossOrigin = options.crossorigin;
    }
    
    if (options.priority) {
      link.setAttribute('fetchpriority', 'high');
    }
    
    // Add the link to head
    document.head.appendChild(link);
    
    // Load the image
    const img = new Image();
    
    if (options.crossorigin) {
      img.crossOrigin = options.crossorigin;
    }
    
    let isHandled = false;
    
    const handleLoad = () => {
      if (isHandled) return;
      isHandled = true;
      setIsLoaded(true);
    };
    
    const handleError = () => {
      if (isHandled) return;
      isHandled = true;
      setIsLoaded(true); // Set to true even on error to prevent infinite loading
    };
    
    img.onload = handleLoad;
    img.onerror = handleError;
    img.src = src;
    
    // Set up cleanup with timeout to ensure cleanup happens
    const cleanup = setTimeout(() => {
      try {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      } catch (error) {
        // Node might have been removed already, ignore the error
        console.debug('Preload link cleanup error (expected):', error);
      }
    }, 5000); // Cleanup after 5 seconds regardless
    
    return () => {
      clearTimeout(cleanup);
      try {
        if (document.head.contains(link)) {
          document.head.removeChild(link);
        }
      } catch (error) {
        // Node might have been removed already, ignore the error
        console.debug('Preload link cleanup error (expected):', error);
      }
    };
  }, [src, options.as, options.crossorigin, options.priority]);
  
  return { isLoaded, isInView };
}

// Preload multiple images efficiently
export function useImagePreloadBatch(imageUrls: string[], options: PreloadOptions = {}) {
  const [loadedImages, setLoadedImages] = useState<Set<string>>(new Set());
  const [loadedCount, setLoadedCount] = useState(0);
  
  useEffect(() => {
    if (imageUrls.length === 0) return;
    
    // Clean up any existing preload links first
    const cleanupExisting = () => {
      imageUrls.forEach(url => {
        try {
          const preloadLinks = document.querySelectorAll(`link[rel="preload"][href="${url}"]`);
          preloadLinks.forEach(link => {
            try {
              if (link && link.parentNode) {
                link.parentNode.removeChild(link);
              }
            } catch (error) {
              // Node might have been removed already, ignore the error
              console.debug('Existing preload cleanup error (expected):', error);
            }
          });
        } catch (error) {
          // Query might fail if DOM has changed, ignore the error
          console.debug('Preload cleanup query error (expected):', error);
        }
      });
    };
    
    cleanupExisting();
    
    // Start loading all images with a small delay to allow cleanup
    setTimeout(() => {
      const preloadPromises = imageUrls.map((url) => {
        return new Promise<string>((resolve, reject) => {
          // Check if link already exists
          const existingLink = document.querySelector(`link[rel="preload"][href="${url}"]`);
          if (existingLink) {
            setLoadedImages(prev => new Set(prev).add(url));
            setLoadedCount(prev => prev + 1);
            resolve(url);
            return;
          }
          
          const img = new Image();
          
          if (options.crossorigin) {
            img.crossOrigin = options.crossorigin;
          }
          
          let isHandled = false;
          
          const handleLoad = () => {
            if (isHandled) return;
            isHandled = true;
            setLoadedImages(prev => new Set(prev).add(url));
            setLoadedCount(prev => prev + 1);
            resolve(url);
          };
          
          const handleError = () => {
            if (isHandled) return;
            isHandled = true;
            setLoadedImages(prev => new Set(prev).add(url));
            setLoadedCount(prev => prev + 1);
            reject(url);
          };
          
          img.onload = handleLoad;
          img.onerror = handleError;
          img.src = url;
        });
      });
      
      // Start loading all images
      Promise.allSettled(preloadPromises);
    }, 100);
    
    return () => {
      // Cleanup all preload links with error handling
      imageUrls.forEach(url => {
        try {
          const preloadLinks = document.querySelectorAll(`link[rel="preload"][href="${url}"]`);
          preloadLinks.forEach(link => {
            try {
              if (link && link.parentNode) {
                link.parentNode.removeChild(link);
              }
            } catch (error) {
              // Node might have been removed already, ignore the error
              console.debug('Preload link cleanup error (expected):', error);
            }
          });
        } catch (error) {
          // Query might fail if DOM has changed, ignore the error
          console.debug('Preload cleanup query error (expected):', error);
        }
      });
    };
  }, [imageUrls, options.as, options.crossorigin, options.priority]);
  
  return {
    loadedImages,
    loadedCount,
    totalImages: imageUrls.length,
    isComplete: loadedCount === imageUrls.length,
    isLoading: loadedCount < imageUrls.length,
  };
}

// Smart image loading with network awareness
export function useSmartImageLoading() {
  const [connectionType, setConnectionType] = useState<string>('4g');
  const [shouldPreload, setShouldPreload] = useState(true);
  const [deviceMemory, setDeviceMemory] = useState<number | undefined>(undefined);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  
  useEffect(() => {
    // Enhanced device capability detection
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      setConnectionType(connection.effectiveType || '4g');
      
      // Don't preload on slow connections
      setShouldPreload(connection.effectiveType !== '2g' && connection.effectiveType !== 'slow-2g');
      
      // Listen for connection changes
      const handleConnectionChange = () => {
        const effectiveType = connection.effectiveType;
        setConnectionType(effectiveType);
        setShouldPreload(effectiveType !== '2g' && effectiveType !== 'slow-2g');
      };
      
      connection.addEventListener('change', handleConnectionChange);
    }
    
    // Detect device memory for low-end device handling
    if ('deviceMemory' in navigator) {
      const memory = (navigator as any).deviceMemory;
      setDeviceMemory(memory);
      setIsLowEndDevice(memory <= 2); // Consider devices with 2GB or less as low-end
    }
    
    // Check for reduced motion preference
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      setShouldPreload(false); // Disable preloading for users who prefer reduced motion
    }
  }, []);
  
  return {
    connectionType,
    shouldPreload,
    isSlowConnection: connectionType === '2g' || connectionType === 'slow-2g',
    deviceMemory,
    isLowEndDevice,
  };
}

// 🎯 Critical resource hints for performance
export function useResourceHints() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Add critical resource hints
    const addResourceHint = (rel: string, href: string, attributes: Record<string, string> = {}) => {
      const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
      if (existing) return;

      const link = document.createElement('link');
      link.rel = rel;
      link.href = href;
      
      Object.entries(attributes).forEach(([key, value]) => {
        link.setAttribute(key, value);
      });
      
      document.head.appendChild(link);
    };

    // Add DNS prefetch
    addResourceHint('dns-prefetch', window.location.origin);
    
    // Add preconnect for same-origin resources
    addResourceHint('preconnect', window.location.origin, {
      crossorigin: 'anonymous'
    });
    
    // Add manifest for PWA support
    addResourceHint('manifest', '/manifest.json');
    
  }, []);
}