import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Spin, message, Button, Form, Input, Switch, Space } from 'antd';
import { ArrowLeftOutlined, SaveOutlined } from '@ant-design/icons';
import API from '../../api/axios';
import { useDispatch } from 'react-redux';
import { fetchCustomers } from '../../store/slices/customerSlice';

const CustomerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [customer, setCustomer] = useState(null);

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const fetchCustomer = async () => {
    try {
      const response = await API.get(`/customers/${id}`);
      setCustomer(response.data);
      form.setFieldsValue({
        name: response.data.name,
        email: response.data.email,
        phone: response.data.phone,
        address: response.data.address,
        active: response.data.active,
      });
    } catch (error) {
      message.error('Customer not found');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values) => {
    setSubmitting(true);
    try {
      await API.put(`/customers/${id}`, values);
      message.success('Customer updated successfully');
      dispatch(fetchCustomers());
      navigate(`/customers/${id}`);
    } catch (error) {
      message.error(error.response?.data?.message || 'Failed to update customer');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(`/customers/${id}`)}>
          Back to Customer
        </Button>
        <div>
          <h2 className="text-2xl font-bold text-[#1b1c1c] mb-1">Edit Customer</h2>
          <p className="text-[#414755]">Update customer information</p>
        </div>
      </div>

      <Card className="rounded-xl max-w-2xl">
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            name="name"
            label="Full Name"
            rules={[{ required: true, message: 'Please enter customer name' }]}
          >
            <Input size="large" placeholder="Enter customer name" />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter email' },
              { type: 'email', message: 'Please enter a valid email' }
            ]}
          >
            <Input size="large" placeholder="Enter email address" />
          </Form.Item>

          <Form.Item name="phone" label="Phone Number">
            <Input size="large" placeholder="Enter phone number" />
          </Form.Item>

          <Form.Item name="address" label="Address">
            <Input.TextArea rows={3} placeholder="Enter address" />
          </Form.Item>

          <Form.Item name="active" label="Status" valuePropName="checked">
            <Switch checkedChildren="Active" unCheckedChildren="Inactive" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={submitting} icon={<SaveOutlined />}>
                Save Changes
              </Button>
              <Button onClick={() => navigate(`/customers/${id}`)}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default CustomerEdit;