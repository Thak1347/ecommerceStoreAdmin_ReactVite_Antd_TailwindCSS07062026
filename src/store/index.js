import {configureStore} from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import categoryReducer from './slices/categorySlice';
import productReducer from './slices/productSlice';
import orderReducer from './slices/orderSlice';
import customerReducer from './slices/customerSlice';


export const store = configureStore({
    reducer: {
        auth: authReducer,
        categories: categoryReducer,
        products: productReducer,
        orders: orderReducer,
        customers: customerReducer,
    },
});