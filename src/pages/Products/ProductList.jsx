import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Button, Space, Modal, message, Popconfirm, Tag, Image, Input, Select, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined, EyeOutlined, DownloadOutlined } from '@ant-design/icons';
import { fetchProducts, deleteProduct } from '../../store/slices/productSlice';
import ProductForm from './ProductForm';
import API from '../../api/axios';
import { useNavigate } from 'react-router-dom';

const { Option } = Select;

const ProductList = () => {
  const dispatch = useDispatch();
  const { products, pagination, isLoading } = useSelector((state) => state.products);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [params, setParams] = useState({ 
    page: 1, 
    per_page: 10, 
    search: '', 
    category_id: null 
  });
  const [categories, setCategories] = useState([]);
  const [exporting, setExporting] = useState(false);
  const navigate = useNavigate();

  // Fetch categories for filter dropdown
  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    dispatch(fetchProducts(params));
  }, [dispatch, params]);

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      const categoriesData = response.data.data || response.data;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      setCategories([]);
    }
  };

  const handleDelete = async (id) => {
    try {
      await dispatch(deleteProduct(id)).unwrap();
      message.success('Product deleted successfully');
      dispatch(fetchProducts(params));
    } catch (error) {
      message.error('Failed to delete product');
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setModalVisible(true);
  };

  const handleAdd = () => {
    setEditingProduct(null);
    setModalVisible(true);
  };

  const handleModalClose = () => {
    setModalVisible(false);
    setEditingProduct(null);
    dispatch(fetchProducts(params));
  };

  // Export to CSV function
  const exportToCSV = async () => {
    setExporting(true);
    try {
      // Fetch all products without pagination for export
      const response = await dispatch(fetchProducts({ 
        ...params, 
        per_page: 10000, 
        page: 1 
      })).unwrap();
      
      const allProducts = response.data || products;
      
      // Prepare data for CSV
      const csvData = allProducts.map(product => ({
        'ID': product.id,
        'Name': product.name,
        'SKU': product.sku,
        'Category': product.category?.name || 'Uncategorized',
        'Price': product.price || 0,
        'Cost Price': product.cost_price || 0,
        'Stock Quantity': product.stock_qty || 0,
        'Status': product.active ? 'Active' : 'Inactive',
        'Description': product.description || '',
        'Image URL': product.image_url || '',
        'Created At': new Date(product.created_at).toLocaleString(),
        'Last Updated': new Date(product.updated_at).toLocaleString()
      }));

      // Convert to CSV
      const headers = Object.keys(csvData[0] || {});
      const csvRows = [];
      
      // Add headers
      csvRows.push(headers.join(','));
      
      // Add data rows
      for (const row of csvData) {
        const values = headers.map(header => {
          let value = row[header];
          // Format currency values
          if (['Price', 'Cost Price'].includes(header) && typeof value === 'number') {
            value = `$${value.toFixed(2)}`;
          }
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
      link.setAttribute('download', `products_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success(`Exported ${allProducts.length} products successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export products');
    } finally {
      setExporting(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { color: 'error', text: 'Out of Stock', status: 'error' };
    if (stock < 10) return { color: 'warning', text: 'Low Stock', status: 'warning' };
    return { color: 'success', text: 'In Stock', status: 'success' };
  };

  // Fix for price formatting - handle non-numeric values
  const formatPrice = (val) => {
    const numericValue = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(numericValue)) return '$0.00';
    return `$${numericValue.toFixed(2)}`;
  };

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image',
      width: 80,
      render: (url) => (
        url ? (
          <Image 
            src={url} 
            width={40} 
            height={40} 
            className="rounded-lg object-cover"
            preview={{
              mask: 'View',
            }}
          />
        ) : (
          <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center">
            <span className="text-gray-400 text-xs text-center">No img</span>
          </div>
        )
      ),
    },
    { 
      title: 'Name', 
      dataIndex: 'name', 
      key: 'name', 
      sorter: true,
      render: (text) => (
        <span className="font-medium text-gray-900">{text}</span>
      )
    },
    { 
      title: 'SKU', 
      dataIndex: 'sku', 
      key: 'sku', 
      render: (text) => (
        <code className="px-2 py-1 bg-gray-100 rounded text-xs font-mono text-gray-600">
          {text}
        </code>
      )
    },
    { 
      title: 'Category', 
      dataIndex: ['category', 'name'], 
      key: 'category',
      render: (text) => (
        <Tag color="blue" className="rounded-full">
          {text || 'Uncategorized'}
        </Tag>
      )
    },
    { 
      title: 'Price', 
      dataIndex: 'price', 
      key: 'price',
      align: 'right',
      render: (val) => (
        <span className="font-bold text-primary">{formatPrice(val)}</span>
      ),
      sorter: true,
    },
    { 
      title: 'Stock', 
      dataIndex: 'stock_qty', 
      key: 'stock',
      render: (stock) => {
        const status = getStockStatus(stock);
        return (
          <Badge 
            status={status.status} 
            text={
              <span className="font-medium">
                {stock || 0} units
                {stock < 10 && stock > 0 && (
                  <span className="text-xs text-orange-600 ml-1">(Low)</span>
                )}
                {stock <= 0 && (
                  <span className="text-xs text-red-600 ml-1">(Out)</span>
                )}
              </span>
            } 
          />
        );
      }
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'active',
      align: 'center',
      render: (active) => (
        <Tag 
          color={active ? 'success' : 'default'} 
          className="rounded-full px-3"
        >
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => navigate(`/products/${record.id}`)}
            className="text-blue-500 hover:text-blue-700"
          />  
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEdit(record)}
            className="text-primary hover:text-primary/80"
          />
          <Popconfirm 
            title="Delete Product" 
            description={`Are you sure you want to delete "${record.name}"?`}
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button type="text" danger icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Handle table changes (sorting, pagination)
  const handleTableChange = (paginationConfig, filters, sorter) => {
    const newParams = { ...params, page: paginationConfig.current, per_page: paginationConfig.pageSize };
    
    // Handle sorting
    if (sorter.field && sorter.order) {
      newParams.sort_by = sorter.field;
      newParams.sort_order = sorter.order === 'ascend' ? 'asc' : 'desc';
    } else {
      delete newParams.sort_by;
      delete newParams.sort_order;
    }
    
    setParams(newParams);
  };

  // Handle search
  const handleSearch = (value) => {
    setParams({ ...params, search: value, page: 1 });
  };

  // Handle category filter
  const handleCategoryFilter = (value) => {
    setParams({ ...params, category_id: value === 'all' ? null : value, page: 1 });
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Products</h2>
            <p className="text-gray-600">Manage your inventory, pricing, and availability.</p>
          </div>
          <div className="flex gap-3">
            <Button 
              icon={<DownloadOutlined />}
              onClick={exportToCSV}
              loading={exporting}
              className="flex items-center gap-2 border border-gray-300 bg-white hover:bg-gray-50"
              size="large"
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
            <Button 
              type="primary" 
              icon={<PlusOutlined />} 
              onClick={handleAdd}
              size="large"
              className="shadow-lg hover:shadow-xl transition-all"
            >
              Add Product
            </Button>
          </div> 
        </div>
      </div>
      
      {/* Products Table */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filters Bar */}
        <div className="p-4 border-b border-gray-200 bg-gray-50/50">
          <div className="flex flex-wrap gap-4">
            <Input
              placeholder="Search by name or SKU..."
              prefix={<SearchOutlined className="text-gray-400" />}
              className="max-w-xs"
              value={params.search}
              onChange={(e) => handleSearch(e.target.value)}
              allowClear
            />
            <Select
              placeholder="Filter by category"
              allowClear
              className="min-w-[180px]"
              onChange={handleCategoryFilter}
              value={params.category_id === null ? undefined : params.category_id}
            >
              <Option value="all">All Categories</Option>
              {categories.map(category => (
                <Option key={category.id} value={category.id}>
                  {category.name}
                </Option>
              ))}
            </Select>
            <div className="flex-1"></div>
            <div className="text-sm text-gray-500 self-center">
              Total: {pagination?.total || 0} products
            </div>
          </div>
        </div>
        
        {/* Table */}
        <Table
          columns={columns}
          dataSource={products}
          rowKey="id"
          loading={isLoading}
          onChange={handleTableChange}
          pagination={{
            current: params.page,
            pageSize: params.per_page,
            total: pagination?.total || 0,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
            pageSizeOptions: ['10', '20', '50', '100'],
          }}
          className="product-table"
          scroll={{ x: 1000 }}
        />
      </div>

      {/* Product Form Modal */}
      <ProductForm 
        visible={modalVisible} 
        onClose={handleModalClose} 
        editingProduct={editingProduct}
        onSuccess={() => dispatch(fetchProducts(params))}
      />
    </div>
  );
};

export default ProductList;