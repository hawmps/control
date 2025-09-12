import { useState } from 'react';
import { Save, RotateCcw } from 'lucide-react';
import { useToast } from '../components/ui';
import { getStatusConfig, DEFAULT_STATUSES, type StatusConfig } from '../utils/statusConfig';

export default function ManageStatus() {
  const [statuses, setStatuses] = useState<StatusConfig[]>(() => getStatusConfig());
  const [hasChanges, setHasChanges] = useState(false);
  const { success } = useToast();

  const handleStatusChange = (index: number, field: keyof StatusConfig, value: string) => {
    const updated = [...statuses];
    updated[index] = { ...updated[index], [field]: value };
    setStatuses(updated);
    setHasChanges(true);
  };

  const handleSave = () => {
    localStorage.setItem('statusConfig', JSON.stringify(statuses));
    setHasChanges(false);
    success('Status configuration saved successfully!');
  };

  const handleReset = () => {
    setStatuses(DEFAULT_STATUSES);
    setHasChanges(true);
  };

  const getColorClass = (color: string) => {
    switch (color) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      case 'gray': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (value: string) => {
    switch (value) {
      case 'green': return '●';
      case 'yellow': return '●';
      case 'red': return '●';
      case 'unknown': return '○';
      default: return '○';
    }
  };

  const getColorOptions = () => [
    { value: 'green', label: 'Green', class: 'bg-green-500' },
    { value: 'yellow', label: 'Yellow', class: 'bg-yellow-500' },
    { value: 'red', label: 'Red', class: 'bg-red-500' },
    { value: 'gray', label: 'Gray', class: 'bg-gray-300' },
    { value: 'blue', label: 'Blue', class: 'bg-blue-500' },
    { value: 'purple', label: 'Purple', class: 'bg-purple-500' },
    { value: 'orange', label: 'Orange', class: 'bg-orange-500' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Status</h1>
          <p className="text-gray-600">Customize status names, icons, and colors for control implementation tracking</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleReset}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset to Default
          </button>
          <button
            onClick={handleSave}
            disabled={!hasChanges}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center"
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </button>
        </div>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-yellow-400 text-lg">⚠️</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                You have unsaved changes. Remember to save your configuration before leaving this page.
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <h2 className="text-lg font-medium text-gray-900">Status Configuration</h2>
          <p className="text-sm text-gray-600 mt-1">
            Customize how status values appear throughout the application
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Preview
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Internal Value
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Display Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Color
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {statuses.map((status, index) => (
                <tr key={status.value} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center ${getColorClass(status.color)} text-white text-sm font-bold`}>
                        {getStatusIcon(status.value)}
                      </div>
                      <span className="text-sm font-medium text-gray-900">{status.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <code className="px-2 py-1 bg-gray-100 rounded text-xs text-gray-600">{status.value}</code>
                  </td>
                  <td className="px-6 py-4">
                    <input
                      type="text"
                      value={status.name}
                      onChange={(e) => handleStatusChange(index, 'name', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Status name"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={status.color}
                      onChange={(e) => handleStatusChange(index, 'color', e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {getColorOptions().map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-6 py-4">
                    <textarea
                      value={status.description}
                      onChange={(e) => handleStatusChange(index, 'description', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      rows={2}
                      placeholder="Description..."
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <span className="text-blue-400 text-lg">ℹ️</span>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">How it works</h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Changes only affect the display names and icons shown in the interface</li>
                <li>Internal values (green, yellow, red, unknown) remain the same for data consistency</li>
                <li>Settings are saved locally in your browser</li>
                <li>Use "Reset to Default" to restore original settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}