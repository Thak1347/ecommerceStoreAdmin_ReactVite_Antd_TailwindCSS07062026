import { useEffect, useState } from 'react';
import { Modal, Form, Input, InputNumber, Select, Button, message, Upload, Image as AntImage } from 'antd';
import { PlusOutlined, UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import API from '../../api/axios';
import { createProduct, updateProduct } from '../../store/slices/productSlice';

const { Option } = Select;
const { TextArea } = Input;

const ProductForm = ({ visible, onClose, editingProduct, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    if (visible && editingProduct) {
      // Set form values when editing
      form.setFieldsValue({
        name: editingProduct.name,
        description: editingProduct.description,
        price: editingProduct.price,
        stock_qty: editingProduct.stock_qty,
        category_id: editingProduct.category_id,
        sku: editingProduct.sku,
        active: editingProduct.active,
      });
      setImageUrl(editingProduct.image_url);
      setImageFile(null);
    } else if (visible && !editingProduct) {
      // Reset form when adding new product
      form.resetFields();
      form.setFieldsValue({
        price: 0,
        stock_qty: 0,
        active: true,
      });
      setImageUrl(null);
      setImageFile(null);
    }
  }, [visible, editingProduct, form]);

  const fetchCategories = async () => {
    try {
      const response = await API.get('/categories');
      const categoriesData = response.data.data || response.data;
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      message.error('Failed to load categories');
      setCategories([]);
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      // Prepare form data with image
      const submitData = new FormData();
      submitData.append('name', values.name);
      submitData.append('sku', values.sku);
      submitData.append('category_id', values.category_id);
      submitData.append('description', values.description || '');
      submitData.append('price', values.price);
      submitData.append('stock_qty', values.stock_qty);
      submitData.append('active', values.active !== undefined ? values.active : true);
      
      if (imageFile) {
        submitData.append('image', imageFile);
      }

      if (editingProduct) {
        // For update, we need to use POST with _method PUT for file uploads
        submitData.append('_method', 'PUT');
        const response = await API.post(`/products/${editingProduct.id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Product updated successfully');
      } else {
        const response = await API.post('/products', submitData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        message.success('Product created successfully');
      }
      
      form.resetFields();
      setImageFile(null);
      setImageUrl(null);
      if (onSuccess) onSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to save product:', error);
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          message.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        message.error(error.response?.data?.message || 'Failed to save product');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    form.resetFields();
    setImageFile(null);
    setImageUrl(null);
    onClose();
  };

  const handleImageUpload = (file) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('You can only upload image files!');
      return false;
    }
    
    const isLt2M = file.size / 1024 / 1024 < 2;
    if (!isLt2M) {
      message.error('Image must be smaller than 2MB!');
      return false;
    }
    
    setImageFile(file);
    setImageUrl(URL.createObjectURL(file));
    return false;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl(null);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Modal
      title={editingProduct ? 'Edit Product' : 'Add New Product'}
      open={visible}
      onCancel={handleCancel}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          loading={loading} 
          onClick={handleSubmit}
          className="bg-primary"
        >
          {editingProduct ? 'Update' : 'Create'}
        </Button>,
      ]}
      destroyOnClose
      width={700}
      className="product-form-modal"
    >
      <Form
        form={form}
        layout="vertical"
        initialValues={{
          price: 0,
          stock_qty: 0,
          active: true,
        }}
      >
        <div className="grid gap-4">
          <div >
            <Form.Item
              name="name"
              label="Product Name"
              rules={[
                { required: true, message: 'Please enter product name' },
                { min: 2, message: 'Product name must be at least 2 characters' },
                { max: 100, message: 'Product name cannot exceed 100 characters' }
              ]}
            >
              <Input 
                placeholder="Enter product name" 
                size="large"
              />
            </Form.Item>
          </div>

          <div>
            <Form.Item
              name="sku"
              label="SKU (Stock Keeping Unit)"
              rules={[
                { required: true, message: 'Please enter SKU' },
                { pattern: /^[A-Za-z0-9-]+$/, message: 'SKU can only contain letters, numbers, and hyphens' }
              ]}
            >
              <Input 
                placeholder="Enter SKU (e.g., PROD-001)" 
                size="large"
              />
            </Form.Item>
          </div>
        </div>

        <div>
          <div>
            <Form.Item
              name="category_id"
              label="Category"
              rules={[{ required: true, message: 'Please select category' }]}
            >
              <Select 
                placeholder="Select category"
                size="large"
              >
                {Array.isArray(categories) && categories.map(category => (
                  <Option key={category.id} value={category.id}>
                    {category.name}
                  </Option>
                ))}
              </Select>
            </Form.Item>
          </div>

          <div>
            <Form.Item
              name="active"
              label="Status"
              rules={[{ required: true }]}
            >
              <Select size="large">
                <Option value={true}>Active</Option>
                <Option value={false}>Inactive</Option>
              </Select>
            </Form.Item>
          </div>
        </div>

        <Form.Item
          name="description"
          label="Description"
          rules={[
            { max: 500, message: 'Description cannot exceed 500 characters' }
          ]}
        >
          <TextArea 
            rows={4} 
            placeholder="Enter product description"
            showCount
            maxLength={500}
          />
        </Form.Item>

        <div>
          <Form.Item
            name="price"
            label="Price"
            rules={[
              { required: true, message: 'Please enter price' },
              { type: 'number', min: 0, message: 'Price cannot be negative' }
            ]}
          >
            <InputNumber
              min={0}
              step={0.01}
              precision={2}
              className="w-full"
              placeholder="0.00"
              size="large"
              formatter={value => `$ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
              parser={value => value.replace(/\$\s?|(,*)/g, '')}
            />
          </Form.Item>

          <Form.Item
            name="stock_qty"
            label="Stock Quantity"
            rules={[
              { required: true, message: 'Please enter stock quantity' },
              { type: 'number', min: 0, message: 'Stock cannot be negative' }
            ]}
          >
            <InputNumber 
              min={0} 
              className="w-full" 
              placeholder="0"
              size="large"
            />
          </Form.Item>
        </div>

        {/* Image Upload Section */}
        <Form.Item label="Product Image">
          <div className="flex flex-col items-start gap-4">
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={handleImageUpload}
              accept="image/*"
            >
              {imageUrl ? (
                <div className="relative group">
                  <AntImage
                    src={imageUrl}
                    alt="product"
                    width={100}
                    height={100}
                    className="rounded-lg object-cover"
                    preview={false}
                  />
                  <button
                    className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                  >
                    <DeleteOutlined className="text-xs" />
                  </button>
                </div>
              ) : (
                uploadButton
              )}
            </Upload>
            <p className="text-xs text-gray-500">
              Recommended: 400x400px. Max size 2MB. Supported formats: JPG, PNG, GIF
            </p>
          </div>
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ProductForm;