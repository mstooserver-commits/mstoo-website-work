import { ENDPOINTS } from "@/lib/constants";
import { api, apiDelete, apiGet, apiPost, apiPut, apiUpload } from "@/lib/api/client";
import type {
  Address,
  AppConfig,
  Banner,
  Booking,
  Campaign,
  CartItem,
  Category,
  ChatChannel,
  ChatMessage,
  CmsPages,
  LaravelResponse,
  Paginated,
  PlacePrediction,
  ProPlan,
  Provider,
  Service,
  UserInfo,
  WalletTx,
  Zone,
} from "@/types";

export const configApi = {
  get: () => apiGet<AppConfig>(ENDPOINTS.config),
  pages: () => apiGet<CmsPages>(ENDPOINTS.configPages),
};

export const locationApi = {
  zone: (lat: number, lng: number) =>
    apiGet<Zone>(ENDPOINTS.zoneId, { lat, lng }, { headers: { zoneId: "configuration" } }),
  autocomplete: (search_text: string) =>
    apiGet<{ predictions?: PlacePrediction[] } | PlacePrediction[]>(ENDPOINTS.placeAutocomplete, {
      search_text,
    }),
  placeDetails: (placeid: string) => apiGet<unknown>(ENDPOINTS.placeDetails, { placeid }),
  geocode: (lat: number, lng: number) => apiGet<unknown>(ENDPOINTS.geocode, { lat, lng }),
};

export const authApi = {
  login: (body: Record<string, string>) => apiPost<LaravelResponse<{ token?: string } & UserInfo>>(ENDPOINTS.login, body),
  register: (body: Record<string, string>) => apiPost<LaravelResponse>(ENDPOINTS.register, body),
  info: () => apiGet<UserInfo>(ENDPOINTS.customerInfo),
  updateProfile: (body: FormData | Record<string, unknown>) =>
    body instanceof FormData
      ? apiUpload(ENDPOINTS.updateProfile, body)
      : apiPost(ENDPOINTS.updateProfile, body),
  removeAccount: () => apiDelete(ENDPOINTS.removeAccount),
  updateZone: () => apiGet(ENDPOINTS.updateZone),
  sendOtp: (body: Record<string, string>) => apiPost(ENDPOINTS.sendOtp, body),
  verifyOtp: (body: Record<string, string>) => apiPost(ENDPOINTS.verifyOtp, body),
  forgetSendOtp: (body: Record<string, string>) => apiPost(ENDPOINTS.forgetSendOtp, body),
  forgetVerifyOtp: (body: Record<string, string>) => apiPost(ENDPOINTS.forgetVerifyOtp, body),
  resetPassword: (body: Record<string, string>) => apiPut(ENDPOINTS.resetPassword, body),
};

export const catalogApi = {
  banners: () => apiGet<Paginated<Banner>>(ENDPOINTS.banner, { limit: 10, offset: 1 }),
  categories: () => apiGet<Paginated<Category>>(ENDPOINTS.category, { limit: 100, offset: 1 }),
  children: (id: string) =>
    apiGet<Paginated<Category>>(ENDPOINTS.categoryChildren, { limit: 100, offset: 1, id }),
  campaigns: () => apiGet<Paginated<Campaign>>(ENDPOINTS.campaign, { limit: 10, offset: 1 }),
  featuredCategories: () =>
    apiGet<unknown>(ENDPOINTS.featuredCategories, { limit: 100, offset: 1 }),
  services: (offset = 1, extra: Record<string, string | number> = {}) =>
    apiGet<Paginated<Service>>(ENDPOINTS.service, { limit: 10, offset, ...extra }),
  popular: (offset = 1) =>
    apiGet<Paginated<Service>>(ENDPOINTS.popularService, { limit: 10, offset }),
  trending: (offset = 1) =>
    apiGet<Paginated<Service>>(ENDPOINTS.trendingService, { limit: 10, offset }),
  recommended: (offset = 1) =>
    apiGet<Paginated<Service>>(ENDPOINTS.recommendedService, { limit: 10, offset }),
  recentlyViewed: (offset = 1) =>
    apiGet<Paginated<Service>>(ENDPOINTS.recentlyViewed, { limit: 10, offset }),
  offers: (offset = 1) => apiGet<Paginated<Service>>(ENDPOINTS.offers, { limit: 10, offset }),
  bySubcategory: (id: string, offset = 1) =>
    apiGet<Paginated<Service>>(`${ENDPOINTS.serviceBySubcategory}${id}`, { limit: 30, offset }),
  filter: (id: string, params: Record<string, string | number>) =>
    apiGet<Paginated<Service>>(`${ENDPOINTS.serviceFilter}${id}`, { limit: 30, ...params }),
  search: (params: Record<string, string | number>) =>
    apiGet<Paginated<Service>>(ENDPOINTS.search, params),
  detail: (id: string) => apiGet<Service>(`${ENDPOINTS.serviceDetail}/${id}`),
  reviews: (id: string, offset = 1) =>
    apiGet<Paginated<unknown>>(`${ENDPOINTS.serviceReview}${id}`, { offset, limit: 10 }),
  liked: (offset = 1) => apiGet<Paginated<Service>>(`${ENDPOINTS.likedServices}${offset}`),
  blogs: (offset = 1) => apiGet<Paginated<unknown>>(ENDPOINTS.blogs, { offset, limit: 10 }),
};

