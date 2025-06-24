import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";
import { getCartFromLocalStorage, saveCartToLocalStorage } from "../../../Utils/localStorage";

const initialState = {
  cartItems: getCartFromLocalStorage(),
  shippingAddress: {},
  paymentMethod: "PayPal",
  loading: false,
  error: null,
};

// Async thunk to fetch cart items for logged-in user
export const fetchCart = createAsyncThunk(
  "cart/fetchCart",
  async (userId, thunkAPI) => {
    try {
      const { data } = await axios.get(`/api/cart/${userId}`);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to add or update cart item in backend
export const addToCartBackend = createAsyncThunk(
  "cart/addToCartBackend",
  async ({ userId, productId, qty, variant }, thunkAPI) => {
    try {
      const payload = {
        productId,
        quantity: qty,
      };
      if (variant) {
        payload.variant = variant;
      }
      const { data } = await axios.post(`/api/cart/${userId}`, payload);
      return data;
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

// Async thunk to remove cart item from backend
export const removeFromCartBackend = createAsyncThunk(
  "cart/removeFromCartBackend",
  async ({ userId, itemId }, thunkAPI) => {
    try {
      const { data } = await axios.delete(`/api/cart/${userId}/${itemId}`);
      return { itemId, message: data.message };
    } catch (error) {
      return thunkAPI.rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    // Local add to cart for guest users
    addToCartLocal: (state, action) => {
      const item = action.payload;
      const existItemIndex = state.cartItems.findIndex(
        (x) =>
          x._id === item._id &&
          JSON.stringify(x.variant) === JSON.stringify(item.variant)
      );

      if (existItemIndex >= 0) {
        // Update existing item quantity
        state.cartItems[existItemIndex].qty = item.qty;
      } else {
        // Add new item
        state.cartItems.push(item);
      }
      saveCartToLocalStorage(state.cartItems);
    },

    // Local remove from cart for guest users
    removeFromCartLocal: (state, action) => {
      const itemId = action.payload;
      state.cartItems = state.cartItems.filter(
        (item) => item._id !== itemId
      );
      saveCartToLocalStorage(state.cartItems);
    },

    saveShippingAddress: (state, action) => {
      state.shippingAddress = action.payload;
    },

    savePaymentMethod: (state, action) => {
      state.paymentMethod = action.payload;
    },

    clearCartItems: (state) => {
      state.cartItems = [];
      saveCartToLocalStorage([]);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCart.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCart.fulfilled, (state, action) => {
        state.loading = false;
        // Normalize quantity field to qty for frontend consistency
        const normalizedItems = action.payload.map(item => ({
          ...item,
          qty: item.quantity ?? item.qty ?? 1,
        }));
        state.cartItems = normalizedItems;
        saveCartToLocalStorage(normalizedItems);
      })
      .addCase(fetchCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(addToCartBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addToCartBackend.fulfilled, (state, action) => {
        const newItem = {
          ...action.payload,
          qty: action.payload.quantity ?? action.payload.qty ?? 1,
        };

        const existIndex = state.cartItems.findIndex(
          (x) =>
            x._id === newItem._id &&
            JSON.stringify(x.variant) === JSON.stringify(newItem.variant)
        );

        if (existIndex >= 0) {
          state.cartItems[existIndex] = newItem;
        } else {
          state.cartItems.push(newItem);
        }

        saveCartToLocalStorage(state.cartItems);
        state.loading = false;
      })
      .addCase(addToCartBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(removeFromCartBackend.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeFromCartBackend.fulfilled, (state, action) => {
        state.cartItems = state.cartItems.filter(
          (item) => item._id !== action.payload.itemId
        );
        saveCartToLocalStorage(state.cartItems);
        state.loading = false;
      })
      .addCase(removeFromCartBackend.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const {
  addToCartLocal,
  removeFromCartLocal,
  saveShippingAddress,
  savePaymentMethod,
  clearCartItems,
} = cartSlice.actions;

export default cartSlice.reducer;
