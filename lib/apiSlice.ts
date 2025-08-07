import { ENDPOINTS } from "@/config";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";

export const apiSlice = createApi({
  reducerPath: "apiSlice",
   baseQuery: fetchBaseQuery({
    baseUrl: ENDPOINTS.BACKEND_URL,
    prepareHeaders: async (headers) => {
      const token = await SecureStore.getItemAsync("accessToken");

      if (token) {
        headers.set("Authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  endpoints: (builder) => ({
    getBrands: builder.query<any[], void>({
      query: () => "/backoffice/brand",
      transformResponse: (res: { data: any[] }) => res.data,
    }),
    getSizes: builder.query<any[], void>({
      query: () => "/backoffice/product_size",
      transformResponse: (res: { data: any[] }) => res.data,
    }),
    getDepartments: builder.query<any[], void>({
      query: () => "/backoffice/department",
      transformResponse: (res: { data: any[] }) => res.data,
    }),
    getProductTypes: builder.query<any[], void>({
      query: () => "/backoffice/product_type",
      transformResponse: (res: { data: any[] }) => res.data,
    }),
    getFirstCategory: builder.query<any[], void>({
      query: () => "/backoffice/first_category",
      transformResponse: (res: { data: any[] }) => res.data,
    }),
    getSearchDescription: builder.query<any[], void>({
      query: () => "/backoffice/product/search_description",
      transformResponse: (res: { data: any[] }) => res.data,
    }),
  }),
});

export const {
  useGetBrandsQuery,
  useGetSizesQuery,
  useGetDepartmentsQuery,
  useGetProductTypesQuery,
  useGetFirstCategoryQuery,
  useGetSearchDescriptionQuery,
} = apiSlice;
