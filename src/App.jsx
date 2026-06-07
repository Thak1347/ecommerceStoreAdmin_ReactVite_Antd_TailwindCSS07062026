import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { ConfigProvider } from 'antd';
import ErrorBoundary from './components/Common/ErrorBoundary';
import AdminLayout from './components/Layout/AdminLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import CategoryList from './pages/Categories/CategoryList';
import CategoryDetail from './pages/Categories/CategoryDetail';
import CategoryEdit from './pages/Categories/CategoryEdit';
import ProductList from './pages/Products/ProductList';
import ProductDetail from './pages/Products/ProductDetail';
import ProductEdit from './pages/Products/ProductEdit';
import OrderList from './pages/Orders/OrderList';
import OrderDetail from './pages/Orders/OrderDetail';
import CustomerList from './pages/Customers/CustomerList';
import CustomerDetail from './pages/Customers/CustomerDetail';
import CustomerEdit from './pages/Customers/CustomerEdit';
import Profile from './pages/Profile';
import LoadingSpinner from './components/Common/LoadingSpinner';

const PrivateRoute = ({ children }) => {
  const { token, isLoading } = useSelector((state) => state.auth);
  
  if (isLoading) {
    return <LoadingSpinner fullScreen tip="Verifying authentication..." />;
  }
  
  return token ? children : <Navigate to="/login" />;
};

// Wrapper component for routes with error boundary
const RouteWithErrorBoundary = ({ element, ...props }) => (
  <ErrorBoundary>
    {element}
  </ErrorBoundary>
);

function App() {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: '#0057c2',
          borderRadius: 8,
          fontFamily: 'Inter, sans-serif',
        },
        components: {
          Table: {
            headerBg: '#fafafa',
            rowHoverBg: '#f9fafb',
          },
          Card: {
            borderRadiusLG: 12,
          },
        },
      }}
    >
      <ErrorBoundary>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={
              <ErrorBoundary>
                <Login />
              </ErrorBoundary>
            } />
            <Route
              path="/"
              element={
                <PrivateRoute>
                  <AdminLayout />
                </PrivateRoute>
              }
            >
              <Route index element={
                <ErrorBoundary>
                  <Dashboard />
                </ErrorBoundary>
              } />
              
              {/* Categories Routes */}
              <Route path="categories" element={
                <ErrorBoundary>
                  <CategoryList />
                </ErrorBoundary>
              } />
              <Route path="categories/:id" element={
                <ErrorBoundary>
                  <CategoryDetail />
                </ErrorBoundary>
              } />
              <Route path="categories/:id/edit" element={
                <ErrorBoundary>
                  <CategoryEdit />
                </ErrorBoundary>
              } />
              
              {/* Products Routes */}
              <Route path="products" element={
                <ErrorBoundary>
                  <ProductList />
                </ErrorBoundary>
              } />
              <Route path="products/:id" element={
                <ErrorBoundary>
                  <ProductDetail />
                </ErrorBoundary>
              } />
              <Route path="products/:id/edit" element={
                <ErrorBoundary>
                  <ProductEdit />
                </ErrorBoundary>
              } />
              
              {/* Orders Routes */}
              <Route path="orders" element={
                <ErrorBoundary>
                  <OrderList />
                </ErrorBoundary>
              } />
              <Route path="orders/:id" element={
                <ErrorBoundary>
                  <OrderDetail />
                </ErrorBoundary>
              } />
              
              {/* Customers Routes */}
              <Route path="customers" element={
                <ErrorBoundary>
                  <CustomerList />
                </ErrorBoundary>
              } />
              <Route path="customers/:id" element={
                <ErrorBoundary>
                  <CustomerDetail />
                </ErrorBoundary>
              } />
              <Route path="customers/:id/edit" element={
                <ErrorBoundary>
                  <CustomerEdit />
                </ErrorBoundary>
              } />
              
              {/* Profile Route */}
              <Route path="profile" element={
                <ErrorBoundary>
                  <Profile />
                </ErrorBoundary>
              } />
            </Route>
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </ConfigProvider>
  );
}

export default App;