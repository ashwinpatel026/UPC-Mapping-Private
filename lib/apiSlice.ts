import { ENDPOINTS } from "@/config";
import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

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
    getNotifications: builder.query<any[], string | void>({
      query: (operationType) =>
        operationType && operationType !== "all"
          ? `/backoffice/get_notifications/show/${operationType}`
          : "/backoffice/get_notifications",
      transformResponse: (res: { data?: any[] }) =>
        (res.data ?? []).map((n: any) => ({
          ...n,
          operation_type: n.operation_type ?? n.type,
          created_at: n.created_time ?? n.created_at ?? n.createdAt,
          read_at: n.read_at ?? n.readAt ?? n.read_time,
        })),
    }),
    markNotificationRead: builder.mutation<
      { success: boolean },
      { id: number | string; userId?: string | number; deviceId?: string }
    >({
      query: ({ id, ...body }) => {
        const url = `${ENDPOINTS.MARK_NOTIFICATION_READ}/${id}`;
        
        return {
          url,
          method: "POST",
          body,
        };
      },
    }),
    markNotificationsReadBulk: builder.mutation<
      { success: boolean },
      { ids: Array<number | string>; userId?: string | number; deviceId?: string }
    >({
      query: (body) => ({
        url: ENDPOINTS.MARK_NOTIFICATIONS_READ_BULK,
        method: "POST",
        body,
      }),
    }),
    getUnreadCount: builder.query<
      { count: number },
      { userId: string | number }
    >({
      query: ({ userId }) => `${ENDPOINTS.GET_UNREAD_COUNT}?userId=${userId}`,
    }),
    savePushToken: builder.mutation<
      { success: boolean },
      {
        userId: string | number;
        deviceId: string;
        pushToken: string;
        platform?: string;
        osVersion?: string;
        appVersion?: string;
        deviceModel?: string;
        manufacturer?: string;
        isPhysical?: boolean;
      }
    >({
      query: (body) => ({
        url: ENDPOINTS.SAVE_PUSH_TOKEN,
        method: "POST",
        body,
      }),
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
  useGetNotificationsQuery,
  useSavePushTokenMutation,
  useMarkNotificationReadMutation,
  useMarkNotificationsReadBulkMutation,
  useGetUnreadCountQuery,
} = apiSlice;
