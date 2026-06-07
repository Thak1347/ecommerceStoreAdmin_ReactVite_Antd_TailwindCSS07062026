import React from 'react';
import { Spin, Space, Typography } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { Text } = Typography;

const LoadingSpinner = ({ 
  size = 'large', 
  tip = 'Loading...', 
  fullScreen = false,
  inline = false,
  children 
}) => {
  const antIcon = <LoadingOutlined style={{ fontSize: size === 'small' ? 20 : size === 'large' ? 40 : 30 }} spin />;

  const spinner = (
    <Spin 
      indicator={antIcon} 
      size={size} 
      tip={tip}
      spinning={true}
    >
      {children}
    </Spin>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white/80 backdrop-blur-sm z-50">
        <Space direction="vertical" align="center" size="middle">
          {spinner}
          {tip && <Text type="secondary" className="mt-3">{tip}</Text>}
        </Space>
      </div>
    );
  }

  if (inline) {
    return spinner;
  }

  return (
    <div className="flex justify-center items-center p-8 min-h-[200px]">
      <Space direction="vertical" align="center" size="middle">
        {spinner}
        {tip && <Text type="secondary">{tip}</Text>}
      </Space>
    </div>
  );
};

// Skeleton loading variants
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="bg-gray-100 h-12 rounded-t-lg mb-2">
        <div className="flex h-full items-center px-4 gap-4">
          {[...Array(columns)].map((_, i) => (
            <div key={i} className="h-4 bg-gray-300 rounded flex-1"></div>
          ))}
        </div>
      </div>
      
      {/* Rows */}
      {[...Array(rows)].map((_, rowIndex) => (
        <div key={rowIndex} className="border-b border-gray-200 py-4 px-4">
          <div className="flex gap-4">
            {[...Array(columns)].map((_, colIndex) => (
              <div key={colIndex} className="flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export const CardSkeleton = ({ count = 3 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {[...Array(count)].map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 p-6 animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            <div className="h-6 w-16 bg-gray-200 rounded"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
          <div className="h-8 bg-gray-200 rounded w-32"></div>
        </div>
      ))}
    </div>
  );
};

export const FormSkeleton = ({ fields = 4 }) => {
  return (
    <div className="animate-pulse space-y-4">
      {[...Array(fields)].map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-gray-200 rounded w-full"></div>
        </div>
      ))}
      <div className="h-10 bg-gray-200 rounded w-32 mt-4"></div>
    </div>
  );
};

export const DetailSkeleton = () => {
  return (
    <div className="animate-pulse">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <div className="h-10 w-10 bg-gray-200 rounded"></div>
          <div>
            <div className="h-8 w-48 bg-gray-200 rounded mb-2"></div>
            <div className="h-4 w-64 bg-gray-200 rounded"></div>
          </div>
        </div>
        <div className="flex gap-3">
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
          <div className="h-10 w-24 bg-gray-200 rounded"></div>
        </div>
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="h-4 w-24 bg-gray-200 rounded mb-2"></div>
            <div className="h-8 w-32 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
      
      {/* Main Content */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="h-6 w-48 bg-gray-200 rounded mb-4"></div>
        <div className="space-y-4">
          <div className="h-4 w-full bg-gray-200 rounded"></div>
          <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;