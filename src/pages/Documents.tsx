import { useState } from 'react';
import { FileText, Plus, Filter, Download } from 'lucide-react';
import { DataTable, SearchBar, useToast } from '../components/ui';

const mockDocuments = [
  {
    id: 1,
    title: 'User Manual v2.1',
    type: 'Manual',
    status: 'Published',
    created_at: '2024-01-15T10:30:00Z',
    created_by: 'John Doe'
  },
  {
    id: 2,
    title: 'Privacy Policy',
    type: 'Policy',
    status: 'Draft',
    created_at: '2024-01-16T14:20:00Z',
    created_by: 'Jane Smith'
  },
  {
    id: 3,
    title: 'Monthly Report Template',
    type: 'Template',
    status: 'Published',
    created_at: '2024-01-10T09:15:00Z',
    created_by: 'Mike Johnson'
  }
];

export default function Documents() {
  const [documents] = useState(mockDocuments);
  const [searchQuery, setSearchQuery] = useState('');
  const { success } = useToast();

  const filteredDocuments = documents.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    {
      key: 'title',
      header: 'Title',
      sortable: true,
      render: (_: any, doc: any) => (
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-gray-400 mr-3" />
          <div>
            <div className="font-medium text-gray-900">{doc.title}</div>
            <div className="text-sm text-gray-500">Created by {doc.created_by}</div>
          </div>
        </div>
      )
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (value: string) => (
        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
          {value}
        </span>
      )
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (value: string) => (
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
          value === 'Published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
        }`}>
          {value}
        </span>
      )
    },
    {
      key: 'created_at',
      header: 'Created',
      sortable: true,
      render: (value: string) => new Date(value).toLocaleDateString()
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Documents</h1>
          <p className="text-gray-600">Manage your documents and files</p>
        </div>
        <button onClick={() => success('Add Document', { title: 'Feature' })} className="btn-primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </button>
      </div>

      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <SearchBar
            value={searchQuery}
            onSearch={setSearchQuery}
            placeholder="Search documents..."
            className="max-w-md"
          />
        </div>
        <div className="flex items-center space-x-2">
          <button className="btn-secondary">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </button>
          <button className="btn-secondary">
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
        </div>
      </div>

      <div className="card">
        <DataTable
          data={filteredDocuments}
          columns={columns}
          loading={false}
          pageSize={10}
          className="border-0 shadow-none"
        />
      </div>
    </div>
  );
}