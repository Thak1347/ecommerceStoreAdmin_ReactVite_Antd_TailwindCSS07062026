import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import API from '../../api/axios';

export const fetchCategories = createAsyncThunk(
    'categories/fetch',
    async (params = {}) => {
        const response = await API.get('/categories', { params });
        return response.data;
    }
);

export const fetchCategoryById = createAsyncThunk(
    'categories/fetchById',
    async (id) => {
        const response = await API.get(`/categories/${id}`);
        return response.data;
    }
);

export const createCategory = createAsyncThunk(
    'categories/create',
    async (data) => {
        const formData = new FormData();
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        const response = await API.post('/categories', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }
);

export const updateCategory = createAsyncThunk(
    'categories/update',
    async ({ id, data }) => {
        const formData = new FormData();
        formData.append('_method', 'PUT');
        Object.keys(data).forEach(key => {
            if (data[key] !== undefined && data[key] !== null) {
                formData.append(key, data[key]);
            }
        });
        const response = await API.post(`/categories/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    }
);

export const deleteCategory = createAsyncThunk('categories/delete', async (id) => {
    await API.delete(`/categories/${id}`);
    return id;
});

const categorySlice = createSlice({
    name: 'categories',
    initialState: {
        categories: [],
        currentCategory: null,
        pagination: null,
        isLoading: false,
        error: null,
    },
    reducers: {
        clearCurrentCategory: (state) => {
            state.currentCategory = null;
        },
    },
    extraReducers: (builder) => {
        builder
            // Fetch Categories
            .addCase(fetchCategories.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCategories.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories = action.payload.data;
                state.pagination = {
                    current: action.payload.current_page,
                    total: action.payload.total,
                    perPage: action.payload.per_page,
                };
            })
            .addCase(fetchCategories.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            
            // Fetch Category By ID
            .addCase(fetchCategoryById.pending, (state) => {
                state.isLoading = true;
                state.error = null;
            })
            .addCase(fetchCategoryById.fulfilled, (state, action) => {
                state.isLoading = false;
                state.currentCategory = action.payload;
            })
            .addCase(fetchCategoryById.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            
            // Create Category
            .addCase(createCategory.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(createCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories.unshift(action.payload.category);
                // Update pagination total
                if (state.pagination) {
                    state.pagination.total += 1;
                }
            })
            .addCase(createCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            
            // Update Category
            .addCase(updateCategory.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(updateCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                const index = state.categories.findIndex((c) => c.id === action.payload.category.id);
                if (index !== -1) {
                    state.categories[index] = action.payload.category;
                }
                // Update current category if it's the same
                if (state.currentCategory && state.currentCategory.id === action.payload.category.id) {
                    state.currentCategory = action.payload.category;
                }
            })
            .addCase(updateCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            })
            
            // Delete Category
            .addCase(deleteCategory.pending, (state) => {
                state.isLoading = true;
            })
            .addCase(deleteCategory.fulfilled, (state, action) => {
                state.isLoading = false;
                state.categories = state.categories.filter((c) => c.id !== action.payload);
                // Update pagination total
                if (state.pagination) {
                    state.pagination.total -= 1;
                }
                // Clear current category if it was deleted
                if (state.currentCategory && state.currentCategory.id === action.payload) {
                    state.currentCategory = null;
                }
            })
            .addCase(deleteCategory.rejected, (state, action) => {
                state.isLoading = false;
                state.error = action.error.message;
            });
    },
});

// Export actions
export const { clearCurrentCategory } = categorySlice.actions;

export default categorySlice.reducer;