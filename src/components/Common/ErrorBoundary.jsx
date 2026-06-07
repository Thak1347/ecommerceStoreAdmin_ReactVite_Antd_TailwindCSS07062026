import React from 'react';
import { Button, Result, Space, Typography } from 'antd';
import { ReloadOutlined, HomeOutlined, BugOutlined } from '@ant-design/icons';

const { Text, Paragraph } = Typography;

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({ errorInfo });
    
    // You can also send error to your logging service here
    // logErrorToService(error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  handleGoHome = () => {
    window.location.href = '/';
  };

  handleToggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    const { hasError, error, errorInfo, showDetails } = this.state;
    const { children, fallback, onReset } = this.props;

    if (hasError) {
      // Custom fallback UI
      if (fallback) {
        return fallback;
      }

      // Default fallback UI
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-2xl w-full">
            <Result
              status="error"
              icon={<BugOutlined className="text-red-500" />}
              title="Something went wrong"
              subTitle={
                <div className="space-y-2">
                  <Paragraph className="text-gray-600">
                    An unexpected error occurred in the application. Our team has been notified.
                  </Paragraph>
                  {error && (
                    <Text type="secondary" className="text-sm block">
                      Error: {error.message || 'Unknown error'}
                    </Text>
                  )}
                </div>
              }
              extra={
                <Space>
                  <Button 
                    type="primary" 
                    icon={<ReloadOutlined />}
                    onClick={this.handleReload}
                    size="large"
                  >
                    Reload Page
                  </Button>
                  <Button 
                    icon={<HomeOutlined />}
                    onClick={this.handleGoHome}
                    size="large"
                  >
                    Go Home
                  </Button>
                  <Button 
                    type="link"
                    onClick={this.handleToggleDetails}
                  >
                    {showDetails ? 'Hide Details' : 'Show Details'}
                  </Button>
                </Space>
              }
            />
            
            {/* Error Details (only shown when toggled) */}
            {showDetails && errorInfo && (
              <div className="mt-6 p-4 bg-gray-100 rounded-lg overflow-auto max-h-96">
                <Text strong className="block mb-2">Error Details:</Text>
                <pre className="text-xs text-red-600 whitespace-pre-wrap">
                  {error && error.stack}
                  {'\n\n'}
                  {errorInfo && errorInfo.componentStack}
                </pre>
              </div>
            )}
          </div>
        </div>
      );
    }

    return children;
  }
}

// HOC to wrap components with error boundary
export const withErrorBoundary = (Component, errorFallback) => {
  return function WithErrorBoundaryWrapper(props) {
    return (
      <ErrorBoundary fallback={errorFallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
};

export default ErrorBoundary;