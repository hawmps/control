import { useState, useEffect } from 'react';
import { Plus, Package, Edit, Trash2, Eye } from 'lucide-react';
import { DataTable, SearchBar, useToast, Modal } from '../components/ui';
import { getEnvironments, createEnvironment, updateEnvironment, deleteEnvironment, createItem, updateItem, deleteItem } from '../services/securityData';
import type { Item, Environment, Column, CriticalityLevel } from '../types';

export default function EnvironmentsManagement() {
  const [environments, setEnvironments] = useState<Environment[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedEnvironment, setSelectedEnvironment] = useState<Environment | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const { success, error } = useToast();

  useEffect(() => {
    const loadEnvironments = async () => {
      try {
        setLoading(true);
        const data = await getEnvironments();
        setEnvironments(data);
      } catch (error) {
        console.error('Failed to load environments:', error);
      } finally {
        setLoading(false);
      }
    };
    loadEnvironments();
  }, []);

  const filteredEnvironments = environments.filter(environment => 
    environment.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (environment.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (environment.category?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
    (environment.owner?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)
  );

  const getCriticalityColor = (criticality: string) => {
    switch (criticality.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleEdit = (environment: Environment) => {
    setSelectedEnvironment(environment);
    setIsEditModalOpen(true);
  };

  const handleView = (environment: Environment) => {
    setSelectedEnvironment(environment);
    setIsViewModalOpen(true);
  };

  const handleDelete = async (environment: Environment) => {
    if (window.confirm(`Are you sure you want to delete "${environment.name}"?`)) {
      try {
        await deleteEnvironment(environment.id);
        setEnvironments(environments.filter(env => env.id !== environment.id));
        success(`Environment "${environment.name}" has been deleted`);
      } catch (error) {
        console.error('Failed to delete environment:', error);
      }
    }
  };

  const columns: Column<Environment>[] = [
    {
      key: 'name',
      header: 'Environment Details',
      sortable: true,
      render: (_, environment) => (
        <div className="flex items-center">
          <Package className="w-8 h-8 text-blue-500 mr-3" />
          <div>
            <div className="font-medium text-gray-900">{environment.name}</div>
            <div className="text-sm text-gray-500">{environment.description}</div>
            <div className="text-xs text-gray-400 mt-1">
              {environment.item_type} • {environment.category}
            </div>
          </div>
        </div>
      )
    },
    {
      key: 'owner',
      header: 'Owner',
      sortable: true,
      render: (value) => value ? (
        <span className="text-sm text-gray-700">{value}</span>
      ) : '-'
    },
    {
      key: 'criticality',
      header: 'Criticality',
      sortable: true,
      render: (value) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCriticalityColor(value)}`}>
          {value?.charAt(0).toUpperCase() + value?.slice(1)}
        </span>
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
      render: (_, item) => (
        <div className="flex items-center space-x-2">
          <button
            onClick={() => handleView(environment)}
            className="p-1 text-gray-400 hover:text-blue-500"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleEdit(environment)}
            className="p-1 text-gray-400 hover:text-yellow-500"
            title="Edit Environment"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleDelete(environment)}
            className="p-1 text-gray-400 hover:text-red-500"
            title="Delete Environment"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Environments Management</h1>
          <p className="text-gray-600">Create, edit, and manage your security environments</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)} 
          className="btn-primary"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Environment
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onSearch={setSearchQuery}
            placeholder="Search environments by name, description, category, or owner..."
            className="max-w-md"
          />
        </div>
      </div>

      <div className="card">
        <DataTable
          data={filteredEnvironments}
          columns={columns}
          loading={loading}
          pageSize={10}
          className="border-0 shadow-none"
          emptyMessage="No environments found. Create your first environment to get started."
          emptyIcon={Package}
        />
      </div>

      {/* Add Item Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Environment"
      >
        <EnvironmentForm
          onSave={async (environmentData) => {
            try {
              const newEnvironment = await createEnvironment({
                ...environmentData,
                created_by: 1
              });
              setEnvironments([...environments, newEnvironment]);
              setIsAddModalOpen(false);
              success(`Environment "${newEnvironment.name}" has been created`);
            } catch (error) {
              console.error('Failed to create environment:', error);
            }
          }}
          onCancel={() => setIsAddModalOpen(false)}
        />
      </Modal>

      {/* Edit Item Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Environment"
      >
        {selectedEnvironment && (
          <EnvironmentForm
            initialData={selectedEnvironment}
            onSave={async (environmentData) => {
              if (!selectedEnvironment) return;
              try {
                await updateEnvironment(selectedEnvironment.id, environmentData);
                const updatedEnvironment = {
                  ...selectedEnvironment,
                  ...environmentData,
                  updated_at: new Date().toISOString()
                };
                setEnvironments(environments.map(env => env.id === selectedEnvironment.id ? updatedEnvironment : env));
                setIsEditModalOpen(false);
                success(`Environment "${updatedEnvironment.name}" has been updated`);
              } catch (error) {
                console.error('Failed to update environment:', error);
              }
            }}
            onCancel={() => setIsEditModalOpen(false)}
          />
        )}
      </Modal>

      {/* View Item Modal */}
      <Modal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="Environment Details"
      >
        {selectedEnvironment && (
          <EnvironmentDetails
            environment={selectedEnvironment}
            onClose={() => setIsViewModalOpen(false)}
          />
        )}
      </Modal>
    </div>
  );
}

// Environment Form Component
interface EnvironmentFormProps {
  initialData?: Partial<Environment>;
  onSave: (data: Omit<Environment, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void;
  onCancel: () => void;
}

function EnvironmentForm({ initialData, onSave, onCancel }: EnvironmentFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    category: initialData?.category || '',
    item_type: initialData?.item_type || '',
    owner: initialData?.owner || '',
    criticality: initialData?.criticality || 'medium' as CriticalityLevel
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
          placeholder="Enter environment name"
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
          placeholder="Enter environment description"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <input
            type="text"
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Web Application, Database"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <input
            type="text"
            value={formData.item_type}
            onChange={(e) => setFormData({ ...formData, item_type: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Application, System, Service"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Owner
          </label>
          <input
            type="text"
            value={formData.owner}
            onChange={(e) => setFormData({ ...formData, owner: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="e.g., Engineering Team, IT Department"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Criticality
          </label>
          <select
            value={formData.criticality}
            onChange={(e) => setFormData({ ...formData, criticality: e.target.value as CriticalityLevel })}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </select>
        </div>
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
          {initialData ? 'Update' : 'Create'} Environment
        </button>
      </div>
    </form>
  );
}

// Environment Details Component
interface EnvironmentDetailsProps {
  environment: Environment;
  onClose: () => void;
}

function EnvironmentDetails({ environment, onClose }: EnvironmentDetailsProps) {
  const getCriticalityColor = (criticality: string) => {
    switch (criticality.toLowerCase()) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center">
        <Package className="w-12 h-12 text-blue-500 mr-4" />
        <div>
          <h3 className="text-xl font-bold text-gray-900">{environment.name}</h3>
          <p className="text-gray-600">{environment.description}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Basic Information</h4>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Category</dt>
              <dd className="text-sm text-gray-900">{environment.category || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Type</dt>
              <dd className="text-sm text-gray-900">{environment.item_type || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Owner</dt>
              <dd className="text-sm text-gray-900">{environment.owner || '-'}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Criticality</dt>
              <dd>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getCriticalityColor(environment.criticality)}`}>
                  {environment.criticality?.charAt(0).toUpperCase() + environment.criticality?.slice(1)}
                </span>
              </dd>
            </div>
          </dl>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Metadata</h4>
          <dl className="space-y-2">
            <div>
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="text-sm text-gray-900">{new Date(environment.created_at).toLocaleString()}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
              <dd className="text-sm text-gray-900">{new Date(environment.updated_at).toLocaleString()}</dd>
            </div>
          </dl>
        </div>
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