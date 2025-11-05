import { useEffect, useState, useCallback } from 'react';
import Image, { ImageProps } from 'next/image';

// Enhanced image props interface with better type safety
export interface OptimizedImageProps extends Omit<ImageProps, 'src'> {
  src: string;
  fallbackSrc?: string;
  showLoadingState?: boolean;
  preloadPriority?: boolean;
  generateBlurDataURL?: boolean;
}

export default function OptimizedImage({
  src,
  alt,
  fallbackSrc,
  showLoadingState = false,
  preloadPriority = false,
  generateBlurDataURL = true,
  className,
  fill = false,
  sizes,
  quality = 85,
  priority,
  placeholder = 'blur',
  blurDataURL: providedBlurDataURL,
  ...props
}: OptimizedImageProps) {
  const [imageError, setImageError] = useState(false);
  const [finalBlurDataURL, setFinalBlurDataURL] = useState<string | undefined>(providedBlurDataURL);

  // Generate a blurDataURL once
  const generateBlur = useCallback(() => {
    if (!generateBlurDataURL || finalBlurDataURL || providedBlurDataURL) return;

    const colors = [
      'rgb(229, 231, 235)',
      'rgb(209, 213, 219)',
      'rgb(156, 163, 175)',
      'rgb(107, 114, 128)',
    ];

    const colorIndex = src.length % colors.length;
    const selectedColor = colors[colorIndex];

    const svgBlur = `
      <svg width="40" height="40" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id="blur">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>
        <rect width="100%" height="100%" fill="${selectedColor}" filter="url(#blur)" />
      </svg>
    `;

    const base64Blur = `data:image/svg+xml;base64,${btoa(svgBlur)}`;
    setFinalBlurDataURL(base64Blur);
  }, [src, generateBlurDataURL, finalBlurDataURL, providedBlurDataURL]);

  useEffect(() => {
    generateBlur();
  }, [generateBlur]);

  // Handle errors and fallbacks with better error handling
  const handleError = useCallback(() => {
    console.warn('OptimizedImage: Image failed to load:', src);
    setImageError(true);
  }, [src]);

  const handleLoad = useCallback(() => {
    setImageError(false);
  }, []);

  // Determine the final blur data URL
  const blurDataURLToUse = finalBlurDataURL || providedBlurDataURL;

  // Smart quality based on connection and device
  const finalQuality = (() => {
    // Don't optimize local images (they're already optimized by Next.js)
    if (src.startsWith('/') || src.startsWith('data:') || src.startsWith('./') || src.startsWith('../')) {
      return undefined;
    }
    
    // For remote images, check connection
    if (typeof window !== 'undefined') {
      const connection = (navigator as any).connection;
      const isSlowConnection = connection && (connection.effectiveType === '2g' || connection.effectiveType === 'slow-2g');
      return isSlowConnection ? 60 : quality || 85;
    }
    
    return quality || 85;
  })();

  return (
    <Image
      src={imageError && fallbackSrc ? fallbackSrc : src}
      alt={alt}
      fill={fill}
      className={`transition-opacity duration-300 ${className || ''}`}
      sizes={sizes}
      quality={finalQuality}
      priority={preloadPriority || priority}
      placeholder={placeholder}
      blurDataURL={blurDataURLToUse}
      onError={handleError}
      onLoad={handleLoad}
      // Enhanced loading performance
      decoding="async"
      fetchPriority={preloadPriority ? "high" : "auto"}
      {...props}
    />
  );
}

// Smart Image Wrapper - Automatically detects priority images
export function SmartImage({
  src,
  alt,
  className,
  ...props
}: Omit<OptimizedImageProps, 'preloadPriority' | 'showLoadingState' | 'generateBlurDataURL'>) {
  const isPriorityImage =
    (src.includes('beale') || src.includes('Beale')) &&
    (src.includes('sunset') || src.includes('blue') || alt?.toLowerCase().includes('beale'));

  return (
    <OptimizedImage
      src={src}
      alt={alt}
      className={className}
      preloadPriority={isPriorityImage}
      showLoadingState={isPriorityImage}
      generateBlurDataURL
      {...props}
    />
  );
}

// Preload Critical Images Hook
export function usePreloadCriticalImages() {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const criticalImages = [
      { src: '/beale_no_background_sunset.png', priority: 'high' as const },
      { src: '/Beale_blue.png', priority: 'high' as const },
    ];

    // Add DNS prefetch and preconnect for performance
    const addResourceHints = () => {
      const origin = window.location.origin;
      
      // DNS prefetch
      if (!document.head.querySelector('link[rel="dns-prefetch"]')) {
        const dnsPrefetch = document.createElement('link');
        dnsPrefetch.rel = 'dns-prefetch';
        dnsPrefetch.href = origin;
        document.head.appendChild(dnsPrefetch);
      }
      
      // Preconnect for critical images
      if (!document.head.querySelector('link[rel="preconnect"]')) {
        const preconnect = document.createElement('link');
        preconnect.rel = 'preconnect';
        preconnect.href = origin;
        preconnect.setAttribute('crossorigin', '');
        document.head.appendChild(preconnect);
      }
    };

    addResourceHints();

    criticalImages.forEach(({ src, priority }) => {
      // Check if already preloaded to prevent duplicates
      if (document.querySelector(`link[rel="preload"][href="${src}"]`)) return;

      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'image';
      link.href = src;
      link.setAttribute('fetchpriority', priority);
      
      document.head.appendChild(link);
    });

    // Add performance monitoring
    if ('performance' in window && 'measure' in window.performance) {
      window.performance.mark('critical-images-preloaded');
    }

    // Cleanup is handled by browser naturally
  }, []);
}
