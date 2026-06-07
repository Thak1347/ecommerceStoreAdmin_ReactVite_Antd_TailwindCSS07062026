// src/store/slices/productSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchProducts = createAsyncThunk(
    'products/fetch',
    async (params = {}) => {
        const response = await API.get('/products', {params});
        return response.data;
    }
);

export const createProduct = createAsyncThunk(
    'product/create',
    async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if(data[key] !== undefined && data[key] !== null){
                formData.append(key, data[key]);
            }
        });
        const response = await API.post('/products', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },

        });
        return response.data;
    }
);

export const updateProduct = createAsyncThunk(
    'products/update',
    async ({id, data})=> {
        const formData = new FormData();
    formData.append('_method', 'PUT');
    Object.keys(data).forEach(key => {
        if(data[key]!==undefined&&data[key]!==null){
            formData.append(key, data[key]);
        }
    });
    const response = await API.post(`/products/${id}`, formData, {
        headers: {'Content-Type': 'multipart/form-data' },
    })
    return response.data;

    }
);

export const updateStock = createAsyncThunk(
  'products/updateStock',
  async ({ id, stock_qty }) => {
    const response = await API.put(`/products/${id}/stock`, { stock_qty });
    return response.data;
  }
);

export const deleteProduct = createAsyncThunk('products/delete', async (id) => {
  await API.delete(`/products/${id}`);
  return id;
});

const productSlice = createSlice({
  name: 'products',
  initialState: {
    products: [],
    pagination: null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchProducts.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchProducts.fulfilled, (state, action) => {
        state.isLoading = false;
        state.products = action.payload.data;
        state.pagination = {
          current: action.payload.current_page,
          total: action.payload.total,
          perPage: action.payload.per_page,
        };
      })
      .addCase(fetchProducts.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      .addCase(createProduct.fulfilled, (state, action) => {
        state.products.unshift(action.payload.product);
      })
      .addCase(updateProduct.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (p) => p.id === action.payload.product.id
        );
        if (index !== -1) state.products[index] = action.payload.product;
      })
      .addCase(updateStock.fulfilled, (state, action) => {
        const index = state.products.findIndex(
          (p) => p.id === action.payload.product.id
        );
        if (index !== -1) state.products[index] = action.payload.product;
      })
      .addCase(deleteProduct.fulfilled, (state, action) => {
        state.products = state.products.filter((p) => p.id !== action.payload);
      });
  },
});

export default productSlice.reducer;