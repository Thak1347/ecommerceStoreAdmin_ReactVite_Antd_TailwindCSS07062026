import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, Descriptions, Tag, Button, Space, 
  Image, message, Row, Col, Statistic, Table, Tabs 
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ShoppingOutlined,
  EyeOutlined,
  CalendarOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { deleteCategory } from '../../store/slices/categorySlice';
import LoadingSpinner, { TableSkeleton, DetailSkeleton } from '../../components/Common/LoadingSpinner';
import API from '../../api/axios';

const CategoryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productsLoading, setProductsLoading] = useState(false);

  useEffect(() => {
    fetchCategoryDetail();
  }, [id]);

  const fetchCategoryDetail = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/categories/${id}`);
      setCategory(response.data);
      fetchCategoryProducts(response.data.id);
    } catch (error) {
      console.error('Failed to fetch category:', error);
      message.error('Category not found');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const fetchCategoryProducts = async (categoryId) => {
    setProductsLoading(true);
    try {
      const response = await API.get('/products', { 
        params: { category_id: categoryId, per_page: 10 } 
      });
      setProducts(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
    } finally {
      setProductsLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await dispatch(deleteCategory(id)).unwrap();
      message.success('Category deleted successfully');
      navigate('/categories');
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const productColumns = [
    {
      title: 'Image',
      dataIndex: 'image_url',
      key: 'image',
      width: 70,
      render: (url) => (
        url ? (
          <Image src={url} width={40} height={40} className="rounded object-cover" />
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
      title: 'SKU',
      dataIndex: 'sku',
      key: 'sku',
      render: (text) => <code className="font-mono text-sm">{text}</code>,
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price) => {
        const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
        const formattedPrice = !isNaN(numericPrice) ? numericPrice.toFixed(2) : '0.00';
        return <span className="font-mono font-bold">${formattedPrice}</span>;
      },
    },
    {
      title: 'Stock',
      dataIndex: 'stock_qty',
      key: 'stock',
      render: (stock) => (
        <Tag color={stock > 0 ? 'green' : 'red'}>
          {stock > 0 ? `${stock} units` : 'Out of Stock'}
        </Tag>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'active',
      key: 'status',
      render: (active) => (
        <Tag color={active ? 'success' : 'default'}>
          {active ? 'Active' : 'Inactive'}
        </Tag>
      ),
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
      key: 'products',
      label: `Products (${products.length})`,
      children: productsLoading ? (
        <div className="mt-4">
          <TableSkeleton rows={5} columns={7} />
        </div>
      ) : (
        <Table
          columns={productColumns}
          dataSource={products}
          rowKey="id"
          pagination={false}
          className="mt-4"
        />
      ),
    },
    {
      key: 'analytics',
      label: 'Analytics',
      children: (
        <div className="p-6 text-center text-gray-500">
          Category analytics coming soon...
        </div>
      ),
    },
  ];

  // Show skeleton loader while loading category details
  if (loading) {
    return <DetailSkeleton />;
  }

  if (!category) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Category not found</p>
        <Button onClick={() => navigate('/categories')} className="mt-4">
          Back to Categories
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
            onClick={() => navigate('/categories')}
          >
            Back
          </Button>
          <div>
            <h2 className="text-2xl font-bold text-[#1b1c1c] mb-1">
              {category?.name}
            </h2>
            <p className="text-[#414755]">
              Category details and products
            </p>
          </div>
        </div>
        <Space>
          <Button 
            icon={<EditOutlined />}
            onClick={() => navigate(`/categories/${id}/edit`)}
          >
            Edit Category
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />}
            onClick={handleDelete}
          >
            Delete Category
          </Button>
        </Space>
      </div>

      {/* Statistics Row */}
      <Row gutter={[24, 24]} className="mb-6">
        <Col xs={24} sm={8}>
          <Card className="rounded-xl">
            <Statistic
              title="Total Products"
              value={products.length}
              prefix={<ShoppingOutlined />}
              valueStyle={{ color: '#0057c2' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-xl">
            <Statistic
              title="Status"
              value={category?.active ? 'Active' : 'Hidden'}
              valueStyle={{ color: category?.active ? '#52c41a' : '#faad14' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card className="rounded-xl">
            <Statistic
              title="Created Date"
              value={category?.created_at ? new Date(category.created_at).toLocaleDateString() : 'N/A'}
              prefix={<CalendarOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* Category Information */}
      <Card title="Category Information" className="rounded-xl mb-6">
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div className="text-center">
              {category?.image_url ? (
                <Image 
                  src={category.image_url} 
                  alt={category.name}
                  className="rounded-lg"
                  width={200}
                  height={200}
                  style={{ objectFit: 'cover' }}
                />
              ) : (
                <div className="w-48 h-48 bg-gray-100 rounded-lg flex items-center justify-center mx-auto">
                  <ShoppingOutlined className="text-4xl text-gray-400" />
                </div>
              )}
            </div>
          </Col>
          <Col xs={24} md={16}>
            <Descriptions column={1} bordered>
              <Descriptions.Item label="Category Name">
                <span className="font-semibold text-lg">{category?.name}</span>
              </Descriptions.Item>
              <Descriptions.Item label="Slug">
                <code className="font-mono text-primary">/{category?.slug}</code>
              </Descriptions.Item>
              <Descriptions.Item label="Description">
                {category?.description || 'No description provided'}
              </Descriptions.Item>
              <Descriptions.Item label="Status">
                <Tag color={category?.active ? 'green' : 'default'}>
                  {category?.active ? 'Active' : 'Hidden'}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="Created At">
                {category?.created_at ? new Date(category.created_at).toLocaleString() : 'N/A'}
              </Descriptions.Item>
              <Descriptions.Item label="Last Updated">
                {category?.updated_at ? new Date(category.updated_at).toLocaleString() : 'N/A'}
              </Descriptions.Item>
            </Descriptions>
          </Col>
        </Row>
      </Card>

      {/* Products Tab */}
      <Card className="rounded-xl">
        <Tabs items={items} defaultActiveKey="products" />
      </Card>
    </div>
  );
};

export default CategoryDetail;