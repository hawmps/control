import { useState, useEffect } from 'react';
import { Plus, Shield, Edit, Trash2, Eye, Settings } from 'lucide-react';
import { DataTable, SearchBar, useToast, Modal, SubControlModal } from '../components/ui';
import { getSecurityControls, createSecurityControl, updateSecurityControl, deleteSecurityControl, getSubControlsByControl } from '../services/securityData';
import type { SecurityControl, Column, SubControl } from '../types';

export default function Controls() {
  const [controls, setControls] = useState<SecurityControl[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedControl, setSelectedControl] = useState<SecurityControl | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isSubControlModalOpen, setIsSubControlModalOpen] = useState(false);
  const { success } = useToast();

  useEffect(() => {
    const loadControls = async () => {
      try {
        setLoading(true);
        const data = await getSecurityControls();
        setControls(data);
      } catch (error) {
        console.error('Failed to load security controls:', error);
      } finally {
        setLoading(false);
      }
    };
    loadControls();
  }, []);

  const filteredControls = controls.filter(control => 
    control.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (control.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const handleEdit = (control: SecurityControl) => {
    setSelectedControl(control);
    setIsEditModalOpen(true);
  };

  const handleView = (control: SecurityControl) => {
    setSelectedControl(control);
    setIsViewModalOpen(true);
  };

  const handleManageSubControls = (control: SecurityControl) => {
    setSelectedControl(control);
    setIsSubControlModalOpen(true);
  };

  const handleDelete = async (control: SecurityControl) => {
    if (window.confirm(`Are you sure you want to delete control "${control.name}"?`)) {
      try {
        await deleteSecurityControl(control.id);
        setControls(controls.filter(c => c.id !== control.id));
        success(`Control "${control.name}" has been deleted`);
      } catch (error) {
        console.error('Failed to delete control:', error);
      }
    }
  };

  const columns: Column<SecurityControl>[] = [
    {
      key: 'name',
      header: 'Control Details',
      sortable: true,
      render: (_, control) => (
        <div className="flex items-center">
          <Shield className="w-8 h-8 text-green-500 mr-3" />
          <div>
            <div className="font-medium text-gray-900">{control.name}</div>
            <div className="text-sm text-gray-500">{control.description}</div>
          </div>
        </div>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (value) => new Date(value).toLocaleDateString()
    },
    {
      key: 'actions',
      header: 'Actions',
      sortable: false,
      render: (_, control) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(control)}
            className="p-1 text-gray-400 hover:text-blue-500"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleManageSubControls(control)}
            className="p-1 text-gray-400 hover:text-purple-500"
            title="Manage Sub-Controls"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(control)}
            className="p-1 text-gray-400 hover:text-yellow-500"
            title="Edit Control"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(control)}
            className="p-1 text-gray-400 hover:text-red-500"
            title="Delete Control"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  // Calculate statistics
  const totalControls = controls.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Controls</h1>
          <p className="text-gray-600">Manage your security control framework</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Control
        </button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <Shield className="w-8 h-8 text-blue-500" />
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Total Controls</p>
              <p className="text-2xl font-bold text-gray-900">{totalControls}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 font-bold text-sm">✓</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Active Controls</p>
              <p className="text-2xl font-bold text-gray-900">{totalControls}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-bold text-sm">≡</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">Categories</p>
              <p className="text-2xl font-bold text-gray-900">5</p>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
              <span className="text-purple-600 font-bold text-sm">⚡</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-500">In Matrix</p>
              <p className="text-2xl font-bold text-gray-900">{totalControls}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onSearch={setSearchQuery}
            placeholder="Search controls by name or description..."
            className="max-w-md"
          />
        </div>
      </div>

      <div className="card">
        <DataTable
          data={filteredControls}
          columns={columns}
          loading={loading}
          pageSize={10}
          className="border-0 shadow-none"
          emptyMessage="No security controls found. Create your first control to get started."
          emptyIcon={Shield}
        />
      </div>

      {/* Add Control Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Security Control"
      >
        <ControlForm
          onSave={async (controlData) => {
            try {
              const newControl = await createSecurityControl({
                ...controlData,
                created_by: 1
              });
              setControls([...controls, newControl]);
              setIsAddModalOpen(false);
              success(`Control "${newControl.name}" has been created`);
            } catch (error) {
              console.error('Failed to create control:', error);
            }
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Control Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Security Control"
      >
        {selectedControl && (
          <ControlForm
            initialData={selectedControl}
            onSave={async (controlData) => {
              if (!selectedControl) return;
              try {
                await updateSecurityControl(selectedControl.id, controlData);
                const updatedControl = {
                  ...selectedControl,
                  ...controlData,
                  updated_at: new Date().toISOString()
                };
                setControls(controls.map(c => c.id === selectedControl.id ? updatedControl : c));
                setIsEditModalOpen(false);
                success(`Control "${updatedControl.name}" has been updated`);
              } catch (error) {
                console.error('Failed to update control:', error);
              }
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>

      {/* View Control Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Control Details"
        size="lg"
      >
        {selectedControl && (
          <ControlDetails
            control={selectedControl}
            onClose={() => setIsViewModalOpen(false)}
          />
        )}
      </Modal>

      {/* Sub-Controls Management Modal */}
      {selectedControl && (
        <SubControlModal
          isOpen={isSubControlModalOpen}
          onClose={() => setIsSubControlModalOpen(false)}
          control={selectedControl}
        />
      )}
    </div>
  );
}

