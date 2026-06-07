import { useEffect, useState } from 'react';
import { Modal, Form, Input, Switch, Upload, message, Spin } from 'antd';
import { PlusOutlined, LoadingOutlined } from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { createCategory, updateCategory } from '../../store/slices/categorySlice';

const { TextArea } = Input;

const CategoryForm = ({ visible, onClose, editingCategory, onSuccess }) => {
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (visible) {
      if (editingCategory) {
        form.setFieldsValue({
          name: editingCategory.name,
          description: editingCategory.description,
          active: editingCategory.active,
        });
        setImageUrl(editingCategory.image_url);
        setImageFile(null);
      } else {
        form.resetFields();
        setImageUrl(null);
        setImageFile(null);
      }
    }
  }, [editingCategory, form, visible]);

  const handleSubmit = async (values) => {
    setLoading(true);
    try {
      // Prepare data for submission
      const submitData = {
        name: values.name,
        description: values.description || '',
        active: values.active !== undefined ? values.active : true,
      };
      
      // Add image file if it exists
      if (imageFile) {
        submitData.image = imageFile;
      }
      
      if (editingCategory) {
        await dispatch(updateCategory({ id: editingCategory.id, data: submitData })).unwrap();
        message.success('Category updated successfully');
        if (onSuccess) onSuccess();
      } else {
        await dispatch(createCategory(submitData)).unwrap();
        message.success('Category created successfully');
      }
      onClose();
      form.resetFields();
      setImageUrl(null);
      setImageFile(null);
    } catch (error) {
      if (error.response?.data?.errors) {
        const errors = error.response.data.errors;
        Object.keys(errors).forEach(key => {
          message.error(`${key}: ${errors[key][0]}`);
        });
      } else {
        message.error(error.response?.data?.message || error.message || 'Operation failed');
      }
    } finally {
      setLoading(false);
    }
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
    
    setUploading(true);
    // Simulate upload delay (optional)
    setTimeout(() => {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
      setUploading(false);
    }, 500);
    
    return false;
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    setImageUrl(null);
  };

  const uploadButton = (
    <div>
      {uploading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>{uploading ? 'Uploading...' : 'Upload'}</div>
    </div>
  );

  return (
    <Modal
      title={editingCategory ? 'Edit Category' : 'Add Category'}
      open={visible}
      onCancel={() => {
        onClose();
        form.resetFields();
        setImageUrl(null);
        setImageFile(null);
      }}
      onOk={() => form.submit()}
      confirmLoading={loading}
      width={600}
      destroyOnClose
      okText={editingCategory ? 'Update' : 'Create'}
      cancelText="Cancel"
    >
      <Spin spinning={loading} tip="Saving category...">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item 
            name="name" 
            label="Category Name" 
            rules={[
              { required: true, message: 'Please enter category name' },
              { min: 2, message: 'Category name must be at least 2 characters' },
              { max: 100, message: 'Category name cannot exceed 100 characters' }
            ]}
          >
            <Input 
              placeholder="Enter category name" 
              size="large"
              disabled={loading}
            />
          </Form.Item>
          
          <Form.Item 
            name="description" 
            label="Description"
            rules={[
              { max: 500, message: 'Description cannot exceed 500 characters' }
            ]}
          >
            <TextArea 
              rows={3} 
              placeholder="Enter description (optional)" 
              disabled={loading}
              showCount
              maxLength={500}
            />
          </Form.Item>
          
          <Form.Item 
            name="image" 
            label="Category Image"
            extra="Recommended: 400x400px. Max size 2MB. Supported formats: JPG, PNG, GIF"
          >
            <Upload
              name="image"
              listType="picture-card"
              showUploadList={false}
              beforeUpload={handleImageUpload}
              disabled={loading}
              accept="image/*"
            >
              {imageUrl ? (
                <div className="relative group">
                  <img 
                    src={imageUrl} 
                    alt="category" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                  <button
                    className="absolute top-0 right-0 -mt-2 -mr-2 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white hover:bg-red-600 transition-colors"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveImage();
                    }}
                    disabled={loading}
                  >
                    ×
                  </button>
                </div>
              ) : (
                uploadButton
              )}
            </Upload>
          </Form.Item>
          
          <Form.Item 
            name="active" 
            label="Status" 
            valuePropName="checked" 
            initialValue={true}
            help={editingCategory && !editingCategory.active && "Hidden categories won't appear in the store"}
          >
            <Switch 
              checkedChildren="Active" 
              unCheckedChildren="Hidden" 
              disabled={loading}
            />
          </Form.Item>
        </Form>
      </Spin>
    </Modal>
  );
};

export default CategoryForm;