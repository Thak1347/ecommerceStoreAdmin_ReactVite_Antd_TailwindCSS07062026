import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Table, Tag, Button, Space, Dropdown, message, Drawer, Descriptions, Card, Modal, Select, Form } from 'antd';
import { EyeOutlined, MoreOutlined, ExportOutlined, DollarOutlined } from '@ant-design/icons';
import { fetchOrders, updateOrderStatus, updatePaymentStatus, fetchOrderDetail } from '../../store/slices/orderSlice';

const { Option } = Select;

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

const OrderList = () => {
  const dispatch = useDispatch();
  const { orders, pagination, isLoading, currentOrder } = useSelector((state) => state.orders);
  const [params, setParams] = useState({ page: 1, per_page: 10, order_status: null });
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [paymentModalVisible, setPaymentModalVisible] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');
  const [updatingPayment, setUpdatingPayment] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    dispatch(fetchOrders(params));
  }, [dispatch, params]);

  const handleViewOrder = async (id) => {
    await dispatch(fetchOrderDetail(id));
    setDrawerVisible(true);
  };

  const handleStatusUpdate = async (id, status) => {
    await dispatch(updateOrderStatus({ id, status: { order_status: status } }));
    message.success(`Order status updated to ${status}`);
    dispatch(fetchOrders(params));
  };

  const handlePaymentUpdate = async () => {
    if (!selectedOrder) return;
    
    setUpdatingPayment(true);
    try {
      await dispatch(updatePaymentStatus({ id: selectedOrder.id, status: { payment_status: paymentStatus } })).unwrap();
      message.success(`Payment status updated to ${paymentStatus.toUpperCase()}`);
      setPaymentModalVisible(false);
      setSelectedOrder(null);
      setPaymentStatus('');
      dispatch(fetchOrders(params));
      if (currentOrder?.id === selectedOrder.id) {
        dispatch(fetchOrderDetail(selectedOrder.id));
      }
    } catch (error) {
      message.error('Failed to update payment status');
    } finally {
      setUpdatingPayment(false);
    }
  };

  const openPaymentModal = (order) => {
    setSelectedOrder(order);
    setPaymentStatus(order.payment_status);
    setPaymentModalVisible(true);
  };

  const getStatusMenu = (orderId, currentStatus) => {
    const statuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
    const items = statuses
      .filter(s => s !== currentStatus)
      .map(s => ({ key: s, label: `Mark as ${s}` }));
    
    return {
      items,
      onClick: ({ key }) => handleStatusUpdate(orderId, key),
    };
  };

  const getPaymentMenu = (orderId, currentPayment) => {
    const paymentStatuses = ['pending', 'paid', 'failed', 'refunded'];
    const items = paymentStatuses
      .filter(s => s !== currentPayment)
      .map(s => ({ key: s, label: `Mark as ${s.toUpperCase()}` }));
    
    return {
      items,
      onClick: ({ key }) => {
        setSelectedOrder({ id: orderId });
        setPaymentStatus(key);
        handlePaymentUpdateDirect(orderId, key);
      },
    };
  };

  const handlePaymentUpdateDirect = async (orderId, status) => {
    try {
      await dispatch(updatePaymentStatus({ id: orderId, status: { payment_status: status } })).unwrap();
      message.success(`Payment status updated to ${status.toUpperCase()}`);
      dispatch(fetchOrders(params));
    } catch (error) {
      message.error('Failed to update payment status');
    }
  };

  // Export to CSV function
  const exportToCSV = async () => {
    setExporting(true);
    try {
      // Fetch all orders without pagination for export
      const response = await dispatch(fetchOrders({ 
        ...params, 
        per_page: 10000, 
        page: 1 
      })).unwrap();
      
      const allOrders = response.data || orders;
      
      // Prepare data for CSV
      const csvData = allOrders.map(order => ({
        'Order #': order.order_number,
        'Customer': order.customer?.name || 'Guest',
        'Customer Email': order.customer?.email || 'N/A',
        'Order Status': order.order_status?.toUpperCase() || 'PENDING',
        'Payment Status': order.payment_status?.toUpperCase() || 'PENDING',
        'Payment Method': order.payment_method?.replace('_', ' ') || 'N/A',
        'Subtotal': order.subtotal || 0,
        'Tax': order.tax || 0,
        'Shipping Fee': order.shipping_fee || 0,
        'Total': order.total || 0,
        'Items Count': order.items?.length || 0,
        'Order Date': new Date(order.created_at).toLocaleString(),
        'Last Updated': new Date(order.updated_at).toLocaleString(),
        'Notes': order.notes || ''
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
          if (['Subtotal', 'Tax', 'Shipping Fee', 'Total'].includes(header) && typeof value === 'number') {
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
      link.setAttribute('download', `orders_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success(`Exported ${allOrders.length} orders successfully`);
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export orders');
    } finally {
      setExporting(false);
    }
  };

  // Helper function to format currency safely
  const formatCurrency = (value) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$0.00';
    return `$${num.toFixed(2)}`;
  };

  const columns = [
    { title: 'Order #', dataIndex: 'order_number', key: 'order_number', className: 'font-mono font-bold text-primary' },
    { title: 'Date', dataIndex: 'created_at', key: 'date', render: (date) => date ? new Date(date).toLocaleDateString() : 'N/A' },
    { title: 'Customer', dataIndex: ['customer', 'name'], key: 'customer', render: (name) => name || 'Guest' },
    {
      title: 'Payment',
      dataIndex: 'payment_status',
      key: 'payment',
      render: (status, record) => (
        <Space>
          <Tag color={paymentColors[status] || 'default'} className="cursor-pointer" onClick={() => openPaymentModal(record)}>
            {status?.toUpperCase() || 'PENDING'}
          </Tag>
          <Button 
            type="text" 
            size="small" 
            icon={<DollarOutlined />} 
            onClick={() => openPaymentModal(record)}
            className="text-gray-400 hover:text-primary"
          />
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'order_status',
      key: 'status',
      render: (status) => <Tag color={statusColors[status] || 'default'}>{status?.toUpperCase() || 'PENDING'}</Tag>,
    },
    { 
      title: 'Total', 
      dataIndex: 'total', 
      key: 'total', 
      render: (val) => formatCurrency(val),
      className: 'font-bold' 
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      render: (_, record) => (
        <Space>
          <Button type="text" icon={<EyeOutlined />} onClick={() => handleViewOrder(record.id)} />
          <Dropdown menu={getStatusMenu(record.id, record.order_status)} trigger={['click']}>
            <Button type="text" icon={<MoreOutlined />} />
          </Dropdown>
        </Space>
      ),
    },
  ];

  return (
    <div>
        {/* <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6"> */}
      <div className="flex justify-between items-center mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div>
          <h2 className="text-2xl font-bold text-[#1b1c1c] mb-1">Orders</h2>
          <p className="text-[#414755]">Manage and track your customer orders across all channels.</p>
        </div>
        <Button 
          icon={<ExportOutlined />} 
          onClick={exportToCSV}
          loading={exporting}
        >
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>
      
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-200 flex gap-2 flex-wrap">
          {['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
            <Button
              key={status}
              type={params.order_status === status ? 'primary' : 'default'}
              onClick={() => setParams({ ...params, order_status: status === 'all' ? null : status, page: 1 })}
              size="small"
            >
              {status.toUpperCase()}
            </Button>
          ))}
        </div>
        
        <Table
          columns={columns}
          dataSource={orders}
          rowKey="id"
          loading={isLoading}
          pagination={{
            current: pagination?.current,
            total: pagination?.total,
            pageSize: params.per_page,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} orders`,
            onChange: (page, pageSize) => setParams({ ...params, page, per_page: pageSize }),
          }}
        />
      </div>
      
      {/* Order Details Drawer */}
      <Drawer
        title={`Order Details - ${currentOrder?.order_number}`}
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        size="large"
        styles={{ body: { padding: '24px' } }}
      >
        {currentOrder && (
          <div className="space-y-6">
            <div className="flex justify-between items-start">
              <Descriptions column={1} bordered size="small" style={{ flex: 1 }}>
                <Descriptions.Item label="Order Status">
                  <Tag color={statusColors[currentOrder.order_status] || 'default'}>
                    {currentOrder.order_status?.toUpperCase() || 'PENDING'}
                  </Tag>
                </Descriptions.Item>
                <Descriptions.Item label="Payment Status">
                  <Space>
                    <Tag color={paymentColors[currentOrder.payment_status] || 'default'}>
                      {currentOrder.payment_status?.toUpperCase() || 'PENDING'}
                    </Tag>
                    <Button 
                      size="small" 
                      icon={<DollarOutlined />}
                      onClick={() => {
                        setDrawerVisible(false);
                        openPaymentModal(currentOrder);
                      }}
                    >
                      Update Payment
                    </Button>
                  </Space>
                </Descriptions.Item>
                <Descriptions.Item label="Total Amount">{formatCurrency(currentOrder.total)}</Descriptions.Item>
                <Descriptions.Item label="Payment Method">{currentOrder.payment_method || 'N/A'}</Descriptions.Item>
                <Descriptions.Item label="Order Date">
                  {currentOrder.created_at ? new Date(currentOrder.created_at).toLocaleString() : 'N/A'}
                </Descriptions.Item>
              </Descriptions>
            </div>
            
            <Card title="Order Items" size="small">
              {currentOrder.items?.map((item) => (
                <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                  <div>
                    <p className="font-medium">{item.product?.name || 'Product'}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty} × {formatCurrency(item.price)}</p>
                  </div>
                  <p className="font-mono font-bold">{formatCurrency(item.subtotal)}</p>
                </div>
              ))}
              <div className="pt-3 mt-2 border-t">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>{formatCurrency(currentOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Tax</span>
                  <span>{formatCurrency(currentOrder.tax)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>Shipping</span>
                  <span>{formatCurrency(currentOrder.shipping_fee)}</span>
                </div>
                <div className="flex justify-between font-bold mt-2 pt-2 border-t">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(currentOrder.total)}</span>
                </div>
              </div>
            </Card>
            
            {currentOrder.notes && (
              <Card title="Notes" size="small">
                <p className="text-gray-600">{currentOrder.notes}</p>
              </Card>
            )}
          </div>
        )}
      </Drawer>

      {/* Update Payment Modal */}
      <Modal
        title={`Update Payment Status - Order #${selectedOrder?.order_number}`}
        open={paymentModalVisible}
        onCancel={() => {
          setPaymentModalVisible(false);
          setSelectedOrder(null);
          setPaymentStatus('');
        }}
        footer={[
          <Button key="cancel" onClick={() => {
            setPaymentModalVisible(false);
            setSelectedOrder(null);
            setPaymentStatus('');
          }}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updatingPayment}
            onClick={handlePaymentUpdate}
          >
            Update Payment
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Current Payment Status">
            <Tag color={paymentColors[selectedOrder?.payment_status] || 'default'}>
              {selectedOrder?.payment_status?.toUpperCase() || 'PENDING'}
            </Tag>
          </Form.Item>
          <Form.Item label="New Payment Status" required>
            <Select
              placeholder="Select new payment status"
              value={paymentStatus}
              onChange={setPaymentStatus}
              size="large"
            >
              <Option value="pending">Pending</Option>
              <Option value="paid">Paid</Option>
              <Option value="failed">Failed</Option>
              <Option value="refunded">Refunded</Option>
            </Select>
          </Form.Item>
          {paymentStatus === 'refunded' && (
            <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-sm text-orange-700">
                ⚠️ Refunding this order will not automatically update inventory. Please manually adjust stock if needed.
              </p>
            </div>
          )}
          {paymentStatus === 'paid' && selectedOrder?.payment_status === 'pending' && (
            <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-sm text-green-700">
                ✓ Marking as paid will confirm the payment for this order.
              </p>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
};

export default OrderList;