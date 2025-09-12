import React, { useState, useMemo } from 'react';
import {
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  MoreHorizontal,
  Download,
  Filter,
  Search
} from 'lucide-react';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface Column<T = any> {
  key: string;
  header: string;
  accessor?: keyof T | ((row: T) => any);
  sortable?: boolean;
  filterable?: boolean;
  width?: string;
  minWidth?: string;
  render?: (value: any, row: T, index: number) => React.ReactNode;
  headerRender?: () => React.ReactNode;
  className?: string;
  headerClassName?: string;
}

export interface DataTableProps<T = any> {
  data: T[];
  columns: Column<T>[];
  loading?: boolean;
  error?: string | null;
  
  // Pagination
  pagination?: boolean;
  pageSize?: number;
  pageSizeOptions?: number[];
  currentPage?: number;
  totalItems?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  
  // Sorting
  sortable?: boolean;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  onSort?: (column: string, order: 'asc' | 'desc') => void;
  
  // Selection
  selectable?: boolean;
  selectedRows?: string[] | number[];
  onSelectionChange?: (selected: string[] | number[]) => void;
  rowKey?: keyof T | ((row: T) => string | number);
  
  // Actions
  actions?: {
    label: string;
    icon?: React.ComponentType<any>;
    onClick: (selectedRows: T[]) => void;
    disabled?: boolean;
    variant?: 'primary' | 'secondary' | 'danger';
  }[];
  
  // Styling
  className?: string;
  compact?: boolean;
  hoverable?: boolean;
  striped?: boolean;
  
  // Empty state
  emptyMessage?: string;
  emptyIcon?: React.ComponentType<any>;
  
  // Export
  exportable?: boolean;
  onExport?: (format: 'csv' | 'pdf') => void;
}

// =============================================================================
// COMPONENT IMPLEMENTATION
// =============================================================================

