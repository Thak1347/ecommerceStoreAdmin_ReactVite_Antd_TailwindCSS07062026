import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchOrders = createAsyncThunk(
  'orders/fetch',
  async (params = {}) => {
    const response = await API.get('/orders', { params });
    return response.data;
  }
);

export const createOrder = createAsyncThunk('orders/create', async (data) => {
  const response = await API.post('/orders', data);
  return response.data;
});

export const updateOrderStatus = createAsyncThunk(
  'orders/updateStatus',
  async ({ id, status }) => {
    const response = await API.put(`/orders/${id}/status`, status);
    return response.data;
  }
);

// Add payment status update action
export const updatePaymentStatus = createAsyncThunk(
  'orders/updatePaymentStatus',
  async ({ id, status }) => {
    const response = await API.put(`/orders/${id}/status`, status);
    return response.data;
  }
);

export const fetchOrderDetail = createAsyncThunk('orders/detail', async (id) => {
  const response = await API.get(`/orders/${id}`);
  return response.data;
});

const orderSlice = createSlice({
  name: 'orders',
  initialState: {
    orders: [],
    currentOrder: null,
    pagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentOrder: (state) => {
      state.currentOrder = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.isLoading = false;
        state.orders = action.payload.data || [];
        state.pagination = {
          current: action.payload.current_page || 1,
          total: action.payload.total || 0,
          perPage: action.payload.per_page || 10,
        };
      })
      .addCase(fetchOrders.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        state.orders = [];
      })
      .addCase(fetchOrderDetail.pending, (state) => {
        state.error = null;
      })
      .addCase(fetchOrderDetail.fulfilled, (state, action) => {
        state.currentOrder = action.payload;
      })
      .addCase(fetchOrderDetail.rejected, (state, action) => {
        state.error = action.error.message;
        state.currentOrder = null;
      })
      .addCase(updateOrderStatus.pending, (state) => {
        state.error = null;
      })
        // Add payment status update cases
      .addCase(updatePaymentStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const updatedOrder = action.payload.order;
        const index = state.orders.findIndex((o) => o.id === updatedOrder.id);
        if (index !== -1) {
          state.orders[index] = updatedOrder;
        }
        if (state.currentOrder?.id === updatedOrder.id) {
          state.currentOrder = updatedOrder;
        }
      })
      .addCase(updateOrderStatus.rejected, (state, action) => {
        state.error = action.error.message;
      });
  },
});

export const { clearCurrentOrder } = orderSlice.actions;
export default orderSlice.reducer;