export const cartApi = {
  list: () => apiGet<Paginated<CartItem> | CartItem[]>(ENDPOINTS.cartList, { limit: 100, offset: 1 }),
  add: (body: Record<string, string>) => apiPost(ENDPOINTS.cartAdd, body),
  remove: (id: string) => apiDelete(`${ENDPOINTS.cartRemove}${id}`),
  empty: () => apiDelete(ENDPOINTS.cartEmpty),
  updateQty: (id: string, quantity: number) =>
    apiPut(`${ENDPOINTS.cartQty}${id}`, { quantity }),
  otherInfo: (body: Record<string, unknown>) => apiPost(ENDPOINTS.cartOtherInfo, body),
};

export const couponApi = {
  list: () => apiGet(ENDPOINTS.coupon, { limit: 100, offset: 1 }),
  apply: (body: Record<string, string>) => apiPost(ENDPOINTS.couponApply, body),
  remove: () => apiPost(ENDPOINTS.couponRemove, {}),
};

export const bookingApi = {
  list: (params: Record<string, string | number> = {}) =>
    apiGet<Paginated<Booking>>(ENDPOINTS.booking, { limit: 10, offset: 1, ...params }),
  details: (id: string) => apiGet<Booking>(`${ENDPOINTS.booking}/${id}`),
  place: (body: Record<string, unknown>) => apiPost(ENDPOINTS.bookingPlace, body),
  razorpay: (body: Record<string, unknown>) => apiPost(ENDPOINTS.bookingRazorpay, body),
  status: (body: Record<string, unknown>) => apiPost(ENDPOINTS.bookingStatus, body),
  reschedule: (body: Record<string, unknown>) => apiPost(ENDPOINTS.bookingSchedule, body),
  complete: (body: Record<string, unknown>) => apiPost(ENDPOINTS.bookingComplete, body),
  review: (body: Record<string, unknown>) => apiPost(ENDPOINTS.reviewSubmit, body),
  requests: (params: Record<string, string | number> = {}) =>
    apiGet(ENDPOINTS.bookingRequest, params),
};

export const addressApi = {
  list: () => apiGet<Address[] | Paginated<Address>>(ENDPOINTS.address),
  create: (body: Record<string, unknown>) => apiPost(ENDPOINTS.address, body),
  update: (id: string, body: Record<string, unknown>) => apiPut(`${ENDPOINTS.address}/${id}`, body),
  remove: (ids: Array<string | number>) =>
    apiPost(ENDPOINTS.address, { _method: "delete", address_ids: ids }),
};

export const walletApi = {
  transactions: (offset = 1) => apiGet<Paginated<WalletTx>>(ENDPOINTS.walletTx, { offset, limit: 10 }),
  addFund: (body: Record<string, unknown>) => apiPost(ENDPOINTS.walletAddFund, body),
  loyalty: (offset = 1) => apiGet<Paginated<WalletTx>>(ENDPOINTS.loyaltyTx, { offset, limit: 10 }),
  transfer: (body: Record<string, unknown>) => apiPost(ENDPOINTS.loyaltyTransfer, body),
};

