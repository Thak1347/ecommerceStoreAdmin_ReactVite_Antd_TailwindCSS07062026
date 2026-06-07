import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchCustomers = createAsyncThunk(
  'customers/fetch',
  async (params = {}) => {
    const response = await API.get('/customers', { params });
    return response.data;
  }
);

export const fetchCustomerById = createAsyncThunk(
  'customers/fetchById',
  async (id) => {
    const response = await API.get(`/customers/${id}`);
    return response.data;
  }
);

export const updateCustomer = createAsyncThunk(
  'customers/update',
  async ({ id, data }) => {
    const response = await API.put(`/customers/${id}`, data);
    return response.data;
  }
);

export const updateCustomerStatus = createAsyncThunk(
  'customers/updateStatus',
  async ({ id, active }) => {
    const response = await API.put(`/customers/${id}/status`, { active });
    return response.data;
  }
);

export const deleteCustomer = createAsyncThunk(
  'customers/delete',
  async (id) => {
    await API.delete(`/customers/${id}`);
    return id;
  }
);

export const createCustomer = createAsyncThunk(
  'customers/create',
  async (data) => {
    const response = await API.post('/register', data);
    return response.data;
  }
);

const customerSlice = createSlice({
  name: 'customers',
  initialState: {
    customers: [],
    currentCustomer: null,
    pagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {
    clearCurrentCustomer: (state) => {
      state.currentCustomer = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Customers
      .addCase(fetchCustomers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.customers = action.payload.data || [];
        state.pagination = {
          current: action.payload.current_page || 1,
          total: action.payload.total || 0,
          perPage: action.payload.per_page || 10,
        };
      })
      .addCase(fetchCustomers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
        state.customers = [];
      })
      
      // Fetch Customer By ID
      .addCase(fetchCustomerById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCustomerById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentCustomer = action.payload;
      })
      .addCase(fetchCustomerById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })

      // Update Customer
    .addCase(updateCustomer.pending, (state) => {
    state.error = null;
    })
    .addCase(updateCustomer.fulfilled, (state, action) => {
    const index = state.customers.findIndex((c) => c.id === action.payload.user.id);
    if (index !== -1) {
        state.customers[index] = action.payload.user;
    }
    if (state.currentCustomer?.id === action.payload.user.id) {
        state.currentCustomer = action.payload.user;
    }
    })
    .addCase(updateCustomer.rejected, (state, action) => {
    state.error = action.error.message;
    })
      
      // Update Customer Status
      .addCase(updateCustomerStatus.pending, (state) => {
        state.error = null;
      })
      .addCase(updateCustomerStatus.fulfilled, (state, action) => {
        const index = state.customers.findIndex((c) => c.id === action.payload.user.id);
        if (index !== -1) {
          state.customers[index] = action.payload.user;
        }
        if (state.currentCustomer?.id === action.payload.user.id) {
          state.currentCustomer = action.payload.user;
        }
      })
      .addCase(updateCustomerStatus.rejected, (state, action) => {
        state.error = action.error.message;
      })
      
      // Delete Customer
      .addCase(deleteCustomer.fulfilled, (state, action) => {
        state.customers = state.customers.filter((c) => c.id !== action.payload);
        if (state.pagination) {
          state.pagination.total -= 1;
        }
        if (state.currentCustomer?.id === action.payload) {
          state.currentCustomer = null;
        }
      })
      
      // Create Customer
      .addCase(createCustomer.fulfilled, (state, action) => {
        state.customers.unshift(action.payload.user);
        if (state.pagination) {
          state.pagination.total += 1;
        }
      });
  },
});

export const { clearCurrentCustomer } = customerSlice.actions;
export default customerSlice.reducer;