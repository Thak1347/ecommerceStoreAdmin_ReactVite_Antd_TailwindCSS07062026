import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Form, Input, Button, Alert, Card } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { login } from '../store/slices/authSlice';

const Login = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error } = useSelector((state) => state.auth);
  const [form] = Form.useForm();

  const onFinish = async (values) => {
    const result = await dispatch(login(values));
    if (!result.error) {
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg rounded-xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">AdminPro</h1>
          <p className="text-gray-500 mt-2">Sign in to your account</p>
        </div>
        
        {error && (
          <Alert message="Login Failed" description={error} type="error" showIcon className="mb-6" />
        )}
        
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[{ required: true, message: 'Please enter your email' }]}
          >
            <Input prefix={<MailOutlined />} placeholder="admin@example.com" size="large" />
          </Form.Item>
          
          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="••••••" size="large" />
          </Form.Item>
          
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isLoading} block size="large">
              Sign In
            </Button>
          </Form.Item>
        </Form>
        
        <div className="text-center text-sm text-gray-500">
          Demo: admin@example.com / password
        </div>
      </Card>
    </div>
  );
};

export default Login;