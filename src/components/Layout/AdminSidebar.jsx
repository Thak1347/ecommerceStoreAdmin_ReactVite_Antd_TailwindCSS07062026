import { NavLink } from 'react-router-dom';
import { 
  DashboardOutlined, 
  AppstoreOutlined,
  ShoppingOutlined, 
  ShoppingCartOutlined, 
  UserOutlined, 
  SettingOutlined,
  LogoutOutlined,
  QuestionCircleOutlined,
  CustomerServiceOutlined,
  MailOutlined,
  MessageOutlined,
  PhoneOutlined
} from '@ant-design/icons';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { Modal, Button, Space, message, Tooltip } from 'antd';
import { logout } from '../../store/slices/authSlice';

const menuItems = [
  { path: '/', icon: DashboardOutlined, label: 'Dashboard' },
  { path: '/categories', icon: AppstoreOutlined, label: 'Categories' },
  { path: '/products', icon: ShoppingOutlined, label: 'Products' },
  { path: '/orders', icon: ShoppingCartOutlined, label: 'Orders' },
  { path: '/customers', icon: UserOutlined, label: 'Customers' },
  { path: '/profile', icon: SettingOutlined, label: 'Profile' },
];

const supportItems = [
    { 
    key: 'email', 
    icon: MailOutlined, 
    label: 'Email Support', 
    value: 'chounpithak@gmail.com',
    action: () => window.location.href = 'mailto:chounpithak@gmail.com?subject=Support%20Request'
    },
  { 
    key: 'phone', 
    icon: PhoneOutlined, 
    label: 'Phone Support', 
    value: '+1 (555) 123-4567',
    action: () => window.location.href = 'tel:+15551234567'
  },
  { 
    key: 'livechat', 
    icon: MessageOutlined, 
    label: 'Live Chat', 
    value: 'Available 24/7',
    action: () => message.info('Live chat coming soon...')
  },
];

