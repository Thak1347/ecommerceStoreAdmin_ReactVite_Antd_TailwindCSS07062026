//

import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Card, Form, Input, Button, message, Tabs, Alert } from 'antd';
import { UserOutlined, LockOutlined } from '@ant-design/icons';
import { updateProfile, changePassword } from '../store/slices/authSlice';

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [passLoading, setPassLoading] = useState(false);

  const handleProfileUpdate = async (values) => {
    setLoading(true);
    try {
      await dispatch(updateProfile(values)).unwrap();
      message.success('Profile updated successfully');
    } catch (error) {
      message.error(error.message || 'Update failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (values) => {
    setPassLoading(true);
    try {
      await dispatch(changePassword(values)).unwrap();
      message.success('Password changed successfully');
    } catch (error) {
      message.error(error.response?.data?.message || 'Password change failed');
    } finally {
      setPassLoading(false);
    }
  };

  const items = [
    {
      key: 'profile',
      label: 'Profile Information',
      icon: <UserOutlined />,
      children: (
        <Form layout="vertical" onFinish={handleProfileUpdate} initialValues={user}>
          <Form.Item name="name" label="Full Name" rules={[{ required: true }]}>
            <Input placeholder="Enter your name" />
          </Form.Item>
          <Form.Item name="email" label="Email Address" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="Enter your email" />
          </Form.Item>
          <Form.Item name="phone" label="Phone Number">
            <Input placeholder="Enter your phone number" />
          </Form.Item>
          <Form.Item name="address" label="Address">
            <Input.TextArea rows={3} placeholder="Enter your address" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading}>
              Update Profile
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: 'password',
      label: 'Change Password',
      icon: <LockOutlined />,
      children: (
        <Form layout="vertical" onFinish={handlePasswordChange}>
          <Form.Item
            name="current_password"
            label="Current Password"
            rules={[{ required: true, message: 'Please enter your current password' }]}
          >
            <Input.Password placeholder="Enter current password" />
          </Form.Item>
          <Form.Item
            name="new_password"
            label="New Password"
            rules={[
              { required: true, message: 'Please enter new password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter new password" />
          </Form.Item>
          <Form.Item
            name="new_password_confirmation"
            label="Confirm New Password"
            dependencies={['new_password']}
            rules={[
              { required: true, message: 'Please confirm your password' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('new_password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Passwords do not match'));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirm new password" />
          </Form.Item>
          <Form.Item>
            <Button type="primary" htmlType="submit" loading={passLoading}>
              Change Password
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <div className="mb-6 relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <h2 className="text-2xl font-bold text-on-surface mb-1">Profile Settings</h2>
        <p className="text-on-surface-variant">Manage your account information and security settings</p>
      </div>
      
      <Card className="rounded-xl max-w-2xl">
        <Tabs items={items} />
      </Card>
    </div>
  );
};

export default Profile;