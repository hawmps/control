import { useState, useEffect } from 'react';
import { Shield, Edit } from 'lucide-react';
import { SearchBar, useToast, Modal, Tooltip, SubControlStatusModal, Tags } from '../components/ui';
import { getControlMatrixData, updateControlImplementation, getSubControlsByControl, getSubControlImplementationsByItem } from '../services/securityData';
import { getStatusConfig, getStatusName } from '../utils/statusConfig';
import type { Item, Environment, SecurityControl, ControlStatus, SubControl, SubControlImplementation } from '../types';

interface EnvironmentWithControlStatuses extends Environment {
  controlStatuses: Record<number, { status: string; notes: string }>;
}

interface MatrixData {
  controls: SecurityControl[];
  environments: EnvironmentWithControlStatuses[];
}

export default function Items() {
  const [matrixData, setMatrixData] = useState<MatrixData>({ controls: [], environments: [] });
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedItemControl, setSelectedItemControl] = useState<{
    item: EnvironmentWithControlStatuses;
    control: SecurityControl;
    currentStatus: string;
    currentNotes: string;
  } | null>(null);
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EnvironmentWithControlStatuses | null>(null);
  const [isSubControlModalOpen, setIsSubControlModalOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState<SecurityControl | null>(null);
  const [subControlsTooltipData, setSubControlsTooltipData] = useState<{[key: string]: {subControls: SubControl[], implementations: SubControlImplementation[]}}>({});
  const { success } = useToast();
  const [statusConfig, setStatusConfig] = useState(getStatusConfig());

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const data = await getControlMatrixData();
        setMatrixData(data);

        // Load sub-control data for tooltips
        const tooltipData: {[key: string]: {subControls: SubControl[], implementations: SubControlImplementation[]}} = {};

        for (const control of data.controls) {
          for (const environment of data.environments) {
            const key = `${environment.id}-${control.id}`;
            try {
              const [subControls, implementations] = await Promise.all([
                getSubControlsByControl(control.id),
                getSubControlImplementationsByItem(environment.id, control.id)
              ]);
              tooltipData[key] = { subControls, implementations };
            } catch (error) {
              console.error(`Failed to load sub-control data for tooltip ${key}:`, error);
              tooltipData[key] = { subControls: [], implementations: [] };
            }
          }
        }

        setSubControlsTooltipData(tooltipData);
      } catch (error) {
        console.error('Failed to load matrix data:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Listen for status config changes when user navigates back from Manage Status page
  useEffect(() => {
    const handleFocus = () => {
      setStatusConfig(getStatusConfig());
    };
    
    window.addEventListener('focus', handleFocus);
    document.addEventListener('visibilitychange', handleFocus);
    
    return () => {
      window.removeEventListener('focus', handleFocus);
      document.removeEventListener('visibilitychange', handleFocus);
    };
  }, []);

  const filteredEnvironments = (matrixData.environments || []).filter(environment =>
    environment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (environment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (environment.category?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (environment.owner?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (environment.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ?? false)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      case 'gray': return 'bg-gray-500';
      case 'unknown': return 'bg-gray-300';
      default: return 'bg-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'green': return '●';
      case 'yellow': return '●';
      case 'red': return '●';
      case 'gray': return '●';
      case 'unknown': return '○';
      default: return '○';
    }
  };

  const getStatusDisplayName = (status: string) => {
    switch (status) {
      case 'green': return 'Implemented';
      case 'yellow': return 'In Progress';
      case 'red': return 'Not Implemented';
      case 'gray': return 'Not Applicable';
      default: return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };


  const handleStatusClick = (item: EnvironmentWithControlStatuses, control: SecurityControl) => {
    // Show Environment Details modal when clicking on status indicator
    setSelectedItem(item);
    setIsItemModalOpen(true);

    // Store the control info for potential status editing within the Environment Details
    setSelectedItemControl({
      item,
      control,
      currentStatus: item.controlStatuses[control.id].status,
      currentNotes: item.controlStatuses[control.id].notes
    });
    setSelectedControl(control);
  };


  const handleEnvironmentClick = (environment: EnvironmentWithControlStatuses) => {
    setSelectedItem(environment);
    setIsItemModalOpen(true);
  };

  const handleEnvironmentUpdate = (updatedEnvironment: EnvironmentWithControlStatuses) => {
    // Update the main matrix data
    const updatedEnvironments = (matrixData.environments || []).map(environment =>
      environment.id === updatedEnvironment.id ? updatedEnvironment : environment
    );

    setMatrixData({
      ...matrixData,
      environments: updatedEnvironments
    });
  };

  const handleControlStatusUpdate = (itemId: number, controlId: number, newStatus: string, newNotes: string) => {
    // Update the matrix data with the new control status
    const updatedEnvironments = (matrixData.environments || []).map(environment => {
      if (environment.id === itemId) {
        return {
          ...environment,
          controlStatuses: {
            ...environment.controlStatuses,
            [controlId]: {
              status: newStatus,
              notes: newNotes
            }
          }
        };
      }
      return environment;
    });

    setMatrixData({
      ...matrixData,
      environments: updatedEnvironments
    });
  };

  const handleOpenSubControlModal = (control: SecurityControl, item: EnvironmentWithControlStatuses) => {
    // Close the Environment Details modal
    setIsItemModalOpen(false);

    // Set up the SubControlStatusModal
    setSelectedItemControl({
      item,
      control,
      currentStatus: item.controlStatuses[control.id]?.status || 'red',
      currentNotes: item.controlStatuses[control.id]?.notes || ''
    });
    setSelectedControl(control);
    setIsSubControlModalOpen(true);
  };


  // Calculate overall statistics
  const totalEnvironments = (matrixData.environments || []).length;
  const totalControls = (matrixData.controls || []).length;
  let greenCount = 0, yellowCount = 0, redCount = 0, unknownCount = 0;
  
  (matrixData.environments || []).forEach(environment => {
    Object.values(environment.controlStatuses || {}).forEach(controlStatus => {
      if (controlStatus.status === 'green') greenCount++;
      else if (controlStatus.status === 'yellow') yellowCount++;
      else if (controlStatus.status === 'red') redCount++;
      else unknownCount++;
    });
  });

  const highRiskEnvironments = (matrixData.environments || []).filter(environment =>
    environment.criticality === 'critical' || environment.criticality === 'high'
  ).length;

  // Generate tooltip content with sub-control status
  const generateTooltipContent = (environment: EnvironmentWithControlStatuses, control: SecurityControl) => {
    const controlStatus = environment.controlStatuses[control.id];
    const key = `${environment.id}-${control.id}`;
    const subControlData = subControlsTooltipData[key];

    let tooltip = `${control.name}: ${controlStatus.notes || 'No notes'}`;

    if (subControlData && subControlData.subControls.length > 0) {
      const subControlStatuses = subControlData.subControls.map(subControl => {
        const implementation = subControlData.implementations.find(
          impl => impl.sub_control_id === subControl.id
        );
        const status = implementation?.status || 'red';
        const statusEmoji = status === 'green' ? '✅' : status === 'yellow' ? '⚠️' : '❌';
        return `${statusEmoji} ${subControl.name}`;
      });

      tooltip += `\n\nSub-Controls:\n${subControlStatuses.join('\n')}`;
    }

    tooltip += '\n\nClick to view details';
    return tooltip;
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Security Control Status</h1>
        <p className="text-gray-600">Monitor security control implementation across all environments</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-lg">●</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">{getStatusName('green')}</p>
              <p className="text-2xl font-bold text-gray-900">{greenCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
              <span className="text-yellow-600 text-lg">●</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">{getStatusName('yellow')}</p>
              <p className="text-2xl font-bold text-gray-900">{yellowCount}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span className="text-red-600 text-lg">●</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">{getStatusName('red')}</p>
              <p className="text-2xl font-bold text-gray-900">{redCount}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
              <span className="text-gray-600 text-lg">○</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">{getStatusName('unknown')}</p>
              <p className="text-2xl font-bold text-gray-900">{unknownCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Status Legend</h3>
        <div className="flex space-x-6 text-sm">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>
            <span>Green - {getStatusName('green')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-yellow-500 rounded-full mr-2"></div>
            <span>Yellow - {getStatusName('yellow')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-red-500 rounded-full mr-2"></div>
            <span>Red - {getStatusName('red')}</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
            <span>Gray - {getStatusName('unknown')}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onSearch={setSearchQuery}
            placeholder="Search environments by name, description, category, owner, or tags..."
            className="max-w-md"
          />
        </div>
      </div>

      {/* Control Matrix Table */}
      <div className="card">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading security controls...</span>
          </div>
        )}
        
        {!loading && filteredEnvironments.length === 0 && (
          <div className="text-center py-12">
            <Shield className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No environments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              Create your first environment to get started with security control tracking.
            </p>
          </div>
        )}
        
        {!loading && filteredEnvironments.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-gray-50">
                <tr className="border-b border-gray-200">
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-900 sticky left-0 bg-gray-50 border-r border-gray-200 z-10 shadow-sm">
                    <div className="min-w-[200px]">Environment</div>
                  </th>
                  {(matrixData.controls || []).map((control) => (
                    <th key={control.id} className="px-4 py-4 text-center text-sm font-medium text-gray-900 border-r border-gray-200">
                      <Tooltip
                        content={control.description || control.name}
                        position="bottom"
                        className="min-w-[140px] whitespace-normal leading-tight cursor-help"
                      >
                        <div>
                          {control.name}
                        </div>
                      </Tooltip>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredEnvironments.map((environment) => (
                  <tr key={environment.id} className="hover:bg-gray-50">
                    <td 
                      className="px-6 py-4 sticky left-0 bg-white hover:bg-gray-50 border-r border-gray-200 z-10 shadow-sm cursor-pointer"
                      onClick={() => handleEnvironmentClick(environment)}
                    >
                      <div className="min-w-[200px]">
                        <div className="text-sm font-medium text-gray-900 truncate">{environment.name}</div>
                        <div className="text-xs text-gray-500 truncate">{environment.description}</div>
                      </div>
                    </td>
                    {(matrixData.controls || []).map((control) => {
                      const controlStatus = environment.controlStatuses[control.id];
                      return (
                        <td key={control.id} className="px-4 py-4 text-center border-r border-gray-200">
                          <div className="min-w-[140px] flex justify-center">
                            <div
                              className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-white font-bold text-sm cursor-pointer hover:scale-110 transition-transform ${getStatusColor(controlStatus.status)}`}
                              title={generateTooltipContent(environment, control)}
                              onClick={() => handleStatusClick(environment, control)}
                            >
                              {getStatusIcon(controlStatus.status)}
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>


      {/* Environment Details Modal */}
      <Modal
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title="Environment Details"
        size="xl"
      >
        {selectedItem && (
          <ItemDetailsView
            item={selectedItem}
            controls={matrixData.controls || []}
            onClose={() => setIsItemModalOpen(false)}
            onItemUpdate={handleEnvironmentUpdate}
            onOpenSubControlModal={handleOpenSubControlModal}
            highlightedControl={selectedItemControl?.control}
            getStatusColor={getStatusColor}
            getStatusDisplayName={getStatusDisplayName}
          />
        )}
      </Modal>

      {/* Sub-Controls Status Modal */}
      {selectedControl && selectedItemControl && (
        <SubControlStatusModal
          isOpen={isSubControlModalOpen}
          onClose={() => {
            setIsSubControlModalOpen(false);
            // Reopen the Environment Details modal when SubControlStatusModal closes
            setIsItemModalOpen(true);
          }}
          control={selectedControl}
          item={selectedItemControl.item}
          controlStatus={selectedItemControl.currentStatus}
          controlNotes={selectedItemControl.currentNotes}
          onControlStatusUpdate={handleControlStatusUpdate}
        />
      )}
    </div>
  );
}

// Status Edit Form Component
interface StatusEditFormProps {
  item: EnvironmentWithControlStatuses;
  control: SecurityControl;
  currentStatus: string;
  currentNotes: string;
  onSave: (status: string, notes: string) => void;
  onCancel: () => void;
  getStatusColor: (status: string) => string;
}

function StatusEditForm({ item, control, currentStatus, currentNotes, onSave, onCancel, getStatusColor }: StatusEditFormProps) {
  const [status, setStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(currentNotes);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(status, notes);
  };

  const statusConfig = getStatusConfig();
  const statusOptions = statusConfig.map(status => ({
    value: status.value,
    label: `${status.color.charAt(0).toUpperCase() + status.color.slice(1)} - ${status.name}`,
    description: status.description
  }));

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">
          {control.name} for {item.name}
        </h3>
        <p className="text-sm text-gray-600">
          {control.description}
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Status
        </label>
        <div className="space-y-3">
          {statusOptions.map((option) => (
            <div
              key={option.value}
              className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                status === option.value 
                  ? 'border-blue-500 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setStatus(option.value)}
            >
              <div className="flex items-center">
                <div className={`w-4 h-4 rounded-full mr-3 ${getStatusColor(option.value)}`}></div>
                <div>
                  <div className="text-sm font-medium text-gray-900">{option.label}</div>
                  <div className="text-xs text-gray-500">{option.description}</div>
                </div>
                <div className="ml-auto">
                  <input
                    type="radio"
                    name="status"
                    value={option.value}
                    checked={status === option.value}
                    onChange={(e) => setStatus(e.target.value)}
                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={4}
          placeholder="Add notes about the implementation status, issues, or next steps..."
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4 border-t">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        >
          Save Changes
        </button>
      </div>
    </form>
  );
}

// Item Details View Component
interface ItemDetailsViewProps {
  item: EnvironmentWithControlStatuses;
  controls: SecurityControl[];
  onClose: () => void;
  onItemUpdate: (updatedItem: EnvironmentWithControlStatuses) => void;
  onOpenSubControlModal: (control: SecurityControl, item: EnvironmentWithControlStatuses) => void;
  highlightedControl?: SecurityControl;
  getStatusColor: (status: string) => string;
  getStatusDisplayName: (status: string) => string;
}

function ItemDetailsView({ item, controls, onClose, onItemUpdate, onOpenSubControlModal, highlightedControl, getStatusColor, getStatusDisplayName }: ItemDetailsViewProps) {
  const [editingNotes, setEditingNotes] = useState<{[key: string]: string}>({});
  const [localItem, setLocalItem] = useState(item);
  const [subControlsData, setSubControlsData] = useState<{[controlId: number]: {subControls: SubControl[], implementations: SubControlImplementation[]}}>({});
  const [editingMasterControl, setEditingMasterControl] = useState<{controlId: number, status: string, notes: string} | null>(null);
  const { success } = useToast();

  // Update localItem when the parent item prop changes
  useEffect(() => {
    setLocalItem(item);
  }, [item]);

  // Load sub-control data for all controls
  useEffect(() => {
    const loadSubControlData = async () => {
      const subControlsMap: {[controlId: number]: {subControls: SubControl[], implementations: SubControlImplementation[]}} = {};

      for (const control of controls) {
        try {
          const [subControls, implementations] = await Promise.all([
            getSubControlsByControl(control.id),
            getSubControlImplementationsByItem(item.id, control.id)
          ]);

          subControlsMap[control.id] = {
            subControls,
            implementations
          };
        } catch (error) {
          console.error(`Failed to load sub-control data for control ${control.id}:`, error);
          subControlsMap[control.id] = {
            subControls: [],
            implementations: []
          };
        }
      }

      setSubControlsData(subControlsMap);
    };

    if (controls.length > 0 && item.id) {
      loadSubControlData();
    }
  }, [controls, item.id]);

  const getCriticalityColor = (criticality: string) => {
    switch (criticality) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const handleControlStatusUpdate = (itemId: number, controlId: number, newStatus: string, newNotes: string) => {
    // Update local state
    const updatedItem = {
      ...localItem,
      controlStatuses: {
        ...localItem.controlStatuses,
        [controlId]: {
          status: newStatus,
          notes: newNotes
        }
      }
    };

    setLocalItem(updatedItem);
    onItemUpdate(updatedItem);
  };

  const handleEditMasterControl = (controlId: number, currentStatus: string, currentNotes: string) => {
    setEditingMasterControl({ controlId, status: currentStatus, notes: currentNotes });
  };

  const handleSaveMasterControl = async () => {
    if (!editingMasterControl) return;

    try {
      await updateControlImplementation(
        localItem.id,
        editingMasterControl.controlId,
        editingMasterControl.status,
        editingMasterControl.notes
      );

      // Update local state
      const updatedItem = {
        ...localItem,
        controlStatuses: {
          ...localItem.controlStatuses,
          [editingMasterControl.controlId]: {
            status: editingMasterControl.status,
            notes: editingMasterControl.notes
          }
        }
      };

      setLocalItem(updatedItem);
      onItemUpdate(updatedItem);
      handleControlStatusUpdate(localItem.id, editingMasterControl.controlId, editingMasterControl.status, editingMasterControl.notes);
      setEditingMasterControl(null);
      success('Master control status updated successfully');
    } catch (error) {
      console.error('Failed to update master control:', error);
    }
  };

  const handleCancelMasterControlEdit = () => {
    setEditingMasterControl(null);
  };

  return (
    <div className="space-y-6">
      {/* Item Header */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{item.name}</h2>
            <p className="text-gray-600 mb-4">{item.description}</p>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <span className="text-sm font-medium text-gray-500">Criticality:</span>
                <span className={`ml-2 px-2 py-1 text-xs font-medium rounded-full ${getCriticalityColor(item.criticality)}`}>
                  {item.criticality?.charAt(0).toUpperCase() + item.criticality?.slice(1) || 'Unknown'}
                </span>
              </div>
              
              {item.category && (
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-500">Category:</span>
                  <span className="ml-2 text-sm text-gray-900">{item.category}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Item Properties */}
      <div className="space-y-6">
        {/* Control Status Summary - moved to top */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Control Status Summary</h3>

          {/* Highlighted Control - Show prominently if one was clicked */}
          {highlightedControl && localItem.controlStatuses[highlightedControl.id] && (() => {
            const status = localItem.controlStatuses[highlightedControl.id];
            const controlSubData = subControlsData[highlightedControl.id];
            const isEditingThisControl = editingMasterControl?.controlId === highlightedControl.id;

            return (
              <div className="mb-6">
                <h4 className="text-md font-medium text-gray-700 mb-3">Selected Control</h4>
                <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
                  {/* Master Control */}
                  <div className="mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-5 h-5 rounded-full ${
                            status.status === 'green' ? 'bg-green-500' :
                            status.status === 'yellow' ? 'bg-yellow-500' :
                            status.status === 'red' ? 'bg-red-500' :
                            'bg-gray-300'
                          }`}
                        ></div>
                        <div className="flex-1">
                          <span className="text-lg font-bold text-gray-900">
                            {highlightedControl?.name || `Control ${controlId}`}
                          </span>
                          {highlightedControl?.description && (
                            <div className="text-sm text-gray-600 mt-2">
                              {highlightedControl.description}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-1">
                        {/* Edit Master Control Button */}
                        <button
                          onClick={() => handleEditMasterControl(highlightedControl.id, status.status, status.notes)}
                          className="inline-flex items-center px-3 py-2 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                          title="Edit master control status"
                        >
                          Edit
                        </button>

                        {/* Edit Sub-Controls Button */}
                        {controlSubData && controlSubData.subControls.length > 0 && (
                          <button
                            onClick={() => {
                              onOpenSubControlModal(highlightedControl, localItem);
                            }}
                            className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            title="Edit sub-controls"
                          >
                            Sub-Controls
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Master Control Status Editing */}
                    {isEditingThisControl && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <div className="space-y-3">
                          {/* Status Selection */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                            <div className="flex space-x-2">
                              {(['green', 'yellow', 'red', 'gray'] as const).map((statusOption) => (
                                <button
                                  key={statusOption}
                                  onClick={() => setEditingMasterControl({ ...editingMasterControl, status: statusOption })}
                                  className={`
                                    inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors
                                    ${editingMasterControl.status === statusOption
                                      ? `${getStatusColor(statusOption)} text-white`
                                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                                  `}
                                >
                                  <div className={`w-2 h-2 rounded-full mr-1 ${
                                    editingMasterControl.status === statusOption
                                      ? 'bg-white'
                                      : getStatusColor(statusOption)
                                  }`} />
                                  {getStatusDisplayName(statusOption)}
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Notes */}
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                            <textarea
                              value={editingMasterControl.notes}
                              onChange={(e) => setEditingMasterControl({ ...editingMasterControl, notes: e.target.value })}
                              className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                              rows={2}
                              placeholder="Add notes about the implementation..."
                            />
                          </div>

                          {/* Save/Cancel buttons */}
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={handleCancelMasterControlEdit}
                              className="px-3 py-1 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveMasterControl}
                              className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                            >
                              Save
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Current Status Display */}
                    {!isEditingThisControl && (
                      <div className="mt-2 text-xs text-gray-600">
                        <strong>Status:</strong> {getStatusDisplayName(status.status)}
                        {status.notes && (
                          <div className="mt-1 text-gray-500 break-words">
                            <strong>Notes:</strong> {status.notes}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Sub-Controls */}
                  {controlSubData && controlSubData.subControls.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-gray-200">
                      <div className="text-xs font-medium text-gray-600 mb-2">Sub-Controls:</div>
                      <div className="space-y-2">
                        {controlSubData.subControls.map((subControl) => {
                          const implementation = controlSubData.implementations.find(
                            impl => impl.sub_control_id === subControl.id
                          );
                          const subStatus = implementation?.status || 'red';

                          return (
                            <div key={subControl.id} className="flex items-center space-x-2">
                              <div className={`w-3 h-3 rounded-full ${
                                subStatus === 'green' ? 'bg-green-500' :
                                subStatus === 'yellow' ? 'bg-yellow-500' :
                                subStatus === 'red' ? 'bg-red-500' :
                                'bg-gray-300'
                              }`}></div>
                              <span className="text-xs text-gray-700 flex-1">
                                {subControl.name}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

          {/* Remaining Controls Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(localItem.controlStatuses)
              .filter(([controlId]) => !highlightedControl || parseInt(controlId) !== highlightedControl.id)
              .map(([controlId, status]) => {
                const control = controls.find(c => c.id === parseInt(controlId));
                const controlSubData = subControlsData[parseInt(controlId)];
                const isEditingThisControl = editingMasterControl?.controlId === parseInt(controlId);

                return (
                  <div key={controlId} className="bg-gray-50 rounded-lg p-4">
                    {/* Master Control */}
                    <div className="mb-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-3">
                          <div
                            className={`w-5 h-5 rounded-full ${
                              status.status === 'green' ? 'bg-green-500' :
                              status.status === 'yellow' ? 'bg-yellow-500' :
                              status.status === 'red' ? 'bg-red-500' :
                              'bg-gray-300'
                            }`}
                          ></div>
                          <div className="flex-1">
                            <span className="text-sm font-bold text-gray-900">
                              {control?.name || `Control ${controlId}`}
                            </span>
                            {control?.description && (
                              <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {control.description}
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex space-x-1">
                          {/* Edit Master Control Button */}
                          <button
                            onClick={() => handleEditMasterControl(parseInt(controlId), status.status, status.notes)}
                            className="inline-flex items-center px-2 py-1 text-xs bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                            title="Edit master control status"
                          >
                            Edit
                          </button>

                          {/* Edit Sub-Controls Button */}
                          {controlSubData && controlSubData.subControls.length > 0 && (
                            <button
                              onClick={() => {
                                if (control) {
                                  onOpenSubControlModal(control, localItem);
                                }
                              }}
                              className="inline-flex items-center px-2 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                              title="Edit sub-controls"
                            >
                              Sub-Controls
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Master Control Status Editing */}
                      {isEditingThisControl && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <div className="space-y-3">
                            {/* Status Selection */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                              <div className="flex space-x-2">
                                {(['green', 'yellow', 'red', 'gray'] as const).map((statusOption) => (
                                  <button
                                    key={statusOption}
                                    onClick={() => setEditingMasterControl({ ...editingMasterControl, status: statusOption })}
                                    className={`
                                      inline-flex items-center px-3 py-1 rounded-md text-xs font-medium transition-colors
                                      ${editingMasterControl.status === statusOption
                                        ? `${getStatusColor(statusOption)} text-white`
                                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                                    `}
                                  >
                                    <div className={`w-2 h-2 rounded-full mr-1 ${
                                      editingMasterControl.status === statusOption
                                        ? 'bg-white'
                                        : getStatusColor(statusOption)
                                    }`} />
                                    {getStatusDisplayName(statusOption)}
                                  </button>
                                ))}
                              </div>
                            </div>

                            {/* Notes */}
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">Notes</label>
                              <textarea
                                value={editingMasterControl.notes}
                                onChange={(e) => setEditingMasterControl({ ...editingMasterControl, notes: e.target.value })}
                                className="w-full px-2 py-1 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-transparent"
                                rows={2}
                                placeholder="Add notes about the implementation..."
                              />
                            </div>

                            {/* Save/Cancel buttons */}
                            <div className="flex justify-end space-x-2">
                              <button
                                onClick={handleCancelMasterControlEdit}
                                className="px-3 py-1 text-xs border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                              >
                                Cancel
                              </button>
                              <button
                                onClick={handleSaveMasterControl}
                                className="px-3 py-1 text-xs bg-blue-600 text-white rounded-md hover:bg-blue-700"
                              >
                                Save
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Current Status Display */}
                      {!isEditingThisControl && (
                        <div className="mt-2 text-xs text-gray-600">
                          <strong>Status:</strong> {getStatusDisplayName(status.status)}
                          {status.notes && (
                            <div className="mt-1 text-gray-500 break-words">
                              <strong>Notes:</strong> {status.notes}
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Sub-Controls */}
                    {controlSubData && controlSubData.subControls.length > 0 && (
                      <div className="mt-3 pl-4 border-l-2 border-gray-200">
                        <div className="text-xs font-medium text-gray-600 mb-2">Sub-Controls:</div>
                        <div className="space-y-2">
                          {controlSubData.subControls.map((subControl) => {
                            const implementation = controlSubData.implementations.find(
                              impl => impl.sub_control_id === subControl.id
                            );
                            const subStatus = implementation?.status || 'red';

                            return (
                              <div key={subControl.id} className="flex items-center space-x-2">
                                <div className={`w-3 h-3 rounded-full ${
                                  subStatus === 'green' ? 'bg-green-500' :
                                  subStatus === 'yellow' ? 'bg-yellow-500' :
                                  subStatus === 'red' ? 'bg-red-500' :
                                  'bg-gray-300'
                                }`}></div>
                                <span className="text-xs text-gray-700 flex-1">
                                  {subControl.name}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
          </div>
        </div>

        {/* Environment Information - moved to bottom */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Environment Information</h3>

          {item.item_type && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Type:</span>
              <span className="text-sm text-gray-900">{item.item_type}</span>
            </div>
          )}

          {item.owner && (
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-500">Owner:</span>
              <span className="text-sm text-gray-900">{item.owner}</span>
            </div>
          )}

          <div className="py-2 border-b border-gray-100">
            <div className="text-sm font-medium text-gray-500 mb-2">Tags:</div>
            {item.tags && item.tags.length > 0 ? (
              <Tags tags={item.tags} onChange={() => {}} readOnly />
            ) : (
              <span className="text-sm text-gray-400">No tags assigned</span>
            )}
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">Created:</span>
            <span className="text-sm text-gray-900">{formatDate(item.created_at)}</span>
          </div>

          <div className="flex justify-between py-2 border-b border-gray-100">
            <span className="text-sm font-medium text-gray-500">Last Updated:</span>
            <span className="text-sm text-gray-900">{formatDate(item.updated_at)}</span>
          </div>
        </div>
      </div>

      {/* Close Button */}
      <div className="flex justify-end pt-6 border-t">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
        >
          Close
        </button>
      </div>

    </div>
  );
}