import React, { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react';
import { Modal, DataTable } from './';
import { getSubControlsByControl, createSubControl, updateSubControl, deleteSubControl } from '../../services/securityData';
import type { SubControl, SecurityControl, Column } from '../../types';

interface SubControlModalProps {
  isOpen: boolean;
  onClose: () => void;
  control: SecurityControl;
}

interface SubControlWithActions extends SubControl {
  isEditing?: boolean;
}

export function SubControlModal({ isOpen, onClose, control }: SubControlModalProps) {
  const [subControls, setSubControls] = useState<SubControlWithActions[]>([]);
  const [loading, setLoading] = useState(false);
  const [, setEditingId] = useState<number | null>(null);
  const [newSubControl, setNewSubControl] = useState({ name: '', description: '' });
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [error, setError] = useState<string | null>(null);


  const loadSubControls = async () => {
    if (!isOpen || !control.id) return;

    try {
      setLoading(true);
      setError(null);
      const data = await getSubControlsByControl(control.id);
      setSubControls(data.map(sc => ({ ...sc, isEditing: false })));
    } catch (err) {
      setError('Failed to load sub-controls');
      console.error('Error loading sub-controls:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubControls();
  }, [isOpen, control.id]);

  const handleEdit = (id: number) => {
    setEditingId(id);
    setSubControls(prev => prev.map(sc => ({ ...sc, isEditing: sc.id === id })));
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setSubControls(prev => prev.map(sc => ({ ...sc, isEditing: false })));
  };

  const handleSaveEdit = async (id: number, name: string, description: string) => {
    try {
      await updateSubControl(id, { name, description, updated_at: new Date().toISOString() });
      setEditingId(null);
      await loadSubControls();
    } catch (err) {
      setError('Failed to update sub-control');
      console.error('Error updating sub-control:', err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this sub-control?')) return;

    try {
      await deleteSubControl(id);
      await loadSubControls();
    } catch (err) {
      setError('Failed to delete sub-control');
      console.error('Error deleting sub-control:', err);
    }
  };

  const handleAddNew = async () => {
    if (!newSubControl.name.trim()) return;

    try {
      await createSubControl({
        control_id: control.id,
        name: newSubControl.name,
        description: newSubControl.description
      });
      setNewSubControl({ name: '', description: '' });
      setIsAddingNew(false);
      await loadSubControls();
    } catch (err) {
      setError('Failed to create sub-control');
      console.error('Error creating sub-control:', err);
    }
  };

  const columns: Column<SubControlWithActions>[] = [
    {
      key: 'name',
      header: 'Name',
      sortable: true,
      render: (value, row) => {
        if (row?.isEditing) {
          return <EditableCell
            value={value}
            onSave={(newValue) => handleSaveEdit(row.id, newValue, row.description || '')}
            onCancel={() => handleCancelEdit()}
            description={row.description || ''}
          />;
        }
        return <span className="font-medium text-gray-900">{value}</span>;
      }
    },
    {
      key: 'description',
      header: 'Description',
      render: (value, row) => {
        if (row?.isEditing) {
          return null; // Description is handled in the name cell for editing
        }
        return <span className="text-gray-600">{value || 'No description'}</span>;
      }
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (_, row) => {
        if (row?.isEditing) {
          return null; // Actions are handled in the name cell for editing
        }
        return (
          <div className="flex space-x-2">
            <button
              onClick={() => handleEdit(row?.id || 0)}
              className="text-blue-600 hover:text-blue-800"
              title="Edit sub-control"
            >
              <Edit2 className="h-4 w-4" />
            </button>
            <button
              onClick={() => handleDelete(row?.id || 0)}
              className="text-red-600 hover:text-red-800"
              title="Delete sub-control"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        );
      }
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Sub-Controls for ${control.name}`}
      size="xl"
    >
      <div className="space-y-4">
        {/* Control description */}
        {control.description && (
          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-sm text-gray-600">{control.description}</p>
          </div>
        )}

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-3">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}

        {/* Add new sub-control form */}
        <div className="border-b border-gray-200 pb-4">
          {!isAddingNew ? (
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              <span>Add Sub-Control</span>
            </button>
          ) : (
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  value={newSubControl.name}
                  onChange={(e) => setNewSubControl({ ...newSubControl, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter sub-control name"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newSubControl.description}
                  onChange={(e) => setNewSubControl({ ...newSubControl, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter sub-control description"
                  rows={3}
                />
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleAddNew}
                  disabled={!newSubControl.name.trim()}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Save
                </button>
                <button
                  onClick={() => {
                    setIsAddingNew(false);
                    setNewSubControl({ name: '', description: '' });
                  }}
                  className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sub-controls table */}
        <div className="min-h-[300px]">
          <DataTable
            data={subControls}
            columns={columns}
            loading={loading}
            error={error}
            pagination={false}
          />
        </div>
      </div>
    </Modal>
  );
}

// Editable cell component for inline editing
interface EditableCellProps {
  value: string;
  description: string;
  onSave: (name: string) => void;
  onCancel: () => void;
}

function EditableCell({ value, description, onSave, onCancel }: EditableCellProps) {
  const [name, setName] = useState(value);
  const [desc, setDesc] = useState(description);

  const handleSave = () => {
    if (name.trim()) {
      onSave(name.trim());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <div className="space-y-2">
      <div>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          autoFocus
        />
      </div>
      <div>
        <textarea
          value={desc}
          onChange={(e) => setDesc(e.target.value)}
          onKeyDown={handleKeyDown}
          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={2}
          placeholder="Description"
        />
      </div>
      <div className="flex space-x-1">
        <button
          onClick={handleSave}
          className="p-1 text-green-600 hover:text-green-800"
          title="Save"
        >
          <Save className="h-3 w-3" />
        </button>
        <button
          onClick={onCancel}
          className="p-1 text-red-600 hover:text-red-800"
          title="Cancel"
        >
          <X className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
}

export default SubControlModal;