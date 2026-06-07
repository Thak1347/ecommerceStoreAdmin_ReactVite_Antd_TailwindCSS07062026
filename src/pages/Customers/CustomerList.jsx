import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Table, Tag, Button, Space, Switch, message, Avatar, Input, Card, Modal, Typography, Popconfirm, Form } from 'antd';
import { 
  SearchOutlined, 
  UserOutlined, 
  EyeOutlined, 
  DownloadOutlined,
  DeleteOutlined,
  PlusOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  LockOutlined
} from '@ant-design/icons';
import { fetchCustomers, updateCustomerStatus, deleteCustomer, createCustomer } from '../../store/slices/customerSlice';
import LoadingSpinner, { TableSkeleton, CardSkeleton } from '../../components/Common/LoadingSpinner';

const { Text } = Typography;

const CustomerList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { customers, pagination, isLoading } = useSelector((state) => state.customers);
  const [params, setParams] = useState({ page: 1, per_page: 10, search: '' });
  const [searchText, setSearchText] = useState('');
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    dispatch(fetchCustomers(params));
  }, [dispatch, params]);

  const handleStatusToggle = async (id, active) => {
    try {
      await dispatch(updateCustomerStatus({ id, active: !active })).unwrap();
      message.success(`Customer ${!active ? 'activated' : 'deactivated'}`);
      dispatch(fetchCustomers(params));
    } catch (error) {
      message.error('Failed to update customer status');
    }
  };

  const handleViewCustomer = (id) => {
    navigate(`/customers/${id}`);
  };

  const handleDeleteCustomer = (id, name) => {
    Modal.confirm({
      title: 'Delete Customer',
      content: `Are you sure you want to delete "${name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteCustomer(id)).unwrap();
          message.success('Customer deleted successfully');
          dispatch(fetchCustomers(params));
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete customer');
        }
      },
    });
  };

  const handleAddCustomer = async (values) => {
    setSubmitting(true);
    try {
      await dispatch(createCustomer(values)).unwrap();
      message.success('Customer created successfully');
      setAddModalVisible(false);
      form.resetFields();
      dispatch(fetchCustomers(params));
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          message.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        message.error(error.response?.data?.message || 'Failed to create customer');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleSearch = () => {
    setParams({ ...params, search: searchText, page: 1 });
  };

  const handleClearSearch = () => {
    setSearchText('');
    setParams({ ...params, search: '', page: 1 });
  };

  // Export to CSV function
  const exportToCSV = async () => {
    setExporting(true);
    try {
      // Fetch all customers without pagination for export
      const response = await dispatch(fetchCustomers({ 
        ...params, 
        per_page: 10000, 
        page: 1 
      })).unwrap();
      
      const allCustomers = response.data || customers;
      
      // Prepare data for CSV
      const csvData = allCustomers.map(customer => ({
        'ID': customer.id,
        'Name': customer.name,
        'Email': customer.email,
        'Phone': customer.phone || '',
        'Address': customer.address || '',
        'Orders Count': customer.orders_count || 0,
        'Total Spent': customer.total_spent || 0,
        'Status': customer.active ? 'Active' : 'Inactive',
        'Joined Date': new Date(customer.created_at).toLocaleString(),
        'Last Updated': new Date(customer.updated_at).toLocaleString()
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
          // Format currency for Total Spent
          if (header === 'Total Spent' && typeof value === 'number') {
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
      link.setAttribute('download', `customers_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success(`Exported ${allCustomers.length} customers successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export customers');
    } finally {
      setExporting(false);
    }
  };

  // Format currency helper
  const formatCurrency = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  const columns = [
    {
      title: 'Customer',
      key: 'customer',
      width: 290,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar size={30} icon={<UserOutlined />} className="bg-primary" />
          <div>
            <button 
              onClick={() => handleViewCustomer(record.id)}
              className="font-medium text-[#1b1c1c] hover:text-primary hover:underline cursor-pointer transition-colors"
            >
              {record.name}
            </button>
            <p className="text-xs text-gray-500">{record.email}</p>
          </div>
        </div>
      ),
    },
    { 
      title: 'Phone', 
      dataIndex: 'phone', 
      key: 'phone',
      render: (phone) => phone || '—',
    },
    { 
      title: 'Address', 
      dataIndex: 'address', 
      key: 'address', 
      ellipsis: true,
      render: (address) => address || '—',
    },
    { 
      title: 'Orders', 
      dataIndex: 'orders_count', 
      key: 'orders', 
      render: (count) => <Tag color="blue">{count || 0}</Tag>,
    },
    { 
      title: 'Total Spent', 
      dataIndex: 'total_spent', 
      key: 'total_spent', 
      render: (val) => formatCurrency(val || 0),
      className: 'font-mono font-bold',
    },
    { 
      title: 'Joined', 
      dataIndex: 'created_at', 
      key: 'joined', 
      render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A' 
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'status',
      align: 'center',
      render: (active) => (
        <Tag color={active ? 'success' : 'error'} className="rounded-full px-3">
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 170,
      align: 'center',
      render: (_, record) => (
        <Space size="small">
          <Button 
            type="text" 
            icon={<EyeOutlined />} 
            onClick={() => handleViewCustomer(record.id)}
            className="text-blue-500 hover:text-blue-700"
            title="View Customer"
          />
          <Switch
            checked={record.active}
            onChange={() => handleStatusToggle(record.id, record.active)}
            size="small"
            checkedChildren="Active"
            unCheckedChildren="Inactive"
          />
          <Popconfirm
            title="Delete Customer"
            description={`Are you sure you want to delete "${record.name}"?`}
            onConfirm={() => handleDeleteCustomer(record.id, record.name)}
            okText="Yes"
            cancelText="No"
            okButtonProps={{ danger: true }}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />} 
              className="text-red-500 hover:text-red-700"
              title="Delete Customer"
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  // Calculate pagination values
  const currentPage = pagination?.current || 1;
  const perPage = pagination?.per_page || 10;
  const totalItems = pagination?.total || 0;
  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, totalItems);

  // Show skeleton loader while loading initial data
  if (isLoading && customers.length === 0) {
    return (
      <div className='p-4'>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="flex gap-3">
            <div className="h-10 w-28 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <CardSkeleton count={4} />
        <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden mt-6">
          <div className="p-4 border-b border-gray-200">
            <div className="h-10 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <TableSkeleton rows={5} columns={7} />
        </Card>
      </div>
    );
  }

  return (
    <div className='p-4'>
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1b1c1c] mb-1">Customers</h2>
          <p className="text-[14px] text-[#414755]">Manage your customer base and track their order history.</p>
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
            onClick={() => setAddModalVisible(true)}
            className="bg-primary shadow-md shadow-primary/10"
          >
            Add Customer
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card className="rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Customers</p>
              <p className="text-2xl font-bold text-[#1b1c1c]">{totalItems}</p>
            </div>
            <UserOutlined className="text-3xl text-primary/40" />
          </div>
        </Card>
        <Card className="rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Active Customers</p>
              <p className="text-2xl font-bold text-green-600">
                {customers?.filter(c => c.active).length || 0}
              </p>
            </div>
            <UserOutlined className="text-3xl text-green-600/40" />
          </div>
        </Card>
        <Card className="rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Inactive Customers</p>
              <p className="text-2xl font-bold text-red-600">
                {customers?.filter(c => !c.active).length || 0}
              </p>
            </div>
            <UserOutlined className="text-3xl text-red-600/40" />
          </div>
        </Card>
        <Card className="rounded-xl">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">New This Month</p>
              <p className="text-2xl font-bold text-primary">—</p>
            </div>
            <UserOutlined className="text-3xl text-primary/40" />
          </div>
        </Card>
      </div>
      
      {/* Customers Table */}
      <Card className="rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-gray-200 flex flex-wrap gap-4 items-center justify-between bg-white">
          <div className="flex gap-2">
            <div className="relative w-64">
              <SearchOutlined className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[16px] z-10" />
              <Input
                placeholder="Search by name or email..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onPressEnter={handleSearch}
                className="pl-10"
                allowClear
              />
            </div>
            <Button type="primary" onClick={handleSearch} size="middle">
              Search
            </Button>
            {params.search && (
              <Button onClick={handleClearSearch} size="middle">
                Clear
              </Button>
            )}
          </div>
          <div className="text-xs text-[#414755]">
            Showing <span className="font-bold text-[#1b1c1c]">{startItem}</span> to{' '}
            <span className="font-bold text-[#1b1c1c]">{endItem}</span> of{' '}
            <span className="font-bold text-[#1b1c1c]">{totalItems}</span> customers
          </div>
        </div>
        
        <Table 
          columns={columns}
          dataSource={customers}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination?.current,
            total: pagination?.total,
            pageSize: params.per_page,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} customers`,
            onChange: (page, pageSize) => setParams({ ...params, page, per_page: pageSize }),
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* Add Customer Modal */}
      <Modal
        title="Add New Customer"
        open={addModalVisible}
        onCancel={() => {
          setAddModalVisible(false);
          form.resetFields();
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setAddModalVisible(false);
            form.resetFields();
          }}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={submitting}
            onClick={() => form.submit()}
          >
            Create Customer
          </Button>,
        ]}
        width={600}
        destroyOnClose
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleAddCustomer}
        >
          <Form.Item
            name="name"
            label="Full Name"
            rules={[
              { required: true, message: 'Please enter customer name' },
              { min: 2, message: 'Name must be at least 2 characters' },
              { max: 100, message: 'Name cannot exceed 100 characters' }
            ]}
          >
            <Input 
              prefix={<UserOutlined className="text-gray-400" />}
              placeholder="Enter full name" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter email address' },
              { type: 'email', message: 'Please enter a valid email address' }
            ]}
          >
            <Input 
              prefix={<MailOutlined className="text-gray-400" />}
              placeholder="Enter email address" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="phone"
            label="Phone Number"
            rules={[
              { pattern: /^[0-9+\-\s()]+$/, message: 'Please enter a valid phone number' }
            ]}
          >
            <Input 
              prefix={<PhoneOutlined className="text-gray-400" />}
              placeholder="Enter phone number" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="address"
            label="Address"
          >
            <Input.TextArea 
              placeholder="Enter address" 
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter password' },
              { min: 6, message: 'Password must be at least 6 characters' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Enter password" 
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password_confirmation"
            label="Confirm Password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined className="text-gray-400" />}
              placeholder="Confirm password" 
              size="large"
            />
          </Form.Item>

          <div className="bg-blue-50 p-3 rounded-lg mt-2">
            <p className="text-xs text-blue-700">
              <strong>Note:</strong> New customers will be created with "customer" role and will be active by default.
            </p>
          </div>
        </Form>
      </Modal>
    </div>
  );
};

export default CustomerList;