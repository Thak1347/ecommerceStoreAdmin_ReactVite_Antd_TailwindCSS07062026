import { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Input, Badge, Dropdown, Avatar, List, Button, Tooltip, message, Modal, Spin } from 'antd';
import { 
  SearchOutlined, 
  BellOutlined, 
  MailOutlined, 
  BulbOutlined,
  UserOutlined,
  LogoutOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ShoppingOutlined,
  UserAddOutlined,
  AppstoreOutlined,
  ShoppingCartOutlined,
  DashboardOutlined,
  CloseOutlined
} from '@ant-design/icons';
import { logout } from '../../store/slices/authSlice';
import API from '../../api/axios';

const AdminHeader = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [allData, setAllData] = useState({
    categories: [],
    products: [],
    orders: [],
    customers: []
  });
  const searchInputRef = useRef(null);

  // Fetch all data for search when search is opened
  useEffect(() => {
    if (searchOpen) {
      fetchSearchData();
    }
  }, [searchOpen]);

  const fetchSearchData = async () => {
    try {
      const [categoriesRes, productsRes, ordersRes, customersRes] = await Promise.all([
        API.get('/categories?per_page=100'),
        API.get('/products?per_page=100'),
        API.get('/orders?per_page=100'),
        API.get('/customers?per_page=100')
      ]);

      setAllData({
        categories: categoriesRes.data.data || [],
        products: productsRes.data.data || [],
        orders: ordersRes.data.data || [],
        customers: customersRes.data.data || []
      });
    } catch (error) {
      console.error('Failed to fetch search data:', error);
    }
  };

  const handleLogout = () => {
    Modal.confirm({
      title: 'Logout',
      content: 'Are you sure you want to logout?',
      okText: 'Yes, Logout',
      okType: 'danger',
      cancelText: 'Cancel',
      onOk: () => {
        dispatch(logout());
        navigate('/login');
      },
    });
  };

  const handleNewOrder = () => {
    navigate('/orders');
    message.success('Redirecting to order management...');
  };

  const handleSearch = (value) => {
    setSearchValue(value);
    
    if (!value.trim()) {
      setSearchResults([]);
      return;
    }

    setSearchLoading(true);
    
    const searchTerm = value.toLowerCase();
    const results = [];

    // Search Categories
    allData.categories.forEach(category => {
      if (category.name?.toLowerCase().includes(searchTerm)) {
        results.push({
          id: category.id,
          type: 'category',
          title: category.name,
          subtitle: category.slug,
          path: `/categories/${category.id}`,
          icon: <AppstoreOutlined />,
          image: category.image_url
        });
      }
    });

    // Search Products
    allData.products.forEach(product => {
      if (product.name?.toLowerCase().includes(searchTerm) || 
          product.sku?.toLowerCase().includes(searchTerm)) {
        results.push({
          id: product.id,
          type: 'product',
          title: product.name,
          subtitle: `SKU: ${product.sku} | $${product.price}`,
          path: `/products/${product.id}`,
          icon: <ShoppingOutlined />,
          image: product.image_url
        });
      }
    });

    // Search Orders
    allData.orders.forEach(order => {
      if (order.order_number?.toLowerCase().includes(searchTerm)) {
        results.push({
          id: order.id,
          type: 'order',
          title: order.order_number,
          subtitle: `$${order.total} | ${order.order_status}`,
          path: `/orders/${order.id}`,
          icon: <ShoppingCartOutlined />
        });
      }
    });

    // Search Customers
    allData.customers.forEach(customer => {
      if (customer.name?.toLowerCase().includes(searchTerm) || 
          customer.email?.toLowerCase().includes(searchTerm)) {
        results.push({
          id: customer.id,
          type: 'customer',
          title: customer.name,
          subtitle: customer.email,
          path: `/customers/${customer.id}`,
          icon: <UserOutlined />
        });
      }
    });

    // Add page navigation results
    const pages = [
      { title: 'Dashboard', path: '/', icon: <DashboardOutlined />, type: 'page' },
      { title: 'Categories', path: '/categories', icon: <AppstoreOutlined />, type: 'page' },
      { title: 'Products', path: '/products', icon: <ShoppingOutlined />, type: 'page' },
      { title: 'Orders', path: '/orders', icon: <ShoppingCartOutlined />, type: 'page' },
      { title: 'Customers', path: '/customers', icon: <UserOutlined />, type: 'page' },
      { title: 'Profile', path: '/profile', icon: <SettingOutlined />, type: 'page' },
    ];

    pages.forEach(page => {
      if (page.title.toLowerCase().includes(searchTerm)) {
        results.push({
          id: `page-${page.title}`,
          type: 'page',
          title: page.title,
          subtitle: 'Navigate to page',
          path: page.path,
          icon: page.icon
        });
      }
    });

    setSearchResults(results.slice(0, 10)); // Limit to 10 results
    setSearchLoading(false);
  };

  const handleResultClick = (path) => {
    setSearchOpen(false);
    setSearchValue('');
    setSearchResults([]);
    navigate(path);
  };

  const handleClearSearch = () => {
    setSearchValue('');
    setSearchResults([]);
    searchInputRef.current?.focus();
  };

  const getTypeColor = (type) => {
    switch(type) {
      case 'category': return 'bg-purple-100 text-purple-600';
      case 'product': return 'bg-blue-100 text-blue-600';
      case 'order': return 'bg-green-100 text-green-600';
      case 'customer': return 'bg-orange-100 text-orange-600';
      case 'page': return 'bg-gray-100 text-gray-600';
      default: return 'bg-primary/10 text-primary';
    }
  };

  // Search results dropdown content
  const searchContent = (
    <div className="w-[500px] max-h-[500px] overflow-y-auto rounded-lg shadow-lg bg-white">
      <div className="p-3 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <SearchOutlined className="text-primary" />
          <span className="font-medium text-gray-700">Search Results</span>
          {searchValue && <span className="text-xs text-gray-400">for "{searchValue}"</span>}
        </div>
      </div>
      
      <div className="p-2">
        {searchLoading && (
          <div className="text-center py-8">
            <Spin size="large" />
            <p className="text-gray-500 mt-2">Searching...</p>
          </div>
        )}
        
        {!searchLoading && searchResults.length === 0 && searchValue && (
          <div className="text-center py-8">
            <SearchOutlined className="text-4xl text-gray-300 mb-2" />
            <p className="text-gray-500">No results found</p>
            <p className="text-xs text-gray-400 mt-2">
              Try searching by name, SKU, order number, or email
            </p>
          </div>
        )}
        
        {searchResults.length > 0 && (
          <>
            <div className="mb-2 px-2 text-xs text-gray-400">
              Found {searchResults.length} result(s)
            </div>
            <List
              dataSource={searchResults}
              renderItem={(item) => (
                <List.Item 
                  className="cursor-pointer hover:bg-gray-50 rounded-lg transition-colors px-2"
                  onClick={() => handleResultClick(item.path)}
                >
                  <List.Item.Meta
                    avatar={
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getTypeColor(item.type)}`}>
                        {item.image ? (
                          <img src={item.image} alt={item.title} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          item.icon
                        )}
                      </div>
                    }
                    title={
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-gray-900">{item.title}</span>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 capitalize">
                          {item.type}
                        </span>
                      </div>
                    }
                    description={
                      <span className="text-sm text-gray-500">
                        {item.subtitle || `Click to view ${item.type} details`}
                      </span>
                    }
                  />
                </List.Item>
              )}
            />
            <div className="mt-2 pt-2 border-t border-gray-100 text-center">
              <Button 
                type="link" 
                size="small"
                className="text-primary"
                onClick={() => {
                  setSearchOpen(false);
                  if (searchResults[0]) {
                    navigate(`/${searchResults[0].type}s`);
                  }
                }}
              >
                View all results →
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  // Mock notifications
  const notifications = [
    { id: 1, type: 'order', title: 'New Order Received', message: 'Order #ORD-8823 has been placed', time: '2 minutes ago', read: false, icon: <ShoppingOutlined /> },
    { id: 2, type: 'customer', title: 'New Customer Registered', message: 'Sarah Johnson created an account', time: '1 hour ago', read: false, icon: <UserAddOutlined /> },
    { id: 3, type: 'stock', title: 'Low Stock Alert', message: 'Wireless Mouse has only 5 units left', time: '3 hours ago', read: true, icon: <WarningOutlined /> },
    { id: 4, type: 'order', title: 'Order Delivered', message: 'Order #ORD-8820 has been delivered', time: '5 hours ago', read: true, icon: <CheckCircleOutlined /> },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  const notificationList = (
    <div className="w-96 max-h-[500px] overflow-y-auto rounded-lg shadow-lg bg-white p-4">
      <div className="flex justify-between items-center p-4 border-b border-gray-100">
        <span className="font-semibold text-gray-900">Notifications</span>
        <Button type="link" size="small" className="text-primary">
          Mark all as read
        </Button>
      </div>
      <List
        dataSource={notifications}
        renderItem={(item) => (
          <List.Item 
            className={`cursor-pointer hover:bg-gray-50 transition-colors ${!item.read ? 'bg-blue-50/30' : ''}`}
            onClick={() => {
              if (item.type === 'order') navigate('/orders');
              if (item.type === 'customer') navigate('/customers');
              if (item.type === 'stock') navigate('/products');
              setNotificationsVisible(false);
            }}
          >
            <List.Item.Meta
              avatar={
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  item.type === 'order' ? 'bg-blue-100 text-blue-600' :
                  item.type === 'customer' ? 'bg-green-100 text-green-600' :
                  'bg-orange-100 text-orange-600'
                }`}>
                  {item.icon}
                </div>
              }
              title={
                <div className="flex justify-between">
                  <span className="font-medium text-gray-900">{item.title}</span>
                  <span className="text-xs text-gray-400">{item.time}</span>
                </div>
              }
              description={<span className="text-sm text-gray-600">{item.message}</span>}
            />
          </List.Item>
        )}
      />
      <div className="p-3 border-t border-gray-100 text-center">
        <Button type="link" className="text-primary" onClick={() => setNotificationsVisible(false)}>
          Close
        </Button>
      </div>
    </div>
  );

  const userMenuItems = [
    { 
      key: 'profile', 
      label: (
        <div className="flex items-center gap-2">
          <UserOutlined />
          <span>Profile</span>
        </div>
      ),
      onClick: () => navigate('/profile')
    },
    { key: 'divider', type: 'divider' },
    { 
      key: 'logout', 
      label: (
        <div className="flex items-center gap-2 text-red-600">
          <LogoutOutlined />
          <span>Logout</span>
        </div>
      ),
      onClick: handleLogout
    },
  ];

  return (
    <>
      <header className="fixed top-0 right-0 w-[calc(100%-260px)] h-16 bg-white/80 backdrop-blur-md border-b border-gray-200 flex items-center justify-between px-6 z-40">
        <div className="flex items-center flex-1 max-w-md">
          <Dropdown
            open={searchOpen}
            onOpenChange={(open) => {
              if (open && searchValue) {
                setSearchOpen(open);
              } else if (!open) {
                setSearchOpen(false);
              }
            }}
            dropdownRender={() => searchContent}
            trigger={['click']}
            placement="bottomLeft"
            className="w-full"
          >
            <div className="relative w-full">
              <Input
                ref={searchInputRef}
                placeholder="Search categories, products, orders, customers..."
                prefix={<SearchOutlined className="text-gray-400" />}
                suffix={
                  searchValue && (
                    <CloseOutlined 
                      className="text-gray-400 cursor-pointer hover:text-gray-600"
                      onClick={handleClearSearch}
                    />
                  )
                }
                value={searchValue}
                onChange={(e) => {
                  setSearchValue(e.target.value);
                  handleSearch(e.target.value);
                  setSearchOpen(true);
                }}
                onFocus={() => {
                  if (searchValue) setSearchOpen(true);
                }}
                className="rounded-lg"
              />
            </div>
          </Dropdown>
        </div>
        
        <div className="flex items-center gap-4">
          <Tooltip title="Theme">
            <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
              <BulbOutlined className="text-xl text-[#414755]" />
            </button>
          </Tooltip>
          
          <Tooltip title="Notifications">
            <Badge count={unreadCount} offset={[-2, 5]}>
              <Dropdown
                open={notificationsVisible}
                onOpenChange={setNotificationsVisible}
                dropdownRender={() => notificationList}
                trigger={['click']}
                placement="bottomRight"
              >
                <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                  <BellOutlined className="text-xl text-[#414755]" />
                </button>
              </Dropdown>
            </Badge>
          </Tooltip>
          
          <Tooltip title="Messages">
            <Badge dot>
              <button className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                <MailOutlined className="text-xl text-[#414755]" />
              </button>
            </Badge>
          </Tooltip>
          
          <div className="h-8 w-px bg-gray-200 mx-2" />
          
          <Tooltip title="New Order">
            <button 
              onClick={handleNewOrder}
              className="bg-[#0057c2] text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#0057c2]/90 transition-all shadow-md hover:shadow-lg"
            >
              New Order
            </button>
          </Tooltip>
          
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight" trigger={['click']}>
            <div className="flex items-center gap-3 cursor-pointer ml-2 group">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-[#1b1c1c]">{user?.name || 'Admin User'}</p>
                <p className="text-xs text-[#414755]">{user?.role || 'Administrator'}</p>
              </div>
              <Avatar 
                size={40} 
                icon={<UserOutlined />} 
                className="bg-[#0057c2] group-hover:scale-105 transition-transform" 
              />
            </div>
          </Dropdown>
        </div>
      </header>
    </>
  );
};

export default AdminHeader;