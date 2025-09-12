import React, { useState, useRef, useEffect, forwardRef } from 'react';
import { Check, ChevronDown, X, Search } from 'lucide-react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface Option {
  value: string | number;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface SelectProps {
  options: Option[];
  value?: string | number | (string | number)[];
  onChange: (value: string | number | (string | number)[]) => void;
  placeholder?: string;
  multiple?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  disabled?: boolean;
  loading?: boolean;
  error?: boolean;
  success?: boolean;
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  className?: string;
  maxHeight?: string;
  
  // Async loading
  onSearch?: (query: string) => Promise<Option[]> | void;
  loadingText?: string;
  noOptionsText?: string;
  
  // Custom renderers
  optionRender?: (option: Option, isSelected: boolean) => React.ReactNode;
  valueRender?: (option: Option) => React.ReactNode;
}

// =============================================================================
// SELECT COMPONENT
// =============================================================================

export const Select = forwardRef<HTMLDivElement, SelectProps>(({
  options,
  value,
  onChange,
  placeholder = 'Select...',
  multiple = false,
  searchable = false,
  clearable = false,
  disabled = false,
  loading = false,
  error = false,
  success = false,
  size = 'md',
  fullWidth = true,
  className = '',
  maxHeight = '256px',
  
  // Async loading
  onSearch,
  loadingText = 'Loading...',
  noOptionsText = 'No options found',
  
  // Custom renderers
  optionRender,
  valueRender
}, ref) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredOptions, setFilteredOptions] = useState<Option[]>(options);
  const [isLoading, setIsLoading] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const optionsRef = useRef<HTMLDivElement>(null);
  
  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2.5 text-sm',
    lg: 'px-4 py-3 text-base'
  };
  
  // Variant classes
  const variantClasses = error 
    ? 'border-red-300 focus:ring-red-500 focus:border-red-500'
    : success 
    ? 'border-green-300 focus:ring-green-500 focus:border-green-500'
    : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500';
  
  const disabledClasses = disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white text-gray-900 cursor-pointer';
  
  // Get selected options
  const selectedOptions = React.useMemo(() => {
    if (!value) return [];
    const values = Array.isArray(value) ? value : [value];
    return options.filter(option => values.includes(option.value));
  }, [value, options]);
  
  // Handle search
  useEffect(() => {
    if (!searchable && !onSearch) {
      setFilteredOptions(options);
      return;
    }
    
    if (onSearch && searchQuery) {
      setIsLoading(true);
      const result = onSearch(searchQuery);
      
      if (result instanceof Promise) {
        result.then(newOptions => {
          setFilteredOptions(newOptions);
          setIsLoading(false);
        }).catch(() => {
          setIsLoading(false);
        });
      } else {
        setIsLoading(false);
      }
    } else if (searchable) {
      const filtered = options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredOptions(filtered);
    } else {
      setFilteredOptions(options);
    }
  }, [searchQuery, options, searchable, onSearch]);
  
  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('');
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Handle option select
  const handleSelect = (option: Option) => {
    if (option.disabled) return;
    
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const newValues = currentValues.includes(option.value)
        ? currentValues.filter(v => v !== option.value)
        : [...currentValues, option.value];
      onChange(newValues);
    } else {
      onChange(option.value);
      setIsOpen(false);
      setSearchQuery('');
    }
  };
  
  // Handle clear
  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(multiple ? [] : '');
  };
  
  // Handle remove single value (in multiple mode)
  const handleRemove = (e: React.MouseEvent, optionValue: string | number) => {
    e.stopPropagation();
    if (multiple && Array.isArray(value)) {
      onChange(value.filter(v => v !== optionValue));
    }
  };
  
  // Toggle dropdown
  const toggleDropdown = () => {
    if (disabled) return;
    setIsOpen(!isOpen);
    
    // Focus search input when opening
    if (!isOpen && searchable) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 0);
    }
  };
  
  // Render selected value
  const renderValue = () => {
    if (selectedOptions.length === 0) {
      return <span className="text-gray-400">{placeholder}</span>;
    }
    
    if (multiple) {
      if (selectedOptions.length === 1) {
        const option = selectedOptions[0];
        return valueRender ? valueRender(option) : option.label;
      } else {
        return (
          <div className="flex flex-wrap gap-1">
            {selectedOptions.map(option => (
              <span
                key={option.value}
                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
              >
                {valueRender ? valueRender(option) : option.label}
                <button
                  type="button"
                  onClick={(e) => handleRemove(e, option.value)}
                  className="ml-1 inline-flex items-center justify-center h-4 w-4 text-blue-400 hover:text-blue-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        );
      }
    } else {
      const option = selectedOptions[0];
      return valueRender ? valueRender(option) : option.label;
    }
  };
  
  return (
    <div ref={containerRef} className={`relative ${fullWidth ? 'w-full' : ''} ${className}`}>
      {/* Select trigger */}
      <div
        ref={ref}
        onClick={toggleDropdown}
        className={`
          relative border rounded-md shadow-sm transition-colors focus:outline-none focus:ring-1
          ${sizeClasses[size]}
          ${variantClasses}
          ${disabledClasses}
          ${fullWidth ? 'w-full' : ''}
          ${isOpen ? 'ring-1 ring-blue-500 border-blue-500' : ''}
        `}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            {renderValue()}
          </div>
          
          <div className="flex items-center space-x-1 ml-2">
            {clearable && selectedOptions.length > 0 && !disabled && (
              <button
                type="button"
                onClick={handleClear}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            
            <ChevronDown 
              className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} 
            />
          </div>
        </div>
      </div>
      
      {/* Options dropdown */}
      {isOpen && (
        <div 
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 py-1"
          style={{ maxHeight }}
        >
          {/* Search input */}
          {searchable && (
            <div className="px-3 py-2 border-b border-gray-200">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full pl-10 pr-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          )}
          
          {/* Options list */}
          <div ref={optionsRef} className="overflow-y-auto" style={{ maxHeight: '200px' }}>
            {isLoading || loading ? (
              <div className="px-3 py-2 text-sm text-gray-500 flex items-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
                {loadingText}
              </div>
            ) : filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">
                {noOptionsText}
              </div>
            ) : (
              filteredOptions.map((option) => {
                const isSelected = multiple 
                  ? Array.isArray(value) && value.includes(option.value)
                  : value === option.value;
                
                return (
                  <div
                    key={option.value}
                    onClick={() => handleSelect(option)}
                    className={`
                      px-3 py-2 text-sm cursor-pointer flex items-center justify-between
                      ${option.disabled 
                        ? 'text-gray-400 cursor-not-allowed' 
                        : 'text-gray-900 hover:bg-gray-100'
                      }
                      ${isSelected ? 'bg-blue-50 text-blue-900' : ''}
                    `}
                  >
                    <div className="flex-1">
                      {optionRender ? optionRender(option, isSelected) : (
                        <div>
                          <div>{option.label}</div>
                          {option.description && (
                            <div className="text-xs text-gray-500">{option.description}</div>
                          )}
                        </div>
                      )}
                    </div>
                    
                    {isSelected && (
                      <Check className="h-4 w-4 text-blue-600" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;