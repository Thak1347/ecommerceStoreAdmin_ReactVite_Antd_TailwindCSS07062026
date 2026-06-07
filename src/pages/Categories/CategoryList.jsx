import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Button, Space, Modal, message, Popconfirm, Tag, Image, Input, Select, Card } from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  SearchOutlined, 
  DownloadOutlined, 
  EyeOutlined,
  LeftOutlined,
  RightOutlined 
} from '@ant-design/icons';
import { fetchCategories, deleteCategory } from '../../store/slices/categorySlice';
import LoadingSpinner, { TableSkeleton } from '../../components/Common/LoadingSpinner';
import CategoryForm from './CategoryForm';

const { Option } = Select;

const CategoryList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { categories, pagination, isLoading } = useSelector((state) => state.categories);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [params, setParams] = useState({ page: 1, per_page: 10, search: '', active: null });
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    dispatch(fetchCategories(params));
  }, [dispatch, params]);

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Delete Category',
      content: 'Are you sure you want to delete this category? This action cannot be undone.',
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteCategory(id)).unwrap();
          message.success('Category deleted successfully');
          dispatch(fetchCategories(params));
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete category');
        }
      }
    });
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingCategory(null);
    dispatch(fetchCategories(params));
  };

  const handleSearch = (value) => {
    setParams({ ...params, search: value, page: 1 });
  };

  const handleStatusFilter = (value) => {
    setParams({ ...params, active: value === 'active' ? true : value === 'hidden' ? false : null, page: 1 });
  };

  const handleViewCategory = (id) => {
    navigate(`/categories/${id}`);
  };

  // Export to CSV function
  const exportToCSV = async () => {
    setExporting(true);
    try {
      // Fetch all categories without pagination for export
      const response = await dispatch(fetchCategories({ 
        ...params, 
        per_page: 10000, 
        page: 1 
      })).unwrap();
      
      const allCategories = response.data || categories;
      
      // Prepare data for CSV
      const csvData = allCategories.map(category => ({
        'ID': category.id,
        'Name': category.name,
        'Slug': category.slug,
        'Description': category.description || '',
        'Products Count': category.products_count || 0,
        'Status': category.active ? 'Active' : 'Hidden',
        'Image URL': category.image_url || '',
        'Created At': new Date(category.created_at).toLocaleString(),
        'Last Updated': new Date(category.updated_at).toLocaleString()
      }));

      // Convert to CSV
      const headers = Object.keys(csvData[0] || {});
      const csvRows = [];
      
      // Add headers
      csvRows.push(headers.join(','));
      
      // Add data rows
      for (const row of csvData) {
        const values = headers.map(header => {
          const value = row[header];
          // Escape quotes and wrap in quotes if contains comma
          const escaped = String(value).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
      }
      
      // Create and download file
      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `categories_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success(`Exported ${allCategories.length} categories successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export categories');
    } finally {
      setExporting(false);
    }
  };

  const columns = [
    {
      title: 'ICON',
      dataIndex: 'image_url',
      key: 'image',
      width: 80,
      render: (url) => (
        url ? (
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
            <Image src={url} width={40} height={40} className="object-cover" preview={false} />
          </div>
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-xs">No img</span>
          </div>
        )
      ),
    },
    {
      title: 'CATEGORY NAME',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <button 
          onClick={() => handleViewCategory(record.id)}
          className="font-semibold text-[15px] text-[#1b1c1c] hover:text-primary hover:underline cursor-pointer transition-colors"
        >
          {text}
        </button>
      ),
    },
    {
      title: 'SLUG',
      dataIndex: 'slug',
      key: 'slug',
      render: (text) => <code className="font-mono text-[13px] bg-gray-100 px-2 py-1 rounded text-primary">/{text}</code>,
    },
    {
      title: 'PRODUCTS',
      dataIndex: 'products_count',
      key: 'products_count',
      render: (count) => <span className="text-[14px] font-medium">{count || 0}</span>,
    },
    {
      title: 'STATUS',
      dataIndex: 'active',
      key: 'active',
      render: (active) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          active 
            ? 'bg-green-100 text-green-800 border border-green-300' 
            : 'bg-gray-100 text-gray-600 border border-gray-300'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${active ? 'bg-green-600' : 'bg-gray-500'}`}></span>
          {active ? 'Active' : 'Hidden'}
        </span>
      ),
    },
    {
      title: 'ACTIONS',
      key: 'actions',
      width: 120,
      align: 'right',
      render: (_, record) => (
        <div className="flex justify-end gap-2">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewCategory(record.id)}
            className="text-gray-500 hover:text-primary"
          />
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            className="text-gray-500 hover:text-primary"
          />
          <Popconfirm 
            title="Delete category?" 
            description="This action cannot be undone."
            onConfirm={() => handleDelete(record.id)} 
            okText="Yes" 
            cancelText="No"
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </div>
      ),
    },
  ];

  // Calculate pagination values
  const currentPage = pagination?.current || 1;
  const perPage = pagination?.per_page || 10;
  const totalItems = pagination?.total || 0;
  const totalPages = Math.ceil(totalItems / perPage);
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  // Show skeleton loader while loading
  if (isLoading && categories.length === 0) {
    return (
      <div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <TableSkeleton rows={5} columns={6} />
          <div className="p-4 border-t border-gray-200">
            <div className="h-8 w-full bg-gray-200 rounded animate-pulse"></div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div>
      {/* Page Header */}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1b1c1c] mb-1">Categories</h2>
          <p className="text-[14px] text-[#414755]">Manage your product categories, hierarchies, and visibility.</p>
        </div>
        <div className="flex gap-3">
          <Button 
            icon={<DownloadOutlined />}
            onClick={exportToCSV}
            loading={exporting}
            className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50"
          >
            {exporting ? 'Exporting...' : 'Export CSV'}
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => setModalVisible(true)}
            className="bg-primary shadow-md shadow-primary/10"
          >
            Add Category
          </Button>
        </div>
      </div>

      {/* Table Container */}
      <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between bg-white">
          <div className="flex items-center gap-3">
            <div className="relative w-64">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[20px] z-10" />
              <Input
                placeholder="Quick find..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={() => handleSearch(searchText)}
                className="pl-10"
                allowClear
              />
            </div>
            <Select
              placeholder="Status: All"
              allowClear
              className="min-w-[140px]"
              onChange={handleStatusFilter}
              value={statusFilter || undefined}
            >
              <Option value="active">Active</Option>
              <Option value="hidden">Hidden</Option>
            </Select>
          </div>
          <div className="text-xs text-[#414755]">
            Total: <span className="font-bold text-[#1b1c1c]">{totalItems} categories</span>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className="px-6 py-4 text-left text-xs font-semibold text-[#414755] uppercase tracking-wider"
                    style={{ textAlign: col.align === 'right' ? 'right' : 'left', width: col.width }}
                  >
                    {col.title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                    </div>
                  </td>
                </tr>
              ) : categories?.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-6 py-12 text-center text-gray-500">
                    No categories found
                  </td>
                </tr>
              ) : (
                categories?.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      {category.image_url ? (
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                          <img 
                            src={category.image_url} 
                            alt={category.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                          <span className="text-gray-400 text-xs text-center">No img</span>
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button 
                        onClick={() => handleViewCategory(category.id)}
                        className="font-semibold text-[15px] text-[#1b1c1c] hover:text-primary hover:underline cursor-pointer transition-colors"
                      >
                        {category.name}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <code className="font-mono text-[13px] bg-gray-100 px-2 py-1 rounded text-primary">
                        /{category.slug}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[14px]">{category.products_count || 0}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        category.active 
                          ? 'bg-green-100 text-green-800 border border-green-300' 
                          : 'bg-gray-100 text-gray-600 border border-gray-300'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${category.active ? 'bg-green-600' : 'bg-gray-500'}`}></span>
                        {category.active ? 'Active' : 'Hidden'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded transition-all"
                          onClick={() => handleViewCategory(category.id)}
                        >
                          <EyeOutlined className="text-[20px]" />
                        </button>
                        <button 
                          className="p-1.5 text-gray-500 hover:text-primary hover:bg-primary/5 rounded transition-all"
                          onClick={() => handleEdit(category)}
                        >
                          <EditOutlined className="text-[20px]" />
                        </button>
                        <Popconfirm 
                          title="Delete category?" 
                          description="This action cannot be undone."
                          onConfirm={() => handleDelete(category.id)} 
                          okText="Yes" 
                          cancelText="No"
                        >
                          <button className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded transition-all">
                            <DeleteOutlined className="text-[20px]" />
                          </button>
                        </Popconfirm>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-white border-t border-gray-200 flex items-center justify-between flex-wrap gap-4">
          <span className="text-xs text-[#414755]">
            Showing <span className="font-bold text-[#1b1c1c]">{startItem}</span> to{' '}
            <span className="font-bold text-[#1b1c1c]">{endItem}</span> of{' '}
            <span className="font-bold text-[#1b1c1c]">{totalItems}</span> entries
          </span>
          
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <button
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === 1}
              onClick={() => setParams({ ...params, page: currentPage - 1 })}
            >
              <LeftOutlined className="text-[12px]" />
            </button>
            
            {/* Page Numbers */}
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  className={`w-8 h-8 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${
                    currentPage === pageNum
                      ? 'bg-primary text-white'
                      : 'hover:bg-gray-50 text-[#414755]'
                  }`}
                  onClick={() => setParams({ ...params, page: pageNum })}
                >
                  {pageNum}
                </button>
              );
            })}
            
            {/* Next Button */}
            <button
              className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={currentPage === totalPages || totalPages === 0}
              onClick={() => setParams({ ...params, page: currentPage + 1 })}
            >
              <RightOutlined className="text-[12px]" />
            </button>
          </div>
        </div>
      </Card>

      {/* FAB for Quick Creation */}
      <div className="fixed bottom-8 right-8 z-50">
        <button
          onClick={() => setModalVisible(true)}
          className="group relative flex items-center justify-center w-14 h-14 bg-primary text-white rounded-full shadow-lg shadow-primary/30 hover:scale-105 active:scale-95 transition-all"
        >
          <PlusOutlined className="text-[28px]" />
          <span className="absolute right-16 bg-gray-800 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            Add Category
          </span>
        </button>
      </div>

      {/* Category Form Modal */}
      <CategoryForm
        visible={modalVisible}
        onClose={handleModalClose}
        editingCategory={editingCategory}
      />
    </div>
  );
};

export default CategoryList;