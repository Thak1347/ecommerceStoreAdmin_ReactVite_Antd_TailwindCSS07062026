import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tag, Button, Space, Spin,
  Image, message, Row, Col, Statistic, Table, Tabs,
  Typography, Divider, Avatar, Timeline, Badge, Modal
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  PhoneOutlined,
  MailOutlined,
  EnvironmentOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { deleteCustomer, updateCustomerStatus } from '../../store/slices/customerSlice';
import LoadingSpinner, { DetailSkeleton, TableSkeleton } from '../../components/Common/LoadingSpinner';
import API from '../../api/axios';

const { Title, Text, Paragraph } = Typography;

const CustomerDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  useEffect(() => {
    fetchCustomerDetail();
  }, [id]);

  const fetchCustomerDetail = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/customers/${id}`);
      setCustomer(response.data);
      await fetchCustomerOrders(response.data.id);
    } catch (error) {
      console.error('Failed to fetch customer:', error);
      message.error('Customer not found');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async (customerId) => {
    setOrdersLoading(true);
    try {
      const response = await API.get('/orders', {
        params: { 
          customer_id: customerId,
          per_page: 50,
          sort_by: 'created_at',
          sort_order: 'desc'
        }
      });
      setOrders(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      setOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Customer',
      content: `Are you sure you want to delete "${customer?.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteCustomer(id)).unwrap();
          message.success('Customer deleted successfully');
          navigate('/customers');
        } catch (error) {
          message.error(error.response?.data?.message || 'Failed to delete customer');
        }
      },
    });
  };

  const handleStatusToggle = async () => {
    try {
      await dispatch(updateCustomerStatus({ id, active: !customer.active })).unwrap();
      message.success(`Customer ${!customer.active ? 'activated' : 'deactivated'}`);
      fetchCustomerDetail();
    } catch (error) {
      message.error('Failed to update customer status');
    }
  };

  const formatCurrency = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'gold',
      processing: 'blue',
      shipped: 'cyan',
      delivered: 'green',
      cancelled: 'red',
    };
    return colors[status] || 'default';
  };

  const getPaymentColor = (status) => {
    const colors = {
      pending: 'gold',
      paid: 'green',
      failed: 'red',
      refunded: 'orange',
    };
    return colors[status] || 'default';
  };

  const orderColumns = [
    {
      title: 'Order #',
      dataIndex: 'order_number',
      key: 'order_number',
      render: (text) => <code className="font-mono text-primary font-bold">{text}</code>,
    },
    {
      title: 'Date',
      dataIndex: 'created_at',
      key: 'date',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Items',
      key: 'items_count',
      render: (_, record) => record.items?.length || 0,
    },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment',
      render: (status) => (
        <Tag color={getPaymentColor(status)}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'status',
      render: (status) => (
        <Tag color={getStatusColor(status)}>{status?.toUpperCase()}</Tag>
      ),
    },
    {
      title: 'Total',
      dataIndex: 'total',
      key: 'total',
      render: (val) => <span className="font-mono font-bold text-primary">{formatCurrency(val)}</span>,
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/orders/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  const expandedRowRender = (order) => {
    const orderItems = order.items || [];
    
    if (orderItems.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No items found for this order
        </div>
      );
    }

    const itemColumns = [
      {
        title: 'Product',
        dataIndex: ['product', 'name'],
        key: 'product',
        render: (text, record) => (
          <div className="flex items-center gap-3">
            {record.product?.image_url ? (
              <img 
                src={record.product.image_url} 
                alt={record.product.name}
                className="w-10 h-10 rounded object-cover"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
                <ShoppingOutlined className="text-gray-400" />
              </div>
            )}
            <span className="font-medium">{text || record.product_name || 'Product'}</span>
          </div>
        ),
      },
      {
        title: 'SKU',
        dataIndex: ['product', 'sku'],
        key: 'sku',
        render: (text) => <code className="font-mono text-xs">{text || '—'}</code>,
      },
      {
        title: 'Quantity',
        dataIndex: 'qty',
        key: 'qty',
        align: 'center',
      },
      {
        title: 'Unit Price',
        dataIndex: 'price',
        key: 'price',
        render: (val) => formatCurrency(val),
      },
      {
        title: 'Subtotal',
        dataIndex: 'subtotal',
        key: 'subtotal',
        render: (val) => <span className="font-bold">{formatCurrency(val)}</span>,
      },
    ];

    return (
      <div className="p-4 bg-gray-50 rounded-lg">
        <div className="mb-3 font-medium text-gray-700">Order Items</div>
        <Table
          columns={itemColumns}
          dataSource={orderItems}
          rowKey="id"
          pagination={false}
          size="small"
          className="order-items-table"
        />
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-end">
            <div className="w-64 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Tax:</span>
                <span>{formatCurrency(order.tax)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Shipping:</span>
                <span>{formatCurrency(order.shipping_fee)}</span>
              </div>
              <div className="flex justify-between font-bold pt-1 border-t border-gray-200">
                <span>Total:</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const items = [
    {
      key: 'orders',
      label: `Order History (${orders.length})`,
      children: ordersLoading ? (
        <div className="mt-4">
          <TableSkeleton rows={5} columns={7} />
        </div>
      ) : (
        <Table
          columns={orderColumns}
          dataSource={orders}
          rowKey="id"
          pagination={{ pageSize: 10, showSizeChanger: true }}
          className="mt-4"
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => (record.items?.length || 0) > 0,
          }}
        />
      ),
    },
    {
      key: 'activity',
      label: 'Recent Activity',
      children: (
        <Timeline className="mt-4">
          <Timeline.Item color="green">
            <p><strong>Account Created</strong></p>
            <p className="text-gray-500 text-sm">
              {customer?.created_at ? new Date(customer.created_at).toLocaleString() : 'N/A'}
            </p>
          </Timeline.Item>
          {customer?.last_login && (
            <Timeline.Item color="blue">
              <p><strong>Last Login</strong></p>
              <p className="text-gray-500 text-sm">
                {new Date(customer.last_login).toLocaleString()}
              </p>
            </Timeline.Item>
          )}
          {orders.length > 0 && (
            <Timeline.Item color="orange">
              <p><strong>First Order Placed</strong></p>
              <p className="text-gray-500 text-sm">
                {orders[orders.length - 1]?.created_at 
                  ? new Date(orders[orders.length - 1].created_at).toLocaleString() 
                  : 'N/A'}
              </p>
            </Timeline.Item>
          )}
          {orders.length > 0 && (
            <Timeline.Item color="blue">
              <p><strong>Most Recent Order</strong></p>
              <p className="text-gray-500 text-sm">
                Order #{orders[0]?.order_number} - {formatCurrency(orders[0]?.total)}
              </p>
            </Timeline.Item>
          )}
        </Timeline>
      ),
    },
  ];

  // Show skeleton loader while loading customer details
  if (loading) {
    return <DetailSkeleton />;
  }

  if (!customer) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Customer not found</p>
        <Button onClick={() => navigate('/customers')} className="mt-4">
          Back to Customers
        </Button>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/customers')}
          >
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-[#1b1c1c] mb-1">
              {customer?.name}
            </h2>
            <p className="text-[#414755]">
              Customer details and order history
            </p>
          </div>
        </div>
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/customers/${id}/edit`)}
          >
            Edit Customer
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          >
            Delete Customer
          </Button>
        </Space>
      </div>

      {/* Statistics Row */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="Total Orders"
              value={customer?.orders_count || orders.length}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#0057c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="Total Spent"
              value={formatCurrency(customer?.total_spent || 0)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="Status"
              value={customer?.active ? 'Active' : 'Inactive'}
              valueStyle={{ color: customer?.active ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="Member Since"
              value={customer?.created_at ? new Date(customer.created_at).toLocaleDateString() : 'N/A'}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Customer Information */}
      <Card className="rounded-xl mb-6">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={6}>
            <div className="text-center">
              <Avatar
                size={120}
                icon={<UserOutlined />}
                className="bg-primary"
              />
              <div className="mt-4">
                <Tag color={customer?.active ? 'success' : 'error'} className="text-sm">
                  {customer?.active ? 'Active Customer' : 'Inactive Customer'}
                </Tag>
              </div>
              <Button
                type="link"
                onClick={handleStatusToggle}
                className="mt-2"
              >
                {customer?.active ? 'Deactivate Account' : 'Activate Account'}
              </Button>
            </div>
          </Col>
          <Col xs={24} md={18}>
            <Descriptions column={2} bordered>
              <Descriptions.Item label="Full Name" span={2}>
                <Text strong className="text-lg">{customer?.name}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="Email">
                <Space>
                  <MailOutlined className="text-gray-400" />
                  <Text>{customer?.email}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Phone">
                <Space>
                  <PhoneOutlined className="text-gray-400" />
                  <Text>{customer?.phone || '—'}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>
                <Space>
                  <EnvironmentOutlined className="text-gray-400" />
                  <Text>{customer?.address || 'No address provided'}</Text>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="Account Created">
                {new Date(customer?.created_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {new Date(customer?.updated_at).toLocaleString()}
              </Descriptions.Item>
              <Descriptions.Item label="Customer ID" span={2}>
                <code className="font-mono text-primary">#{customer?.id}</code>
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Tabs Section */}
      <Card className="rounded-xl">
        <Tabs items={items} defaultActiveKey="orders" />
      </Card>
    </div>
  );
};

export default CustomerDetail;