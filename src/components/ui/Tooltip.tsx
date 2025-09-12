import React, { useState, useRef, useEffect } from 'react';

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  className?: string;
}

export function Tooltip({ 
  content, 
  children, 
  position = 'bottom',
  className = '' 
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState<React.CSSProperties>({});
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  const showTooltip = () => setIsVisible(true);
  const hideTooltip = () => setIsVisible(false);

  useEffect(() => {
    if (isVisible && triggerRef.current && tooltipRef.current) {
      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      
      let top, left;

      switch (position) {
        case 'top':
          top = triggerRect.top - tooltipRect.height - 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'bottom':
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
          break;
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.left - tooltipRect.width - 8;
          break;
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
          left = triggerRect.right + 8;
          break;
        default:
          top = triggerRect.bottom + 8;
          left = triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
      }

      // Ensure tooltip stays within viewport
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      if (left < 8) left = 8;
      if (left + tooltipRect.width > viewportWidth - 8) {
        left = viewportWidth - tooltipRect.width - 8;
      }
      
      // For table headers, prefer showing tooltip below even if position is 'top'
      if (top < 8) {
        top = triggerRect.bottom + 8;
      }
      if (top + tooltipRect.height > viewportHeight - 8) {
        top = triggerRect.top - tooltipRect.height - 8;
      }

      setTooltipStyle({
        position: 'fixed',
        top,
        left,
        zIndex: 1000
      });
    }
  }, [isVisible, position]);

  if (!content) return <>{children}</>;

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
        className={className}
      >
        {children}
      </div>
      
      {isVisible && (
        <div
          ref={tooltipRef}
          style={tooltipStyle}
          className="bg-gray-800 text-white text-sm rounded-lg px-3 py-2 shadow-xl border border-gray-700 max-w-sm pointer-events-none z-50"
          onMouseEnter={showTooltip}
          onMouseLeave={hideTooltip}
        >
          <div className="break-words">{content}</div>
          <div 
            className="absolute w-2 h-2 bg-gray-800 border-l border-t border-gray-700 transform rotate-45"
            style={{
              bottom: position === 'top' ? '-4px' : undefined,
              top: position === 'bottom' ? '-4px' : undefined,
              right: position === 'left' ? '-4px' : undefined,
              left: position === 'right' ? '-4px' : undefined,
              marginLeft: (position === 'top' || position === 'bottom') ? '-4px' : undefined,
              marginTop: (position === 'left' || position === 'right') ? '-4px' : undefined,
            }}
          />
        </div>
      )}
    </>
  );
}

export default Tooltip;