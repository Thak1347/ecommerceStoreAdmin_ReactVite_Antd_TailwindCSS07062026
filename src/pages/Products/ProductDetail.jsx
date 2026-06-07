import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Card, Descriptions, Tag, Button, Space, Spin,
  Image, message, Row, Col, Statistic, Table, Tabs,
  Typography, Divider, Badge, Modal, InputNumber, Form
} from 'antd';
import {
  ArrowLeftOutlined,
  EditOutlined,
  DeleteOutlined,
  ShoppingOutlined,
  EyeOutlined,
  CalendarOutlined,
  DollarOutlined,
  StockOutlined,
  TagOutlined,
  SaveOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { deleteProduct, updateStock } from '../../store/slices/productSlice';
import API from '../../api/axios';

const { Title, Text, Paragraph } = Typography;

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [stockValue, setStockValue] = useState(0);
  const [updatingStock, setUpdatingStock] = useState(false);

  useEffect(() => {
    fetchProductDetail();
  }, [id]);

  const fetchProductDetail = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/products/${id}`);
      setProduct(response.data);
      setStockValue(response.data.stock_qty || 0);
      fetchRelatedProducts(response.data.category_id);
    } catch (error) {
      console.error('Failed to fetch product:', error);
      message.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProducts = async (categoryId) => {
    try {
      const response = await API.get('/products', {
        params: { category_id: categoryId, per_page: 5 }
      });
      const products = response.data.data || [];
      // Filter out current product
      const filtered = products.filter(p => p.id !== parseInt(id));
      setRelatedProducts(filtered);
    } catch (error) {
      console.error('Failed to fetch related products:', error);
    }
  };

  const handleDelete = () => {
    Modal.confirm({
      title: 'Delete Product',
      content: `Are you sure you want to delete "${product?.name}"? This action cannot be undone.`,
      okText: 'Yes, Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: async () => {
        try {
          await dispatch(deleteProduct(id)).unwrap();
          message.success('Product deleted successfully');
          navigate('/products');
        } catch (error) {
          message.error('Failed to delete product');
        }
      }
    });
  };

  const handleUpdateStock = async () => {
    setUpdatingStock(true);
    try {
      await dispatch(updateStock({ id, stock_qty: stockValue })).unwrap();
      message.success('Stock updated successfully');
      setStockModalVisible(false);
      fetchProductDetail();
    } catch (error) {
      message.error('Failed to update stock');
    } finally {
      setUpdatingStock(false);
    }
  };

  const getStockStatus = (stock) => {
    if (stock <= 0) return { color: 'red', text: 'Out of Stock', icon: '🔴', status: 'error' };
    if (stock < 10) return { color: 'orange', text: 'Low Stock', icon: '🟠', status: 'warning' };
    return { color: 'green', text: 'In Stock', icon: '🟢', status: 'success' };
  };

  const formatPrice = (val) => {
    const numericValue = typeof val === 'string' ? parseFloat(val) : val;
    if (isNaN(numericValue)) return '$0.00';
    return `$${numericValue.toFixed(2)}`;
  };

  const relatedColumns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image',
      width: 70,
      render: (url) => (
        url ? (
          <Image src={url} width={40} height={40} className="rounded object-cover" preview={false} />
        ) : (
          <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center">
            <ShoppingOutlined className="text-gray-400" />
          </div>
        )
      ),
    },
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <span className="font-medium">{text}</span>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => <span className="font-mono font-bold">{formatPrice(price)}</span>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock_qty',
      key: 'stock',
      render: (stock) => {
        const status = getStockStatus(stock);
        return <Badge status={status.status} text={`${stock} units`} />;
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => navigate(`/products/${record.id}`)}
        >
          View
        </Button>
      ),
    },
  ];

  const items = [
    {
      key: 'details',
      label: 'Product Details',
      children: (
        <Descriptions column={2} bordered className="mt-4">
          <Descriptions.Item label="Product Name" span={2}>
            <Text strong className="text-lg">{product?.name}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="SKU">
            <code className="font-mono text-primary">{product?.sku}</code>
          </Descriptions.Item>
          <Descriptions.Item label="Category">
            <Tag color="blue">{product?.category?.name || 'Uncategorized'}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Price">
            <Text strong className="text-primary text-lg">{formatPrice(product?.price)}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Cost Price">
            {product?.cost_price ? formatPrice(product.cost_price) : 'N/A'}
          </Descriptions.Item>
          <Descriptions.Item label="Stock Quantity" span={2}>
            <Space>
              <Badge 
                status={getStockStatus(product?.stock_qty).status} 
                text={`${product?.stock_qty || 0} units`}
              />
              <Button 
                size="small" 
                icon={<EditOutlined />}
                onClick={() => setStockModalVisible(true)}
              >
                Update Stock
              </Button>
            </Space>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={product?.active ? 'success' : 'default'}>
              {product?.active ? 'Active' : 'Inactive'}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {new Date(product?.created_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Last Updated" span={2}>
            {new Date(product?.updated_at).toLocaleString()}
          </Descriptions.Item>
          <Descriptions.Item label="Description" span={2}>
            {product?.description || 'No description provided'}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: 'analytics',
      label: 'Analytics',
      children: (
        <div className="p-6">
          <Row gutter={[24, 24]}>
            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center">
                <Statistic
                  title="Total Orders"
                  value={product?.order_items_count || 0}
                  prefix={<ShoppingOutlined />}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center">
                <Statistic
                  title="Total Revenue"
                  value={product?.total_revenue || 0}
                  prefix={<DollarOutlined />}
                  precision={2}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center">
                <Statistic
                  title="Current Stock"
                  value={product?.stock_qty || 0}
                  prefix={<StockOutlined />}
                  valueStyle={{ color: getStockStatus(product?.stock_qty).color }}
                />
              </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
              <Card className="text-center">
                <Statistic
                  title="Profit Margin"
                  value={product?.profit_margin || 0}
                  suffix="%"
                  precision={1}
                />
              </Card>
            </Col>
          </Row>
        </div>
      ),
    },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Product not found</p>
        <Button onClick={() => navigate('/products')} className="mt-4">
          Back to Products
        </Button>
      </div>
    );
  }

  const stockStatus = getStockStatus(product.stock_qty);

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <Button
            icon={<ArrowLeftOutlined />}
            onClick={() => navigate('/products')}
          >
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-[#1b1c1c] mb-1">
              {product?.name}
            </h2>
            <p className="text-[#414755]">
              Product details and inventory management
            </p>
          </div>
        </div>
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => navigate(`/products/${id}/edit`)}
          >
            Edit Product
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          >
            Delete Product
          </Button>
        </Space>
      </div>

      {/* Statistics Row */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="Price"
              value={formatPrice(product?.price)}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#0057c2', fontSize: '24px' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="Stock Status"
              value={stockStatus.text}
              valueStyle={{ color: stockStatus.color }}
              prefix={<span>{stockStatus.icon}</span>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="Category"
              value={product?.category?.name || 'N/A'}
              prefix={<TagOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="rounded-xl">
            <Statistic
              title="Created Date"
              value={new Date(product?.created_at).toLocaleDateString()}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Product Image and Info */}
      <Card className="rounded-xl mb-6">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div className="text-center">
              {product?.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  className="rounded-lg"
                  width={250}
                  height={250}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="w-64 h-64 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                  <ShoppingOutlined className="text-6xl text-gray-400" />
                </div>
              )}
            </div>
          </Col>
          <Col xs={24} md={16}>
            <div className="space-y-4">
              <div>
                <Title level={4}>{product?.name}</Title>
                <Text type="secondary">SKU: {product?.sku}</Text>
              </div>
              <Divider />
              <div>
                <Title level={5}>Description</Title>
                <Paragraph>{product?.description || 'No description available'}</Paragraph>
              </div>
              <Divider />
              <div className="flex gap-6">
                <div>
                  <Text type="secondary">Price</Text>
                  <Title level={3} className="text-primary mb-0">
                    {formatPrice(product?.price)}
                  </Title>
                </div>
                <div>
                  <Text type="secondary">Stock Quantity</Text>
                  <Title level={3} className="mb-0">
                    {product?.stock_qty || 0}
                  </Title>
                </div>
                <div>
                  <Text type="secondary">Status</Text>
                  <div className="mt-1">
                    <Tag color={product?.active ? 'success' : 'default'} className="text-sm">
                      {product?.active ? 'Active' : 'Inactive'}
                    </Tag>
                  </div>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>

      {/* Tabs Section */}
      <Card className="rounded-xl">
        <Tabs items={items} defaultActiveKey="details" />
      </Card>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <Card title="Related Products" className="rounded-xl mt-6">
          <Table
            columns={relatedColumns}
            dataSource={relatedProducts}
            rowKey="id"
            pagination={false}
            size="small"
          />
        </Card>
      )}

      {/* Update Stock Modal */}
      <Modal
        title="Update Stock Quantity"
        open={stockModalVisible}
        onCancel={() => setStockModalVisible(false)}
        footer={[
          <Button key="cancel" onClick={() => setStockModalVisible(false)} icon={<CloseOutlined />}>
            Cancel
          </Button>,
          <Button
            key="submit"
            type="primary"
            loading={updatingStock}
            onClick={handleUpdateStock}
            icon={<SaveOutlined />}
          >
            Update Stock
          </Button>,
        ]}
      >
        <Form layout="vertical">
          <Form.Item label="Product Name">
            <Text strong>{product?.name}</Text>
          </Form.Item>
          <Form.Item label="Current Stock">
            <Text type="danger">{product?.stock_qty || 0} units</Text>
          </Form.Item>
          <Form.Item label="New Stock Quantity" required>
            <InputNumber
              min={0}
              value={stockValue}
              onChange={(value) => setStockValue(value)}
              className="w-full"
              size="large"
              placeholder="Enter new stock quantity"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ProductDetail;