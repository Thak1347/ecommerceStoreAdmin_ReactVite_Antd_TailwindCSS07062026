import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, message, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import API from '../../api/axios';
import ProductForm from './ProductForm';

const ProductEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await API.get(`/products/${id}`);
      setProduct(response.data);
    } catch (error) {
      message.error('Product not found');
      navigate('/products');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    message.success('Product updated successfully');
    navigate(`/products/${id}`);
  };

  const handleCancel = () => {
    navigate(`/products/${id}`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  if (!product) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
          Back to Product
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-[#1b1c1c] mb-1">Edit Product</h2>
          <p className="text-[#414755]">Update product information</p>
        </div>
      </div>
      
      <Card className="rounded-xl">
        <ProductForm
          visible={true}
          onClose={handleCancel}
          editingProduct={product}
          onSuccess={handleSuccess}
        />
      </Card>
    </div>
  );
};

export default ProductEdit;