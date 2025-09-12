import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  X,
  Clock,
  Filter,
  ChevronDown,
  Check
} from 'lucide-react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface SearchFilter {
  key: string;
  label: string;
  type: 'text' | 'select' | 'date' | 'daterange' | 'multiselect';
  options?: { value: string; label: string }[];
  placeholder?: string;
  defaultValue?: any;
}

export interface SearchBarProps {
  value?: string;
  placeholder?: string;
  onSearch?: (query: string) => void;
  onFilterChange?: (filters: Record<string, any>) => void;
  
  // Advanced features
  filters?: SearchFilter[];
  showFilters?: boolean;
  searchHistory?: boolean;
  debounceMs?: number;
  
  // Saved searches
  savedSearches?: Array<{
    id: string;
    name: string;
    query: string;
    filters: Record<string, any>;
  }>;
  onSaveSearch?: (name: string, query: string, filters: Record<string, any>) => void;
  onLoadSearch?: (search: { query: string; filters: Record<string, any> }) => void;
  
  // Styling
  className?: string;
  compact?: boolean;
}

// =============================================================================
// COMPONENT IMPLEMENTATION
// =============================================================================

export function SearchBar({
  value = '',
  placeholder = 'Search...',
  onSearch,
  onFilterChange,
  
  // Advanced features
  filters = [],
  showFilters = false,
  searchHistory = true,
  debounceMs = 300,
  
  // Saved searches
  savedSearches = [],
  onSaveSearch,
  onLoadSearch,
  
  // Styling
  className = '',
  compact = false
}: SearchBarProps) {
  const [localValue, setLocalValue] = useState(value);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isSavedSearchesOpen, setIsSavedSearchesOpen] = useState(false);
  const [filterValues, setFilterValues] = useState<Record<string, any>>({});
  const [history, setHistory] = useState<string[]>([]);
  
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  
  // Initialize filter values with defaults
  useEffect(() => {
    const defaultFilters: Record<string, any> = {};
    filters.forEach(filter => {
      if (filter.defaultValue !== undefined) {
        defaultFilters[filter.key] = filter.defaultValue;
      }
    });
    
    // Only update if there are actually default values to set
    if (Object.keys(defaultFilters).length > 0) {
      setFilterValues(prevValues => {
        // Only update if the values are actually different
        const hasChanges = Object.keys(defaultFilters).some(
          key => prevValues[key] !== defaultFilters[key]
        );
        return hasChanges ? { ...prevValues, ...defaultFilters } : prevValues;
      });
    }
  }, [filters.length]);
  
  // Load search history from localStorage
  useEffect(() => {
    if (searchHistory) {
      const stored = localStorage.getItem('searchHistory');
      if (stored) {
        try {
          setHistory(JSON.parse(stored).slice(0, 10)); // Keep only 10 recent searches
        } catch (e) {
          console.warn('Failed to parse search history');
        }
      }
    }
  }, [searchHistory]);
  
  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    
    debounceRef.current = setTimeout(() => {
      if (onSearch && localValue !== value) {
        onSearch(localValue);
        
        // Add to history
        if (searchHistory && localValue.trim()) {
          setHistory(prevHistory => {
            const newHistory = [localValue, ...prevHistory.filter(h => h !== localValue)].slice(0, 10);
            localStorage.setItem('searchHistory', JSON.stringify(newHistory));
            return newHistory;
          });
        }
      }
    }, debounceMs);
    
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [localValue, onSearch, debounceMs, searchHistory, value]);
  
  // Handle filter changes
  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterValues, [key]: value };
    setFilterValues(newFilters);
    onFilterChange?.(newFilters);
  };
  
  // Clear all filters
  const clearFilters = () => {
    setFilterValues({});
    onFilterChange?.({});
  };
  
  // Clear search
  const clearSearch = () => {
    setLocalValue('');
    onSearch?.('');
  };
  
  // Handle history item click
  const handleHistoryClick = (query: string) => {
    setLocalValue(query);
    onSearch?.(query);
    setIsHistoryOpen(false);
  };
  
  // Handle saved search
  const handleSaveSearch = () => {
    const name = prompt('Enter a name for this search:');
    if (name && onSaveSearch) {
      onSaveSearch(name, localValue, filterValues);
    }
  };
  
  // Handle load saved search
  const handleLoadSearch = (search: { query: string; filters: Record<string, any> }) => {
    setLocalValue(search.query);
    setFilterValues(search.filters);
    onLoadSearch?.(search);
    setIsSavedSearchesOpen(false);
  };
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsHistoryOpen(false);
        setIsSavedSearchesOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Render filter input
  const renderFilterInput = (filter: SearchFilter) => {
    const value = filterValues[filter.key] || '';
    
    switch (filter.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            placeholder={filter.placeholder}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      case 'select':
        return (
          <select
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">{filter.placeholder || 'Select...'}</option>
            {filter.options?.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
        );
      
      case 'multiselect':
        return (
          <div className="space-y-1">
            {filter.options?.map(option => (
              <label key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  checked={Array.isArray(value) ? value.includes(option.value) : false}
                  onChange={(e) => {
                    const currentValues = Array.isArray(value) ? value : [];
                    const newValues = e.target.checked
                      ? [...currentValues, option.value]
                      : currentValues.filter(v => v !== option.value);
                    handleFilterChange(filter.key, newValues);
                  }}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mr-2"
                />
                <span className="text-sm text-gray-700">{option.label}</span>
              </label>
            ))}
          </div>
        );
      
      default:
        return null;
    }
  };
  
  const hasActiveFilters = Object.values(filterValues).some(value => 
    value !== undefined && value !== '' && (!Array.isArray(value) || value.length > 0)
  );
  
  return (
    <div ref={searchRef} className={`relative ${className}`}>
      {/* Main search input */}
      <div className={`relative flex items-center ${compact ? 'space-x-2' : 'space-x-3'}`}>
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400`} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onFocus={() => {
              if (searchHistory && history.length > 0) {
                setIsHistoryOpen(true);
              }
            }}
            placeholder={placeholder}
            className={`block w-full pl-10 pr-10 ${
              compact ? 'py-2' : 'py-3'
            } border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm`}
          />
          {localValue && (
            <button
              onClick={clearSearch}
              className="absolute inset-y-0 right-0 pr-3 flex items-center"
            >
              <X className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400 hover:text-gray-600`} />
            </button>
          )}
        </div>
        
        {/* Filter toggle */}
        {filters.length > 0 && (
          <button
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
            className={`inline-flex items-center px-4 ${
              compact ? 'py-2' : 'py-3'
            } border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
              hasActiveFilters ? 'border-blue-500 text-blue-700' : ''
            }`}
          >
            <Filter className={`${compact ? 'h-4 w-4' : 'h-5 w-5'} mr-2`} />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {Object.values(filterValues).filter(v => v !== undefined && v !== '' && (!Array.isArray(v) || v.length > 0)).length}
              </span>
            )}
            <ChevronDown className={`ml-2 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </button>
        )}
        
        {/* Saved searches */}
        {savedSearches.length > 0 && (
          <button
            onClick={() => setIsSavedSearchesOpen(!isSavedSearchesOpen)}
            className={`inline-flex items-center px-4 ${
              compact ? 'py-2' : 'py-3'
            } border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            Saved
            <ChevronDown className={`ml-2 ${compact ? 'h-4 w-4' : 'h-5 w-5'}`} />
          </button>
        )}
        
        {/* Save current search */}
        {onSaveSearch && (localValue || hasActiveFilters) && (
          <button
            onClick={handleSaveSearch}
            className={`inline-flex items-center px-4 ${
              compact ? 'py-2' : 'py-3'
            } border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          >
            Save
          </button>
        )}
      </div>
      
      {/* Search history dropdown */}
      {isHistoryOpen && history.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Recent Searches</div>
          {history.map((item, index) => (
            <button
              key={index}
              onClick={() => handleHistoryClick(item)}
              className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100 flex items-center"
            >
              <Clock className="h-4 w-4 mr-2 text-gray-400" />
              {item}
            </button>
          ))}
        </div>
      )}
      
      {/* Saved searches dropdown */}
      {isSavedSearchesOpen && savedSearches.length > 0 && (
        <div className="absolute z-10 mt-1 right-0 w-80 bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">Saved Searches</div>
          {savedSearches.map((search) => (
            <button
              key={search.id}
              onClick={() => handleLoadSearch(search)}
              className="w-full text-left px-3 py-2 text-sm text-gray-900 hover:bg-gray-100"
            >
              <div className="font-medium">{search.name}</div>
              <div className="text-gray-500 truncate">{search.query}</div>
            </button>
          ))}
        </div>
      )}
      
      {/* Filters panel */}
      {isFiltersOpen && filters.length > 0 && (
        <div className="absolute z-10 mt-2 w-full bg-white shadow-lg rounded-lg border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-medium text-gray-900">Filters</h3>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filters.map((filter) => (
              <div key={filter.key}>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {filter.label}
                </label>
                {renderFilterInput(filter)}
              </div>
            ))}
          </div>
          
          <div className="mt-4 flex items-center justify-end space-x-2">
            <button
              onClick={() => setIsFiltersOpen(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchBar;