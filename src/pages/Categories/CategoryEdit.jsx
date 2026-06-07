import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, message, Button } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import LoadingSpinner, { DetailSkeleton, FormSkeleton } from '../../components/Common/LoadingSpinner';
import API from '../../api/axios';
import CategoryForm from './CategoryForm';

const CategoryEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [category, setCategory] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    setLoading(true);
    try {
      const response = await API.get(`/categories/${id}`);
      setCategory(response.data);
    } catch (error) {
      console.error('Failed to fetch category:', error);
      message.error('Category not found');
      navigate('/categories');
    } finally {
      setLoading(false);
    }
  };

  const handleSuccess = () => {
    message.success('Category updated successfully');
    navigate(`/categories/${id}`);
  };

  const handleCancel = () => {
    navigate(`/categories/${id}`);
  };

  // Show skeleton loader while loading
  if (loading) {
    return (
      <div>
        <div className="flex items-center gap-4 mb-6">
          <div className="h-10 w-10 bg-gray-200 rounded animate-pulse"></div>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
        <Card className="rounded-xl">
          <FormSkeleton fields={4} />
        </Card>
      </div>
    );
  }

  if (!category) {
    return null;
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={handleCancel}>
          Back to Category
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-[#1b1c1c] mb-1">Edit Category</h2>
          <p className="text-[#414755]">Update category information</p>
        </div>
      </div>
      
      <Card className="rounded-xl">
        <CategoryForm
          visible={true}
          onClose={handleCancel}
          editingCategory={category}
          onSuccess={handleSuccess}
        />
      </Card>
    </div>
  );
};

export default CategoryEdit;