import React, { useState, useEffect } from 'react';
import { Edit2, Save, X } from 'lucide-react';
import { Modal } from './';
import {
  getSubControlsByControl,
  getSubControlImplementationsByItem,
  updateSubControlImplementation,
  updateControlImplementation
} from '../../services/securityData';
import type { SubControl, SecurityControl, Item } from '../../types';

interface SubControlStatusModalProps {
  isOpen: boolean;
  onClose: () => void;
  control: SecurityControl;
  item: Item;
  controlStatus: string;
  controlNotes: string;
  onControlStatusUpdate?: (itemId: number, controlId: number, newStatus: string, newNotes: string) => void;
}

interface SubControlWithImplementation extends SubControl {
  implementationStatus: 'green' | 'yellow' | 'red';
  implementationNotes: string;
  isEditingNotes?: boolean;
}

export function SubControlStatusModal({
  isOpen,
  onClose,
  control,
  item,
  controlStatus,
  controlNotes,
  onControlStatusUpdate
}: SubControlStatusModalProps) {
  const [subControls, setSubControls] = useState<SubControlWithImplementation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingNotes, setEditingNotes] = useState<{[key: number]: string}>({});
  const [masterControlStatus, setMasterControlStatus] = useState(controlStatus);
  const [masterControlNotes, setMasterControlNotes] = useState(controlNotes);
  const [isEditingMasterNotes, setIsEditingMasterNotes] = useState(false);
  const [tempMasterNotes, setTempMasterNotes] = useState(controlNotes);

  const loadSubControls = async () => {
    if (!isOpen || !control.id) return;

    try {
      setLoading(true);
      setError(null);

      // Get sub-controls for this control
      const subControlsData = await getSubControlsByControl(control.id);

      // Get existing implementations for this item and control
      const implementations = await getSubControlImplementationsByItem(item.id, control.id);

      // Combine sub-controls with their implementations
      const subControlsWithImplementations = subControlsData.map(subControl => {
        const impl = implementations.find(i => i.sub_control_id === subControl.id);
        return {
          ...subControl,
          implementationStatus: (impl?.status || 'red') as 'green' | 'yellow' | 'red',
          implementationNotes: impl?.notes || '',
          isEditingNotes: false
        };
      });

      setSubControls(subControlsWithImplementations);
    } catch (err) {
      setError('Failed to load sub-controls');
      console.error('Error loading sub-controls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubControls();
    // Reset master control state when modal opens
    setMasterControlStatus(controlStatus);
    setMasterControlNotes(controlNotes);
    setTempMasterNotes(controlNotes);
    setIsEditingMasterNotes(false);
  }, [isOpen, control.id, item.id, controlStatus, controlNotes]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'green': return 'bg-green-500';
      case 'yellow': return 'bg-yellow-500';
      case 'red': return 'bg-red-500';
      default: return 'bg-gray-300';
    }
  };

  const handleStatusChange = async (subControlId: number, newStatus: 'green' | 'yellow' | 'red') => {
    try {
      const subControl = subControls.find(sc => sc.id === subControlId);
      if (!subControl) return;

      // Update the sub-control implementation
      await updateSubControlImplementation(item.id, subControlId, newStatus, subControl.implementationNotes);

      // Update local state
      const updatedSubControls = subControls.map(sc =>
        sc.id === subControlId ? { ...sc, implementationStatus: newStatus } : sc
      );
      setSubControls(updatedSubControls);

      // Check if parent control should be updated based on sub-control statuses
      await updateParentControlStatus(updatedSubControls);
    } catch (error) {
      console.error('Failed to update sub-control status:', error);
    }
  };

  const updateParentControlStatus = async (updatedSubControls: SubControlWithImplementation[]) => {
    // If any sub-control is not green, parent cannot be green
    const hasNonGreen = updatedSubControls.some(sc => sc.implementationStatus !== 'green');

    if (masterControlStatus === 'green' && hasNonGreen) {
      // Downgrade parent control to yellow if it was green and now has non-green sub-controls
      try {
        const newNotes = `${masterControlNotes} (Downgraded due to sub-control status)`;
        await updateControlImplementation(item.id, control.id, 'yellow', newNotes);
        setMasterControlStatus('yellow');
        setMasterControlNotes(newNotes);
        setTempMasterNotes(newNotes);

        // Notify parent component of the change
        if (onControlStatusUpdate) {
          onControlStatusUpdate(item.id, control.id, 'yellow', newNotes);
        }
      } catch (error) {
        console.error('Failed to update parent control status:', error);
      }
    }
  };

  const handleMasterControlStatusChange = async (newStatus: 'green' | 'yellow' | 'red') => {
    // Check if trying to set to green when sub-controls aren't all green
    const hasNonGreen = subControls.some(sc => sc.implementationStatus !== 'green');

    if (newStatus === 'green' && hasNonGreen) {
      alert('Cannot set control to green when sub-controls are not all green. Please ensure all sub-controls are green first.');
      return;
    }

    try {
      await updateControlImplementation(item.id, control.id, newStatus, masterControlNotes);
      setMasterControlStatus(newStatus);

      // Notify parent component of the change
      if (onControlStatusUpdate) {
        onControlStatusUpdate(item.id, control.id, newStatus, masterControlNotes);
      }
    } catch (error) {
      console.error('Failed to update master control status:', error);
    }
  };

  const handleEditMasterNotes = () => {
    setTempMasterNotes(masterControlNotes);
    setIsEditingMasterNotes(true);
  };

  const handleSaveMasterNotes = async () => {
    try {
      await updateControlImplementation(item.id, control.id, masterControlStatus, tempMasterNotes);
      setMasterControlNotes(tempMasterNotes);
      setIsEditingMasterNotes(false);

      // Notify parent component of the change
      if (onControlStatusUpdate) {
        onControlStatusUpdate(item.id, control.id, masterControlStatus, tempMasterNotes);
      }
    } catch (error) {
      console.error('Failed to update master control notes:', error);
    }
  };

  const handleCancelMasterNotesEdit = () => {
    setTempMasterNotes(masterControlNotes);
    setIsEditingMasterNotes(false);
  };

  const handleEditNotes = (subControlId: number) => {
    const subControl = subControls.find(sc => sc.id === subControlId);
    if (!subControl) return;

    setEditingNotes({ ...editingNotes, [subControlId]: subControl.implementationNotes });
    setSubControls(subControls.map(sc =>
      sc.id === subControlId ? { ...sc, isEditingNotes: true } : sc
    ));
  };

  const handleSaveNotes = async (subControlId: number) => {
    try {
      const newNotes = editingNotes[subControlId] || '';
      const subControl = subControls.find(sc => sc.id === subControlId);
      if (!subControl) return;

      // Update the sub-control implementation
      await updateSubControlImplementation(item.id, subControlId, subControl.implementationStatus, newNotes);

      // Update local state
      setSubControls(subControls.map(sc =>
        sc.id === subControlId
          ? { ...sc, implementationNotes: newNotes, isEditingNotes: false }
          : sc
      ));

      // Clear editing state
      const newEditingNotes = { ...editingNotes };
      delete newEditingNotes[subControlId];
      setEditingNotes(newEditingNotes);
    } catch (error) {
      console.error('Failed to update sub-control notes:', error);
    }
  };

  const handleCancelEdit = (subControlId: number) => {
    setSubControls(subControls.map(sc =>
      sc.id === subControlId ? { ...sc, isEditingNotes: false } : sc
    ));

    const newEditingNotes = { ...editingNotes };
    delete newEditingNotes[subControlId];
    setEditingNotes(newEditingNotes);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${control.name} Sub-Controls for ${item.name}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Control and Item Summary */}
        <div className="bg-gray-50 rounded-lg p-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-gray-700">Control:</span>
              <span className="ml-2 text-gray-900">{control.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Item:</span>
              <span className="ml-2 text-gray-900">{item.name}</span>
            </div>
            <div>
              <span className="font-medium text-gray-700">Criticality:</span>
              <span className="ml-2 text-gray-900 capitalize">{item.criticality}</span>
            </div>
          </div>
        </div>

        {/* Master Control Status and Notes */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Master Control: {control.name}</h3>

          {/* Master Control Status */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">Master Control Status</label>
            <div className="flex space-x-2">
              {(['green', 'yellow', 'red'] as const).map((status) => {
                const hasNonGreen = subControls.some(sc => sc.implementationStatus !== 'green');
                const isDisabled = status === 'green' && hasNonGreen;

                return (
                  <button
                    key={status}
                    onClick={() => handleMasterControlStatusChange(status)}
                    disabled={isDisabled}
                    className={`
                      inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors
                      ${masterControlStatus === status
                        ? `${getStatusColor(status)} text-white`
                        : isDisabled
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                    title={isDisabled ? 'Cannot set to green when sub-controls are not all green' : ''}
                  >
                    <div className={`w-3 h-3 rounded-full mr-2 ${
                      masterControlStatus === status
                        ? 'bg-white'
                        : isDisabled
                          ? 'bg-gray-300'
                          : getStatusColor(status)
                    }`} />
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Master Control Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Master Control Notes</label>
            {isEditingMasterNotes ? (
              <div className="space-y-2">
                <textarea
                  value={tempMasterNotes}
                  onChange={(e) => setTempMasterNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Add master control notes..."
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleSaveMasterNotes}
                    className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                  >
                    <Save className="w-3 h-3 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancelMasterNotesEdit}
                    className="inline-flex items-center px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start">
                <div
                  className="flex-1 text-sm text-gray-600 bg-gray-50 rounded-md p-3 min-h-[2.5rem] cursor-pointer hover:bg-gray-100 transition-colors"
                  onClick={handleEditMasterNotes}
                >
                  {masterControlNotes || (
                    <span className="text-gray-400 italic">Click to add master control notes...</span>
                  )}
                </div>
                <button
                  onClick={handleEditMasterNotes}
                  className="ml-2 p-1 text-gray-400 hover:text-blue-500"
                  title="Edit notes"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Validation Warning */}
        <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
          <p className="text-sm text-amber-800">
            <strong>Note:</strong> The master control cannot be set to Green unless all sub-controls are Green.
            The Green button will be disabled until all sub-controls are Green.
          </p>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Sub-controls section */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Sub-Controls</h3>
          <div className="min-h-[300px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-3 text-gray-600">Loading sub-controls...</span>
            </div>
          ) : subControls.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No sub-controls defined for this control.</p>
              <p className="text-sm text-gray-400 mt-2">
                Sub-controls can be managed on the Security Controls Management page.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {subControls.map((subControl) => (
                <div key={subControl.id} className="bg-white border border-gray-200 rounded-lg p-4">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Left side - Name, Description, and Status */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-2">{subControl.name}</h4>

                      {/* Sub-control description */}
                      {subControl.description && (
                        <p className="text-sm text-gray-600 mb-3 leading-relaxed">
                          {subControl.description}
                        </p>
                      )}

                      {/* Status selector */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
                        <div className="flex space-x-2">
                          {(['green', 'yellow', 'red'] as const).map((status) => (
                            <button
                              key={status}
                              onClick={() => handleStatusChange(subControl.id, status)}
                              className={`
                                inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                                ${subControl.implementationStatus === status
                                  ? `${getStatusColor(status)} text-white`
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                              `}
                            >
                              <div className={`w-3 h-3 rounded-full mr-2 ${
                                subControl.implementationStatus === status
                                  ? 'bg-white'
                                  : getStatusColor(status)
                              }`} />
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Right side - Implementation notes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Implementation Notes</label>
                      {subControl.isEditingNotes ? (
                        <div className="space-y-2">
                          <textarea
                            value={editingNotes[subControl.id] || ''}
                            onChange={(e) => setEditingNotes({
                              ...editingNotes,
                              [subControl.id]: e.target.value
                            })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                            placeholder="Add implementation notes..."
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleSaveNotes(subControl.id)}
                              className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700"
                            >
                              <Save className="w-3 h-3 mr-1" />
                              Save
                            </button>
                            <button
                              onClick={() => handleCancelEdit(subControl.id)}
                              className="inline-flex items-center px-3 py-1 bg-gray-300 text-gray-700 text-sm rounded-md hover:bg-gray-400"
                            >
                              <X className="w-3 h-3 mr-1" />
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-start">
                          <div
                            className="flex-1 text-sm text-gray-600 bg-gray-50 rounded-md p-3 min-h-[2.5rem] cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => handleEditNotes(subControl.id)}
                          >
                            {subControl.implementationNotes || (
                              <span className="text-gray-400 italic">Click to add implementation notes...</span>
                            )}
                          </div>
                          <button
                            onClick={() => handleEditNotes(subControl.id)}
                            className="ml-2 p-1 text-gray-400 hover:text-blue-500"
                            title="Edit notes"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default SubControlStatusModal;