export const chatApi = {
  create: (body: Record<string, unknown>) => apiPost(ENDPOINTS.chatCreate, body),
  list: (offset = 1) => apiGet<Paginated<ChatChannel>>(ENDPOINTS.chatList, { limit: 10, offset }),
  conversation: (channel_id: string, offset = 1) =>
    apiGet<Paginated<ChatMessage>>(ENDPOINTS.chatConversation, { channel_id, offset, limit: 20 }),
  send: (form: FormData) => apiUpload(ENDPOINTS.chatSend, form),
};

export const providerApi = {
  list: (offset = 1) => apiGet<Paginated<Provider>>(ENDPOINTS.providerList, { limit: 10, offset }),
  details: (id: string) => apiGet<Provider>(ENDPOINTS.providerDetails, { id }),
  myAds: () => apiPost(ENDPOINTS.myServices, {}),
  addService: (form: FormData) => apiUpload(ENDPOINTS.addService, form),
  postCategories: () => apiGet<Array<{ id?: string; name?: string }>>(ENDPOINTS.getAllCat),
  postSubcategories: (id: string) =>
    apiGet<Array<{ id?: string; name?: string }>>(`${ENDPOINTS.getAllSubCat}${id}`),
  postFields: async (id: string) => {
    const { data } = await api.get(`${ENDPOINTS.getFieldsById}${id}`);
    const body = data as Record<string, unknown>;
    return (body?.data ?? body?.content ?? body) as Record<string, unknown>;
  },
  accept: (body: Record<string, unknown>) => apiPost(ENDPOINTS.providerAccept, body),
  reject: (body: Record<string, unknown>) => apiPost(ENDPOINTS.providerReject, body),
  bank: () => apiGet(ENDPOINTS.providerBank),
  updateBank: (body: Record<string, unknown>) => apiPost(ENDPOINTS.providerBankUpdate, body),
  withdraw: (body?: Record<string, unknown>) =>
    body ? apiPost(ENDPOINTS.providerWithdraw, body) : apiGet(ENDPOINTS.providerWithdraw),
  withdrawMethods: () => apiGet(ENDPOINTS.providerWithdrawMethods),
  reports: () => apiGet(ENDPOINTS.providerReportBooking),
  bookings: (params: Record<string, string | number> = {}) =>
    apiGet(ENDPOINTS.providerBooking, { limit: 10, offset: 1, ...params }),
};

export const proMemberApi = {
  config: () => apiGet(ENDPOINTS.proConfig),
  plans: () => apiGet<ProPlan[] | Paginated<ProPlan>>(ENDPOINTS.proPlans),
  current: () => apiGet(ENDPOINTS.proCurrent),
  purchase: (body: Record<string, unknown>) => apiPost(ENDPOINTS.proPurchase, body),
  cancel: (body?: Record<string, unknown>) => apiPost(ENDPOINTS.proCancel, body ?? {}),
  renew: (body?: Record<string, unknown>) => apiPost(ENDPOINTS.proRenew, body ?? {}),
  history: () => apiGet(ENDPOINTS.proHistory),
  transactions: () => apiGet(ENDPOINTS.proTransactions),
};

export const customPostApi = {
  create: (body: Record<string, unknown>) => apiPost(ENDPOINTS.customPost, body),
  mine: (offset = 1) => apiGet(ENDPOINTS.customPost, { offset, limit: 10 }),
  details: (id: string) => apiGet(ENDPOINTS.customPostDetails, { post_id: id, id }),
  bids: (id: string) => apiGet(ENDPOINTS.customPostBid, { post_id: id }),
  bidStatus: (body: Record<string, unknown>) => apiPost(ENDPOINTS.customPostBidStatus, body),
};

export const notificationApi = {
  list: (offset = 1) => apiGet(ENDPOINTS.notification, { offset, limit: 20 }),
};