const AdminSidebar = () => {
  const dispatch = useDispatch();
  const [helpModalVisible, setHelpModalVisible] = useState(false);
  const [supportModalVisible, setSupportModalVisible] = useState(false);

  const handleLogout = () => {
    Modal.confirm({
      title: 'Logout',
      content: 'Are you sure you want to logout?',
      okText: 'Yes, Logout',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        dispatch(logout());
      },
    });
  };

  const handleCopySupportInfo = (text) => {
    navigator.clipboard.writeText(text);
    message.success('Contact information copied to clipboard');
  };

  return (
    <>
      <aside className="fixed left-0 top-0 w-[260px] h-full bg-white border-r border-gray-200 flex flex-col z-50">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-[#0057c2] to-[#0057c2]/70 bg-clip-text text-transparent">
            AdminPro
          </h1>
          <p className="text-xs text-[#414755] mt-1">Ecommerce Manager</p>
        </div>
        
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                  isActive
                    ? 'text-[#0057c2] bg-[#0057c2]/10 border-r-4 border-[#0057c2]'
                    : 'text-[#414755] hover:bg-gray-50 hover:text-[#0057c2]'
                }`
              }
            >
              <item.icon className="text-xl" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          ))}
        </nav>
        
        {/* Help Section */}
        <div className="border-t border-gray-100 pt-3 pb-2 px-3">
          <div className="px-4 py-2 mb-1">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Support</p>
          </div>
          
          {/* Help Button */}
          <button
            onClick={() => setHelpModalVisible(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#414755] hover:bg-blue-50 hover:text-[#0057c2] rounded-lg transition-all duration-200 group"
          >
            <QuestionCircleOutlined className="text-xl group-hover:scale-105 transition-transform" />
            <span className="text-sm font-medium">Help & Guide</span>
          </button>
          
          {/* Support Button */}
          <button
            onClick={() => setSupportModalVisible(true)}
            className="w-full flex items-center gap-3 px-4 py-3 text-[#414755] hover:bg-blue-50 hover:text-[#0057c2] rounded-lg transition-all duration-200 group"
          >
            <CustomerServiceOutlined className="text-xl group-hover:scale-105 transition-transform" />
            <span className="text-sm font-medium">Contact Support</span>
          </button>
        </div>
        
        {/* Logout Button */}
        <div className="p-4 border-t border-gray-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
          >
            <LogoutOutlined className="text-xl group-hover:scale-105 transition-transform" />
            <span className="text-sm font-medium">Logout</span>
          </button>
        </div>
      </aside>

      {/* Help Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <QuestionCircleOutlined className="text-primary text-xl" />
            <span>Help & Documentation</span>
          </div>
        }
        open={helpModalVisible}
        onCancel={() => setHelpModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setHelpModalVisible(false)}>
            Close
          </Button>
        ]}
        width={600}
      >
        <div className="space-y-6">
          {/* Quick Guide */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Quick Start Guide</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">1</div>
                <div>
                  <p className="font-medium text-gray-900">Manage Products</p>
                  <p className="text-sm text-gray-500">Add, edit, or remove products from your inventory. Track stock levels and pricing.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">2</div>
                <div>
                  <p className="font-medium text-gray-900">Process Orders</p>
                  <p className="text-sm text-gray-500">View and manage customer orders. Update order status and track shipments.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">3</div>
                <div>
                  <p className="font-medium text-gray-900">Manage Customers</p>
                  <p className="text-sm text-gray-500">View customer profiles, order history, and manage account status.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold">4</div>
                <div>
                  <p className="font-medium text-gray-900">Configure Settings</p>
                  <p className="text-sm text-gray-500">Update store information, notification preferences, and security settings.</p>
                </div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
            <div className="space-y-3">
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                  How do I add a new product?
                </summary>
                <p className="mt-2 text-sm text-gray-500 pl-4">
                  Navigate to Products → Click "Add Product" → Fill in product details → Save.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                  How do I update order status?
                </summary>
                <p className="mt-2 text-sm text-gray-500 pl-4">
                  Go to Orders → Click on the order → Select new status from dropdown → Confirm.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                  How to export data?
                </summary>
                <p className="mt-2 text-sm text-gray-500 pl-4">
                  Each section has an "Export CSV" button to download data in CSV format.
                </p>
              </details>
              <details className="group">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-primary transition-colors">
                  How to change my password?
                </summary>
                <p className="mt-2 text-sm text-gray-500 pl-4">
                  Go to Profile → Click "Change Password" tab → Enter old and new password → Save.
                </p>
              </details>
            </div>
          </div>

          {/* System Status */}
          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              <span className="text-sm font-medium text-green-800">System Status: Operational</span>
            </div>
            <p className="text-xs text-green-700 mt-1">All systems are functioning normally.</p>
          </div>
        </div>
      </Modal>

      {/* Support Modal */}
      <Modal
        title={
          <div className="flex items-center gap-2">
            <CustomerServiceOutlined className="text-primary text-xl" />
            <span>Contact Support</span>
          </div>
        }
        open={supportModalVisible}
        onCancel={() => setSupportModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setSupportModalVisible(false)}>
            Close
          </Button>
        ]}
        width={500}
      >
        <div className="space-y-6">
          <p className="text-gray-600">
            Our support team is available 24/7 to assist you with any issues or questions.
          </p>

          {/* Support Options */}
          <div className="space-y-3">
            {supportItems.map((item) => (
              <div
                key={item.key}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={item.action}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <item.icon className="text-primary text-lg" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{item.label}</p>
                    <p className="text-sm text-gray-500">{item.value}</p>
                  </div>
                </div>
                <Tooltip title="Copy">
                  <Button
                    type="text"
                    size="small"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleCopySupportInfo(item.value);
                    }}
                  >
                    Copy
                  </Button>
                </Tooltip>
              </div>
            ))}
          </div>

          {/* Support Hours */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-semibold text-blue-800 mb-2">Support Hours</h4>
            <div className="space-y-1 text-sm text-blue-700">
              <p>Monday - Friday: 9:00 AM - 9:00 PM (EST)</p>
              <p>Saturday: 10:00 AM - 6:00 PM (EST)</p>
              <p>Sunday: 10:00 AM - 4:00 PM (EST)</p>
              <p className="mt-2 font-medium">Emergency Support: 24/7</p>
            </div>
          </div>

          {/* Submit Ticket Link */}
            <Button 
            type="primary" 
            block 
            className="mt-2"
            onClick={() => {
                message.info('Opening Gmail in a new tab...');
                // Targets Gmail's active web app interface directly
                const gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1&to=chounpithak@gmail.com&su=Support%20Request';
                window.open(gmailUrl, '_blank', 'noopener,noreferrer');
            }}
            >
            Submit Support Ticket
            </Button>

          <p className="text-xs text-gray-400 text-center">
            Average response time: &lt; 2 hours
          </p>
        </div>
      </Modal>
    </>
  );
};

export default AdminSidebar;