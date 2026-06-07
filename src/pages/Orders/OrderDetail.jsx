import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tag, Button, Space, Spin,
  message, Row, Col, Statistic, Table, Tabs,
  Typography, Divider, Timeline, Badge, Modal, Select, Form
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  TruckOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  SyncOutlined,
  EyeOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { updateOrderStatus, updatePaymentStatus, fetchOrderDetail } from '../../store/slices/orderSlice';
import API from '../../api/axios';

const { Option } = Select;
const { Title, Text } = Typography;

const statusColors = {
  pending: 'gold',
  processing: 'blue',
  shipped: 'cyan',
  delivered: 'green',
  cancelled: 'red',
};

const paymentColors = {
  pending: 'gold',
  paid: 'green',
  failed: 'red',
  refunded: 'orange',
};

const statusIcons = {
  pending: <SyncOutlined spin />,
  processing: <SyncOutlined />,
  shipped: <TruckOutlined />,
  delivered: <CheckCircleOutlined />,
  cancelled: <CloseCircleOutlined />,
};

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchOrderDetail();
  }, [id]);

  const fetchOrderDetail = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/orders/${id}`);
      setOrder(response.data);
    } catch (error) {
      console.error('Failed to fetch order:', error);
      message.error('Order not found');
      navigate('/orders');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async () => {
    setUpdating(true);
    try {
      await dispatch(updateOrderStatus({ id, status: { order_status: newStatus } })).unwrap();
      message.success(`Order status updated to ${newStatus}`);
      setStatusModalVisible(false);
      fetchOrderDetail();
    } catch (error) {
      message.error('Failed to update order status');
    } finally {
      setUpdating(false);
    }
  };

  const handlePaymentUpdate = async () => {
    setUpdating(true);
    try {
      await dispatch(updatePaymentStatus({ id, status: { payment_status: newPaymentStatus } })).unwrap();
      message.success(`Payment status updated to ${newPaymentStatus.toUpperCase()}`);
      setPaymentModalVisible(false);
      fetchOrderDetail();
    } catch (error) {
      message.error('Failed to update payment status');
    } finally {
      setUpdating(false);
    }
  };

  const formatCurrency = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  const getTimelineItems = () => {
    const items = [
      {
        color: 'green',
        children: (
          <>
            <p><strong>Order Placed</strong></p>
            <p className="text-gray-500 text-sm">
              {order?.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}
            </p>
          </>
        ),
      },
    ];

    if (order?.payment_status === 'paid') {
      items.push({
        color: 'blue',
        children: (
          <>
            <p><strong>Payment Confirmed</strong></p>
            <p className="text-gray-500 text-sm">Payment has been received</p>
          </>
        ),
      });
    }

    if (order?.order_status === 'processing') {
      items.push({
        color: 'blue',
        children: (
          <>
            <p><strong>Order Processing</strong></p>
            <p className="text-gray-500 text-sm">Your order is being prepared</p>
          </>
        ),
      });
    }

    if (order?.order_status === 'shipped') {
      items.push({
        color: 'cyan',
        children: (
          <>
            <p><strong>Order Shipped</strong></p>
            <p className="text-gray-500 text-sm">Your order has been shipped</p>
          </>
        ),
      });
    }

    if (order?.order_status === 'delivered') {
      items.push({
        color: 'green',
        children: (
          <>
            <p><strong>Order Delivered</strong></p>
            <p className="text-gray-500 text-sm">Your order has been delivered</p>
          </>
        ),
      });
    }

    if (order?.order_status === 'cancelled') {
      items.push({
        color: 'red',
        children: (
          <>
            <p><strong>Order Cancelled</strong></p>
            <p className="text-gray-500 text-sm">This order has been cancelled</p>
          </>
        ),
      });
    }

    return items;
  };

  const orderItemsColumns = [
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
              className="w-12 h-12 rounded object-cover"
            />
          ) : (
            <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
              <ShoppingOutlined className="text-gray-400" />
            </div>
          )}
          <div>
            <p className="font-medium">{text || 'Product'}</p>
            <p className="text-xs text-gray-500">SKU: {record.product?.sku || 'N/A'}</p>
          </div>
        </div>
      ),
    },
    {
      title: 'Quantity',
      dataIndex: 'qty',
      key: 'qty',
      align: 'center',
      render: (qty) => <span className="font-medium">x{qty}</span>,
    },
    {
      title: 'Unit Price',
      dataIndex: 'price',
      key: 'price',
      align: 'right',
      render: (price) => <span className="font-mono">{formatCurrency(price)}</span>,
    },
    {
      title: 'Subtotal',
      dataIndex: 'subtotal',
      key: 'subtotal',
      align: 'right',
      render: (subtotal) => <span className="font-mono font-bold">{formatCurrency(subtotal)}</span>,
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Order not found</p>
        <Button onClick={() => navigate('/orders')} className="mt-4">
          Back to Orders
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
            onClick={() => navigate('/orders')}
          >
            Back to Orders
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-[#1b1c1c] mb-1">
              Order #{order?.order_number}
            </h2>
            <p className="text-[#414755]">
              View and manage order details
            </p>
          </div>
        </div>
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => setStatusModalVisible(true)}
          >
            Update Status
          </Button>
          <Button
            icon={<DollarOutlined />}
            onClick={() => setPaymentModalVisible(true)}
          >
            Update Payment
          </Button>
        </Space>
      </div>

      {/* Statistics Row */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="Order Status"
              value={order?.order_status?.toUpperCase()}
              prefix={statusIcons[order?.order_status]}
              valueStyle={{ color: statusColors[order?.order_status] === 'gold' ? '#faad14' : '#0057c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="Payment Status"
              value={order?.payment_status?.toUpperCase()}
              valueStyle={{ color: paymentColors[order?.payment_status] === 'green' ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="Total Amount"
              value={formatCurrency(order?.total)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#0057c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="Order Date"
              value={order?.created_at ? new Date(order.created_at).toLocaleDateString() : 'N/A'}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Order Information */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <Card title="Order Items" className="rounded-xl mb-6">
            <Table
              columns={orderItemsColumns}
              dataSource={order?.items || []}
              rowKey="id"
              pagination={false}
              summary={(pageData) => {
                let total = 0;
                pageData.forEach(({ subtotal }) => {
                  total += parseFloat(subtotal);
                });
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3}>
                        <strong>Total</strong>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={3} align="right">
                        <strong className="text-primary">{formatCurrency(order?.total)}</strong>
                      </Table.Summary.Cell>
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
            <Divider />
            <div className="flex justify-end">
              <div className="w-80 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Subtotal:</span>
                  <span>{formatCurrency(order?.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Tax:</span>
                  <span>{formatCurrency(order?.tax)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Shipping Fee:</span>
                  <span>{formatCurrency(order?.shipping_fee)}</span>
                </div>
                <div className="flex justify-between pt-2 border-t">
                  <span className="font-bold">Total:</span>
                  <span className="font-bold text-primary text-lg">{formatCurrency(order?.total)}</span>
                </div>
              </div>
            </div>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title="Customer Information" className="rounded-xl mb-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <UserOutlined className="text-primary text-lg" />
                <div>
                  <p className="font-medium">{order?.customer?.name || 'Guest'}</p>
                  <p className="text-xs text-gray-500">{order?.customer?.email || 'No email'}</p>
                </div>
              </div>
              {order?.customer?.phone && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">📞</span>
                  <p className="text-sm">{order.customer.phone}</p>
                </div>
              )}
              {order?.customer?.address && (
                <div className="flex items-center gap-3">
                  <span className="text-gray-400">📍</span>
                  <p className="text-sm">{order.customer.address}</p>
                </div>
              )}
              <Button 
                type="link" 
                icon={<UserOutlined />}
                onClick={() => navigate(`/customers/${order?.customer?.id}`)}
                className="p-0"
              >
                View Customer Details
              </Button>
            </div>
          </Card>

          <Card title="Payment Information" className="rounded-xl mb-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Method:</span>
                <span className="font-medium">{order?.payment_method?.replace('_', ' ').toUpperCase() || 'N/A'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Payment Status:</span>
                <Tag color={paymentColors[order?.payment_status]}>
                  {order?.payment_status?.toUpperCase()}
                </Tag>
              </div>
            </div>
          </Card>

          <Card title="Order Timeline" className="rounded-xl">
            <Timeline items={getTimelineItems()} />
          </Card>
        </Col>
      </Row>

      {/* Update Status Modal */}
      <Modal
        title="Update Order Status"
        open={statusModalVisible}
        onCancel={() => setStatusModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setStatusModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updating}
            onClick={handleStatusUpdate}
          >
            Update Status
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Current Status">
            <Tag color={statusColors[order?.order_status]} className="text-sm">
              {order?.order_status?.toUpperCase()}
            </Tag>
          </Form.Item>
          <Form.Item label="New Status" required>
            <Select
              placeholder="Select new status"
              value={newStatus}
              onChange={setNewStatus}
              size="large"
            >
              <Option value="pending">Pending</Option>
              <Option value="processing">Processing</Option>
              <Option value="shipped">Shipped</Option>
              <Option value="delivered">Delivered</Option>
              <Option value="cancelled">Cancelled</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      {/* Update Payment Modal */}
      <Modal
        title="Update Payment Status"
        open={paymentModalVisible}
        onCancel={() => setPaymentModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setPaymentModalVisible(false)}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updating}
            onClick={handlePaymentUpdate}
          >
            Update Payment
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Current Payment Status">
            <Tag color={paymentColors[order?.payment_status]}>
              {order?.payment_status?.toUpperCase()}
            </Tag>
          </Form.Item>
          <Form.Item label="New Payment Status" required>
            <Select
              placeholder="Select new payment status"
              value={newPaymentStatus}
              onChange={setNewPaymentStatus}
              size="large"
            >
              <Option value="pending">Pending</Option>
              <Option value="paid">Paid</Option>
              <Option value="failed">Failed</Option>
              <Option value="refunded">Refunded</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderDetail;