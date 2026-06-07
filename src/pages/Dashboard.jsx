import { useEffect, useState } from 'react';
import { Card, Table, Tag, Spin, Button, Progress, Avatar, Dropdown, Space, message } from 'antd';
import { 
  ShoppingCartOutlined, 
  DollarOutlined, 
  ShoppingOutlined, 
  UserOutlined,
  RiseOutlined,
  FallOutlined,
  CalendarOutlined,
  DownloadOutlined,
  MoreOutlined,
  WarningOutlined,
  EyeOutlined,
  LineChartOutlined,
  GlobalOutlined,
  MobileOutlined,
  MailOutlined,
  TeamOutlined
} from '@ant-design/icons';
import LoadingSpinner, { TableSkeleton, CardSkeleton } from '../components/Common/LoadingSpinner';
import API from '../api/axios';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [topProducts, setTopProducts] = useState([]);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const response = await API.get('/dashboard/stats');
      setStats(response.data);
      setRecentOrders(response.data.recent_orders || []);
      setTopProducts(response.data.top_products || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Export Dashboard Report
  const exportReport = async () => {
    setExporting(true);
    try {
      // Prepare data for export
      const reportData = {
        summary: {
          'Total Revenue': stats?.total_revenue || 0,
          'Total Orders': stats?.total_orders || 0,
          'Total Products': stats?.total_products || 0,
          'Total Customers': stats?.total_customers || 0,
        },
        recentOrders: recentOrders.map(order => ({
          'Order #': order.order_number,
          'Customer': order.customer?.name || 'Guest',
          'Status': order.order_status,
          'Total': order.total,
          'Date': new Date(order.created_at).toLocaleString()
        })),
        topProducts: topProducts.map((product, index) => ({
          'Rank': index + 1,
          'Product Name': product.product?.name,
          'Category': product.product?.category?.name || 'General',
          'Units Sold': product.total_sold,
          'Price': product.product?.price,
          'Revenue': (product.total_sold * (product.product?.price || 0))
        })),
        revenueByChannel: [
          { channel: 'Direct Search', amount: 42100, percentage: 70 },
          { channel: 'Social Media', amount: 28450, percentage: 55 },
          { channel: 'Referral', amount: 15200, percentage: 35 },
          { channel: 'Email', amount: 12800, percentage: 25 },
        ]
      };

      // Create CSV content
      const rows = [];
      
      // Add title and timestamp
      rows.push(`"Dashboard Report - ${new Date().toLocaleString()}"`);
      rows.push('');
      
      // Summary Section
      rows.push('"=== SUMMARY ==="');
      rows.push('"Metric","Value"');
      rows.push(`"Total Revenue","$${formatNumber(stats?.total_revenue)}"`);
      rows.push(`"Total Orders","${formatNumber(stats?.total_orders)}"`);
      rows.push(`"Total Products","${formatNumber(stats?.total_products)}"`);
      rows.push(`"Total Customers","${formatNumber(stats?.total_customers)}"`);
      rows.push('');
      
      // Revenue by Channel Section
      rows.push('"=== REVENUE BY CHANNEL ==="');
      rows.push('"Channel","Amount","Percentage"');
      reportData.revenueByChannel.forEach(item => {
        rows.push(`"${item.channel}","$${formatNumber(item.amount)}","${item.percentage}%"`);
      });
      rows.push('');
      
      // Recent Orders Section
      rows.push('"=== RECENT ORDERS ==="');
      rows.push('"Order #","Customer","Status","Total","Date"');
      reportData.recentOrders.forEach(order => {
        rows.push(`"${order['Order #']}","${order.Customer}","${order.Status}","$${formatNumber(order.Total)}","${order.Date}"`);
      });
      rows.push('');
      
      // Top Products Section
      rows.push('"=== TOP SELLING PRODUCTS ==="');
      rows.push('"Rank","Product Name","Category","Units Sold","Price","Revenue"');
      reportData.topProducts.forEach(product => {
        rows.push(`"${product.Rank}","${product['Product Name']}","${product.Category}","${product['Units Sold']}","$${formatNumber(product.Price)}","$${formatNumber(product.Revenue)}"`);
      });
      
      // Create and download file
      const csvString = rows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `dashboard_report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      message.success('Report exported successfully');
    } catch (error) {
      console.error('Export failed:', error);
      message.error('Failed to export report');
    } finally {
      setExporting(false);
    }
  };

  const formatCurrency = (value) => {
    const numValue = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(numValue)) return '$0.00';
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(numValue);
  };

  const formatNumber = (value) => {
    const numValue = typeof value === 'string' ? parseInt(value) : value;
    if (isNaN(numValue)) return '0';
    return numValue.toLocaleString();
  };

  const getStatusConfig = (status) => {
    const configs = {
      pending: { color: '#f59e0b', bg: 'bg-amber-50', text: 'Pending', icon: '⏳' },
      processing: { color: '#3b82f6', bg: 'bg-blue-50', text: 'Processing', icon: '🔄' },
      shipped: { color: '#06b6d4', bg: 'bg-cyan-50', text: 'Shipped', icon: '🚚' },
      delivered: { color: '#10b981', bg: 'bg-emerald-50', text: 'Delivered', icon: '✅' },
      cancelled: { color: '#ef4444', bg: 'bg-red-50', text: 'Cancelled', icon: '❌' }
    };
    return configs[status] || configs.pending;
  };

  const columns = [
    { 
      title: 'Order ID', 
      dataIndex: 'order_number', 
      key: 'order_number',
      render: (text) => (
        <span className="font-mono text-sm font-semibold text-primary">{text}</span>
      )
    },
    { 
      title: 'Customer', 
      dataIndex: ['customer', 'name'], 
      key: 'customer',
      render: (text) => (
        <div className="flex items-center gap-3">
          <Avatar size={36} className="bg-gradient-to-br from-primary to-primary/70">
            {text?.charAt(0)?.toUpperCase()}
          </Avatar>
          <div>
            <p className="font-medium text-gray-900">{text}</p>
            <p className="text-xs text-gray-500">Customer</p>
          </div>
        </div>
      )
    },
    { 
      title: 'Status', 
      dataIndex: 'order_status', 
      key: 'status',
      render: (status) => {
        const config = getStatusConfig(status);
        return (
          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 ${config.bg} rounded-full text-xs font-semibold`} style={{ color: config.color }}>
            <span>{config.icon}</span>
            {config.text}
          </span>
        );
      }
    },
    { 
      title: 'Total', 
      dataIndex: 'total', 
      key: 'total', 
      align: 'right',
      render: (val) => (
        <span className="font-bold text-gray-900">{formatCurrency(val)}</span>
      )
    },
    { 
      title: 'Date', 
      dataIndex: 'created_at', 
      key: 'date', 
      render: (date) => (
        <span className="text-gray-500 text-sm">
          {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
        </span>
      )
    },
    {
      title: '',
      key: 'action',
      width: 50,
      render: () => (
        <Button type="text" icon={<EyeOutlined />} className="text-gray-400 hover:text-primary" />
      )
    }
  ];

  const revenueData = [
    { channel: 'Direct Search', amount: 42100, percentage: 70, color: '#0057c2', icon: <GlobalOutlined />, trend: '+18%' },
    { channel: 'Social Media', amount: 28450, percentage: 55, color: '#266d00', icon: <MobileOutlined />, trend: '+12%' },
    { channel: 'Referral', amount: 15200, percentage: 35, color: '#7d5400', icon: <TeamOutlined />, trend: '+8%' },
    { channel: 'Email', amount: 12800, percentage: 25, color: '#727786', icon: <MailOutlined />, trend: '+5%' },
  ];

  const monthlyData = [
    { month: 'Jan', sales: 42000, lastYear: 35000 },
    { month: 'Feb', sales: 48000, lastYear: 38000 },
    { month: 'Mar', sales: 52000, lastYear: 42000 },
    { month: 'Apr', sales: 58000, lastYear: 46000 },
    { month: 'May', sales: 62000, lastYear: 49000 },
    { month: 'Jun', sales: 68000, lastYear: 53000 },
    { month: 'Jul', sales: 75000, lastYear: 58000 },
    { month: 'Aug', sales: 82000, lastYear: 62000 },
    { month: 'Sep', sales: 88000, lastYear: 65000 },
  ];

  const maxSales = Math.max(...monthlyData.map(d => d.sales));

  // Show skeleton loader while loading
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
          <div className="h-8 w-48 bg-gray-200 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-64 bg-gray-200 rounded animate-pulse"></div>
        </div>
        
        {/* Card Skeleton */}
        <CardSkeleton count={4} />
        
        {/* Chart Skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-4"></div>
            <div className="h-80 bg-gray-100 rounded-lg animate-pulse"></div>
          </div>
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="h-6 w-40 bg-gray-200 rounded animate-pulse mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="flex justify-between mb-2">
                    <div className="h-4 w-24 bg-gray-200 rounded"></div>
                    <div className="h-4 w-16 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        {/* Table Skeleton */}
        <TableSkeleton rows={5} columns={5} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header with Gradient */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="relative flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Dashboard Overview</h2>
            <p className="text-gray-600">Real-time performance metrics for AdminPro Store</p>
          </div>
          <div className="flex gap-3">
            <Button className="flex items-center gap-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-all">
              <CalendarOutlined />
              Oct 1, 2023 - Oct 31, 2023
            </Button>
            <Button 
              className="flex items-center gap-2 border-gray-200 bg-white shadow-sm hover:shadow-md transition-all"
              onClick={exportReport}
              loading={exporting}
              icon={<DownloadOutlined />}
            >
              {exporting ? 'Exporting...' : 'Export Report'}
            </Button>
          </div>
        </div>
      </div>

      {/* Stats Cards with Modern Design */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Revenue Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary/5 to-transparent rounded-full blur-2xl"></div>
          <div className="relative p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center shadow-lg">
                <DollarOutlined className="text-xl text-white" />
              </div>
              <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full text-emerald-600 text-sm font-semibold">
                <RiseOutlined className="text-xs" /> +12.5%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Revenue</p>
            <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats?.total_revenue)}</p>
            <div className="mt-4 h-1 w-full bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full w-[70%] bg-gradient-to-r from-primary to-primary/60 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Total Orders Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/5 to-transparent rounded-full blur-2xl"></div>
          <div className="relative p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <ShoppingCartOutlined className="text-xl text-white" />
              </div>
              <span className="flex items-center gap-1 px-2 py-1 bg-emerald-50 rounded-full text-emerald-600 text-sm font-semibold">
                <RiseOutlined className="text-xs" /> +8.2%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Orders</p>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.total_orders)}</p>
            <p className="text-xs text-gray-400 mt-2">+124 from last month</p>
          </div>
        </div>

        {/* Total Customers Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/5 to-transparent rounded-full blur-2xl"></div>
          <div className="relative p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                <UserOutlined className="text-xl text-white" />
              </div>
              <span className="flex items-center gap-1 px-2 py-1 bg-red-50 rounded-full text-red-600 text-sm font-semibold">
                <FallOutlined className="text-xs" /> -2.4%
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Customers</p>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.total_customers)}</p>
            <p className="text-xs text-gray-400 mt-2">892 active customers</p>
          </div>
        </div>

        {/* Total Products Card */}
        <div className="group relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl"></div>
          <div className="relative p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                <ShoppingOutlined className="text-xl text-white" />
              </div>
              <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-500 text-sm font-semibold">
                Stable
              </span>
            </div>
            <p className="text-sm font-medium text-gray-500 mb-1">Total Products</p>
            <p className="text-3xl font-bold text-gray-900">{formatNumber(stats?.total_products)}</p>
            <p className="text-xs text-gray-400 mt-2">42 out of stock</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Overview Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Sales Overview</h3>
              <p className="text-sm text-gray-500">Monthly revenue comparison</p>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-primary"></div>
                <span className="text-xs text-gray-600">This Year</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-300"></div>
                <span className="text-xs text-gray-600">Last Year</span>
              </div>
            </div>
          </div>
          
          <div className="h-80 relative">
            <div className="absolute inset-0 flex items-end justify-between gap-2">
              {monthlyData.map((data, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="relative w-full">
                    <div 
                      className="w-full bg-gray-200 rounded-t-lg transition-all group-hover:bg-gray-300 cursor-pointer"
                      style={{ height: `${(data.lastYear / maxSales) * 200}px` }}
                    >
                      <div 
                        className="absolute bottom-0 w-full bg-gray-400 rounded-t-lg transition-all group-hover:bg-gray-500"
                        style={{ height: `${(data.lastYear / maxSales) * 200}px` }}
                      ></div>
                    </div>
                    <div 
                      className="absolute bottom-0 w-full bg-primary rounded-t-lg transition-all group-hover:bg-primary/80 cursor-pointer"
                      style={{ height: `${(data.sales / maxSales) * 200}px` }}
                    >
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                        ${(data.sales / 1000).toFixed(1)}k
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Trend Line */}
          <div className="mt-6 pt-4 border-t border-gray-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <LineChartOutlined className="text-emerald-500" />
                  <span className="text-sm text-gray-600">Year-over-Year Growth</span>
                </div>
                <span className="text-2xl font-bold text-emerald-600">+23.5%</span>
              </div>
              <Button type="link" className="text-primary">View Detailed Report →</Button>
            </div>
          </div>
        </div>

        {/* Revenue by Channel */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Revenue by Channel</h3>
            <p className="text-sm text-gray-500">Breakdown by source</p>
          </div>
          
          <div className="space-y-6">
            {revenueData.map((item) => (
              <div key={item.channel} className="group">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center text-gray-500">
                      {item.icon}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{item.channel}</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{formatCurrency(item.amount)}</p>
                    <p className="text-xs text-emerald-600">{item.trend}</p>
                  </div>
                </div>
                <div className="relative">
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500 group-hover:opacity-80"
                      style={{ width: `${item.percentage}%`, backgroundColor: item.color }}
                    ></div>
                  </div>
                  <span className="absolute right-0 -top-5 text-xs text-gray-400">{item.percentage}%</span>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-100">
            <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs text-gray-500">Best Performing</p>
                  <p className="font-bold text-gray-900">Direct Search</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">Growth Rate</p>
                  <p className="font-bold text-emerald-600">+18%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Orders and Top Products */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Orders Table */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-100 flex justify-between items-center">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Recent Orders</h3>
              <p className="text-sm text-gray-500">Latest transactions</p>
            </div>
            <Button type="link" className="text-primary font-semibold">View All →</Button>
          </div>
          <div className="overflow-x-auto">
            <Table
              columns={columns}
              dataSource={recentOrders}
              rowKey="id"
              pagination={false}
              className="w-full"
            />
          </div>
        </div>

        {/* Top Selling Products */}
        <div className="bg-white rounded-2xl shadow-sm p-6">
          <div className="mb-6">
            <h3 className="text-lg font-bold text-gray-900">Top Selling Products</h3>
            <p className="text-sm text-gray-500">Best performing items</p>
          </div>
          
          <div className="space-y-4">
            {topProducts.length > 0 ? topProducts.slice(0, 5).map((product, index) => (
              <div 
                key={index} 
                className="group flex items-center gap-4 p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 cursor-pointer"
              >
                <div className="relative">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                    {product.product?.image_url ? (
                      <img 
                        src={product.product.image_url} 
                        alt={product.product.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingOutlined className="text-2xl text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold">
                    {index + 1}
                  </div>
                </div>
                
                <div className="flex-1">
                  <p className="font-semibold text-gray-900 group-hover:text-primary transition-colors">
                    {product.product?.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-xs text-gray-500">{product.product?.category?.name || 'General'}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                    <span className="text-xs text-gray-500">{product.total_sold} sold</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900">{formatCurrency(product.product?.price)}</p>
                  <p className="text-xs text-emerald-600">+12%</p>
                </div>
              </div>
            )) : (
              <div className="text-center text-gray-500 py-12">
                <ShoppingOutlined className="text-4xl text-gray-300 mb-3" />
                <p>No product data available</p>
              </div>
            )}
          </div>
          
          <Button className="w-full mt-6 h-10 border-primary text-primary hover:bg-primary/5 transition-all rounded-xl font-semibold">
            Download Full Report
          </Button>
        </div>
      </div>

      {/* Low Stock Alert Banner */}
      {stats?.low_stock_products?.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-6">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              <WarningOutlined className="text-2xl text-amber-600" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold text-amber-800">Low Stock Alerts</h3>
                <span className="text-sm text-amber-600">{stats.low_stock_products.length} products need attention</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {stats.low_stock_products.slice(0, 3).map((product) => (
                  <div key={product.id} className="bg-white rounded-lg p-3 flex justify-between items-center border border-amber-100">
                    <div>
                      <p className="font-medium text-gray-900">{product.name}</p>
                      <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-red-500 font-bold text-xl">{product.stock_qty}</p>
                      <p className="text-xs text-red-400">left</p>
                    </div>
                  </div>
                ))}
              </div>
              {stats.low_stock_products.length > 3 && (
                <Button type="link" className="text-amber-600 mt-3 p-0">
                  View all {stats.low_stock_products.length} products →
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;