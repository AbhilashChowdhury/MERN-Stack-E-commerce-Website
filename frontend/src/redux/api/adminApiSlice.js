import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';

export const adminApi = createApi({
  reducerPath: 'adminApi',
  baseQuery: fetchBaseQuery({ baseUrl: '/api/admin' }),
  tagTypes: ['Coupon', 'University'],
  endpoints: (builder) => ({
    getCoupons: builder.query({
      query: () => '/coupons',
      providesTags: ['Coupon'],
    }),
    addCoupon: builder.mutation({
      query: (coupon) => ({
        url: '/coupons',
        method: 'POST',
        body: coupon,
      }),
      invalidatesTags: ['Coupon'],
    }),
    getUniversities: builder.query({
      query: () => '/universities',
      providesTags: ['University'],
    }),
    addUniversity: builder.mutation({
      query: (university) => ({
        url: '/universities',
        method: 'POST',
        body: university,
      }),
      invalidatesTags: ['University'],
    }),
    // Add update/delete mutations similarly
  }),
});

export const {
  useGetCouponsQuery,
  useAddCouponMutation,
  useGetUniversitiesQuery,
  useAddUniversityMutation,
} = adminApi;
