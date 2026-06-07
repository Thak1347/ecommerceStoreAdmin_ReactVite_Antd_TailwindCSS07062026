// src/slices/authSlice.js

import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const login = createAsyncThunk('auth/login', async (credentials) => {
  const response = await API.post('/login', credentials);
  localStorage.setItem('token', response.data.token);
  localStorage.setItem('user', JSON.stringify(response.data.user));
  return response.data;
});

export const logout = createAsyncThunk('auth/logout', async () => {
  await API.post('/logout');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
});

export const getProfile = createAsyncThunk('auth/profile', async () => {
  const response = await API.get('/profile');
  return response.data;
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data) => {
  const response = await API.put('/profile', data);  // Changed from '/change-password' to '/profile'
  return response.data;
});

export const changePassword = createAsyncThunk('auth/changePassword', async (data) => {
  const response = await API.put('/change-password', data);
  return response.data;
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isLoading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Login cases
      .addCase(login.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message;
      })
      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.token = null;
        state.isLoading = false;
      })
      // Update Profile cases
      .addCase(updateProfile.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.user = action.payload.user;
        localStorage.setItem('user', JSON.stringify(action.payload.user));
      })
      .addCase(updateProfile.rejected, (state) => {
        state.isLoading = false;
      })
      // Change Password cases
      .addCase(changePassword.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(changePassword.fulfilled, (state) => {
        state.isLoading = false;
      })
      .addCase(changePassword.rejected, (state) => {
        state.isLoading = false;
      });
  },
});

export default authSlice.reducer;  