export function DataTable<T = any>({
  data = [],
  columns = [],
  loading = false,
  error = null,
  
  // Pagination
  pagination = true,
  pageSize = 20,
  pageSizeOptions = [10, 20, 50, 100],
  currentPage = 1,
  totalItems,
  onPageChange,
  onPageSizeChange,
  
  // Sorting
  sortable = true,
  sortBy,
  sortOrder,
  onSort,
  
  // Selection
  selectable = false,
  selectedRows = [],
  onSelectionChange,
  rowKey = 'id',
  
  // Actions
  actions = [],
  
  // Styling
  className = '',
  compact = false,
  hoverable = true,
  striped = false,
  
  // Empty state
  emptyMessage = 'No data available',
  emptyIcon: EmptyIcon,
  
  // Export
  exportable = false,
  onExport
}: DataTableProps<T>) {
  const [localCurrentPage, setLocalCurrentPage] = useState(currentPage);
  const [localPageSize, setLocalPageSize] = useState(pageSize);
  const [localSelectedRows, setLocalSelectedRows] = useState<(string | number)[]>(selectedRows);

  // Use controlled or uncontrolled state
  const actualCurrentPage = onPageChange ? currentPage : localCurrentPage;
  const actualPageSize = onPageSizeChange ? pageSize : localPageSize;
  const actualSelectedRows = onSelectionChange ? selectedRows : localSelectedRows;
  
  // Calculate pagination
  const actualTotalItems = totalItems || data.length;
  const totalPages = Math.ceil(actualTotalItems / actualPageSize);
  const startItem = (actualCurrentPage - 1) * actualPageSize + 1;
  const endItem = Math.min(actualCurrentPage * actualPageSize, actualTotalItems);
  
  // Get row key
  const getRowKey = (row: T, index: number): string | number => {
    if (typeof rowKey === 'function') {
      return rowKey(row);
    }
    return (row as any)[rowKey] || index;
  };
  
  // Handle sorting
  const handleSort = (column: Column<T>) => {
    if (!column.sortable || !sortable) return;
    
    const newOrder = sortBy === column.key && sortOrder === 'asc' ? 'desc' : 'asc';
    
    if (onSort) {
      onSort(column.key, newOrder);
    }
  };
  
  // Handle selection
  const handleSelectAll = (checked: boolean) => {
    const newSelected = checked ? data.map((row, index) => getRowKey(row, index)) : [];
    
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    } else {
      setLocalSelectedRows(newSelected);
    }
  };
  
  const handleSelectRow = (rowKey: string | number, checked: boolean) => {
    const newSelected = checked
      ? [...actualSelectedRows, rowKey]
      : actualSelectedRows.filter(key => key !== rowKey);
    
    if (onSelectionChange) {
      onSelectionChange(newSelected);
    } else {
      setLocalSelectedRows(newSelected);
    }
  };
  
  // Handle pagination
  const handlePageChange = (page: number) => {
    if (onPageChange) {
      onPageChange(page);
    } else {
      setLocalCurrentPage(page);
    }
  };
  
  const handlePageSizeChange = (newPageSize: number) => {
    if (onPageSizeChange) {
      onPageSizeChange(newPageSize);
    } else {
      setLocalPageSize(newPageSize);
      setLocalCurrentPage(1); // Reset to first page
    }
  };
  
  // Get cell value
  const getCellValue = (row: T, column: Column<T>) => {
    if (column.accessor) {
      if (typeof column.accessor === 'function') {
        return column.accessor(row);
      }
      return (row as any)[column.accessor];
    }
    return (row as any)[column.key];
  };
  
  // Get selected row data
  const selectedRowData = useMemo(() => {
    return data.filter((row, index) => 
      actualSelectedRows.includes(getRowKey(row, index))
    );
  }, [data, actualSelectedRows]);
  
  // Loading skeleton
  const renderSkeleton = () => (
    <div className="animate-pulse">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && <th className="w-12 px-6 py-3"><div className="h-4 w-4 bg-gray-300 rounded"></div></th>}
              {columns.map((column, index) => (
                <th key={index} className="px-6 py-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {Array.from({ length: actualPageSize }).map((_, index) => (
              <tr key={index}>
                {selectable && <td className="w-12 px-6 py-4"><div className="h-4 w-4 bg-gray-200 rounded"></div></td>}
                {columns.map((column, colIndex) => (
                  <td key={colIndex} className="px-6 py-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
  
  // Error state
  const renderError = () => (
    <div className="text-center py-12">
      <div className="text-red-500 mb-4">
        <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-lg font-medium text-red-900 mb-2">Error Loading Data</h3>
      <p className="text-sm text-red-600">{error}</p>
    </div>
  );
  
  // Empty state
  const renderEmpty = () => (
    <div className="text-center py-12">
      <div className="text-gray-400 mb-4">
        {EmptyIcon ? (
          <EmptyIcon className="mx-auto h-12 w-12" />
        ) : (
          <svg className="mx-auto h-12 w-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2 2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
        )}
      </div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">No Data Available</h3>
      <p className="text-sm text-gray-500">{emptyMessage}</p>
    </div>
  );
  
  if (loading) return renderSkeleton();
  if (error) return renderError();
  if (!data.length) return renderEmpty();
  
  return (
    <div className={`bg-white shadow-sm rounded-lg border border-gray-200 ${className}`}>
      {/* Header with actions */}
      {(selectable && actualSelectedRows.length > 0) || exportable ? (
        <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {actualSelectedRows.length > 0 && (
                <span className="text-sm text-gray-700">
                  {actualSelectedRows.length} item{actualSelectedRows.length !== 1 ? 's' : ''} selected
                </span>
              )}
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={() => action.onClick(selectedRowData)}
                  disabled={action.disabled || actualSelectedRows.length === 0}
                  className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded-md ${
                    action.variant === 'danger' 
                      ? 'border-red-300 text-red-700 bg-red-50 hover:bg-red-100 disabled:opacity-50'
                      : action.variant === 'primary'
                      ? 'border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100 disabled:opacity-50'
                      : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50'
                  } disabled:cursor-not-allowed`}
                >
                  {action.icon && <action.icon className="h-3 w-3 mr-1" />}
                  {action.label}
                </button>
              ))}
            </div>
            {exportable && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => onExport?.('csv')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export CSV
                </button>
                <button
                  onClick={() => onExport?.('pdf')}
                  className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-3 w-3 mr-1" />
                  Export PDF
                </button>
              </div>
            )}
          </div>
        </div>
      ) : null}
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {selectable && (
                <th className="w-12 px-6 py-3">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    checked={actualSelectedRows.length === data.length && data.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                  />
                </th>
              )}
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                    column.sortable && sortable ? 'cursor-pointer hover:bg-gray-100' : ''
                  } ${column.headerClassName || ''}`}
                  style={{
                    width: column.width,
                    minWidth: column.minWidth
                  }}
                  onClick={() => handleSort(column)}
                >
                  <div className="flex items-center justify-between">
                    {column.headerRender ? column.headerRender() : column.header}
                    {column.sortable && sortable && (
                      <span className="ml-2 flex-none">
                        {sortBy === column.key ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="h-4 w-4" />
                          ) : (
                            <ChevronDown className="h-4 w-4" />
                          )
                        ) : (
                          <div className="h-4 w-4 opacity-0 group-hover:opacity-100">
                            <ChevronDown className="h-4 w-4" />
                          </div>
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className={`bg-white divide-y divide-gray-200 ${striped ? 'divide-y-0' : ''}`}>
            {data.map((row, index) => {
              const key = getRowKey(row, index);
              const isSelected = actualSelectedRows.includes(key);
              
              return (
                <tr
                  key={key}
                  className={`
                    ${striped && index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}
                    ${hoverable ? 'hover:bg-gray-50' : ''}
                    ${isSelected ? 'bg-blue-50' : ''}
                    ${compact ? 'text-sm' : ''}
                  `}
                >
                  {selectable && (
                    <td className="w-12 px-6 py-4">
                      <input
                        type="checkbox"
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        checked={isSelected}
                        onChange={(e) => handleSelectRow(key, e.target.checked)}
                      />
                    </td>
                  )}
                  {columns.map((column) => {
                    const value = getCellValue(row, column);
                    
                    return (
                      <td
                        key={column.key}
                        className={`px-6 ${compact ? 'py-2' : 'py-4'} whitespace-nowrap text-sm text-gray-900 ${column.className || ''}`}
                      >
                        {column.render ? column.render(value, row, index) : value}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      
      {/* Pagination */}
      {pagination && totalPages > 1 && (
        <div className="px-4 py-3 border-t border-gray-200 bg-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-700">
                Showing {startItem} to {endItem} of {actualTotalItems} results
              </span>
              <select
                value={actualPageSize}
                onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                className="ml-2 border border-gray-300 rounded-md text-sm py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              >
                {pageSizeOptions.map(option => (
                  <option key={option} value={option}>{option} per page</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-1">
              <button
                onClick={() => handlePageChange(1)}
                disabled={actualCurrentPage === 1}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(actualCurrentPage - 1)}
                disabled={actualCurrentPage === 1}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              
              {/* Page numbers */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const pageNum = Math.max(1, actualCurrentPage - 2) + i;
                if (pageNum > totalPages) return null;
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`px-3 py-1 rounded-md text-sm ${
                      pageNum === actualCurrentPage
                        ? 'bg-blue-500 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
              
              <button
                onClick={() => handlePageChange(actualCurrentPage + 1)}
                disabled={actualCurrentPage === totalPages}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => handlePageChange(totalPages)}
                disabled={actualCurrentPage === totalPages}
                className="p-2 rounded-md text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronsRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DataTable;