// Control Form Component
interface ControlFormProps {
  initialData?: Partial<SecurityControl>;
  onSave: (data: Omit<SecurityControl, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void;
  onCancel: () => void;
}

function ControlForm({ initialData, onSave, onCancel }: ControlFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      return;
    }
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Name *
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Enter control name"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
          placeholder="Enter control description"
        />
      </div>

      <div className="flex justify-end space-x-3 pt-4">
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
          {initialData ? 'Update' : 'Create'} Control
        </button>
      </div>
    </form>
  );
}

// Control Details Component
interface ControlDetailsProps {
  control: SecurityControl;
  onClose: () => void;
}

function ControlDetails({ control, onClose }: ControlDetailsProps) {
  const [subControls, setSubControls] = useState<SubControl[]>([]);
  const [loadingSubControls, setLoadingSubControls] = useState(true);

  useEffect(() => {
    const loadSubControls = async () => {
      try {
        setLoadingSubControls(true);
        const data = await getSubControlsByControl(control.id);
        setSubControls(data);
      } catch (error) {
        console.error('Failed to load sub-controls:', error);
        setSubControls([]);
      } finally {
        setLoadingSubControls(false);
      }
    };

    loadSubControls();
  }, [control.id]);

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Shield className="w-12 h-12 text-green-500 mr-4" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">{control.name}</h3>
          <p className="text-gray-600">{control.description}</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Metadata</h4>
        <dl className="space-y-2">
          <div>
            <dt className="text-sm font-medium text-gray-500">Created</dt>
            <dd className="text-sm text-gray-900">{new Date(control.created_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
            <dd className="text-sm text-gray-900">{new Date(control.updated_at).toLocaleString()}</dd>
          </div>
          <div>
            <dt className="text-sm font-medium text-gray-500">Sub-Controls</dt>
            <dd className="text-sm text-gray-900">{subControls.length} defined</dd>
          </div>
        </dl>
      </div>

      {/* Sub-controls list */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Sub-Controls</h4>
        {loadingSubControls ? (
          <div className="text-sm text-gray-500">Loading sub-controls...</div>
        ) : subControls.length > 0 ? (
          <div className="space-y-3">
            {subControls.map((subControl) => (
              <div key={subControl.id} className="bg-gray-50 rounded-lg p-3">
                <div className="font-medium text-sm text-gray-900">{subControl.name}</div>
                {subControl.description && (
                  <div className="text-xs text-gray-600 mt-1">{subControl.description}</div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-sm text-gray-500 italic">
            No sub-controls defined. Use the "Manage Sub-Controls" button to add some.
          </div>
        )}
      </div>

      <div className="flex justify-end pt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
        >
          Close
        </button>
      </div>
    </div>
  );
}