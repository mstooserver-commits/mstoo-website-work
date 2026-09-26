export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME ?? "MSTOO";
export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ?? process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://preprod.mstoo.co.in";
export const CURRENCY = process.env.NEXT_PUBLIC_CURRENCY ?? "INR";
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
export const RAZORPAY_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_RAZORPAY_KEY ?? process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ?? "";

export const STORAGE_KEYS = {
  location: "mstoo.location",
  user: "mstoo.user",
  searchHistory: "mstoo.searchHistory",
  recentlyViewed: "mstoo.recentlyViewed",
} as const;

export const COOKIES = {
  token: "mstoo_token",
  zone: "mstoo_zone",
  location: "mstoo_location",
} as const;

export const ZONE_HEADER = "zoneId";
export const LOCALIZATION_HEADER = "X-localization";

export const DEFAULT_LOCATION = {
  lat: 28.6139,
  lng: 77.209,
  address: "New Delhi, India",
};

export const IMAGE_BASE_FALLBACKS = [
  "https://api.mstoo.co.in/storage/app/public",
  "https://preprod.mstoo.co.in/storage/app/public",
];

export const ENDPOINTS = {
  config: "/api/v1/customer/config",
  configPages: "/api/v1/customer/config/pages",
  zoneId: "/api/v1/customer/config/get-zone-id",
  placeAutocomplete: "/api/v1/customer/config/place-api-autocomplete",
  placeDetails: "/api/v1/customer/config/place-api-details",
  geocode: "/api/v1/customer/config/geocode-api",
  landing: "/api/v1/customer/landing/contents",

  register: "/api/v1/customer/auth/registration",
  login: "/api/v1/customer/auth/login",
  socialLogin: "/api/v1/customer/auth/social-login",
  customerInfo: "/api/v1/customer/info",
  updateProfile: "/api/v1/customer/update/profile",
  removeAccount: "/api/v1/customer/remove-account",
  updateZone: "/api/v1/customer/update-zone",
  fcmToken: "/api/v1/customer/update/fcm-token",

  sendOtp: "/api/v1/user/verification/send-otp",
  verifyOtp: "/api/v1/user/verification/verify-otp",
  forgetSendOtp: "/api/v1/user/forget-password/send-otp",
  forgetVerifyOtp: "/api/v1/user/forget-password/verify-otp",
  resetPassword: "/api/v1/user/forget-password/reset",

  category: "/api/v1/customer/category",
  categoryChildren: "/api/v1/customer/category/childes",
  banner: "/api/v1/customer/banner",
  campaign: "/api/v1/customer/campaign",
  featuredCategories: "/api/v1/customer/featured-categories",
  service: "/api/v1/customer/service",
  popularService: "/api/v1/customer/service/popular",
  trendingService: "/api/v1/customer/service/trending",
  recentlyViewed: "/api/v1/customer/service/recently-viewed",
  recommendedService: "/api/v1/customer/service/recommended",
  recommendedSearch: "/api/v1/customer/service/search/recommended",
  offers: "/api/v1/customer/service/offers",
  serviceBySubcategory: "/api/v1/customer/service/sub-category/",
  serviceFilter: "/api/v1/customer/service/filter/",
  serviceDetail: "/api/v1/customer/service/detail",
  serviceReview: "/api/v1/customer/service/review/",
  search: "/api/v1/customer/service/search",
  suggestedSearch: "/api/v1/customer/recently-searched-keywords",
  likedServices: "/api/v1/customer/service/liked_services/",
  advertisements: "/api/v1/customer/advertisement",
  blogs: "/api/v1/customer/blogs",

  cartAdd: "/api/v1/customer/cart/add",
  cartList: "/api/v1/customer/cart/list",
  cartRemove: "/api/v1/customer/cart/remove/",
  cartEmpty: "/api/v1/customer/cart/data/empty",
  cartQty: "/api/v1/customer/cart/update-quantity/",
  cartProvider: "/api/v1/customer/cart/update/provider",
  cartOtherInfo: "/api/v1/customer/cart/other-info",

  coupon: "/api/v1/customer/coupon",
  couponApply: "/api/v1/customer/coupon/apply",
  couponRemove: "/api/v1/customer/coupon/remove",

  booking: "/api/v1/customer/booking",
  bookingRequest: "/api/v1/customer/booking/request/get",
  bookingRequestShow: "/api/v1/customer/booking/request/show",
  bookingPlace: "/api/v1/customer/booking/request/send",
  bookingRazorpay: "/api/v1/customer/booking/request/razorpay",
  bookingStatus: "/api/v1/customer/booking/status-update",
  bookingSchedule: "/api/v1/customer/booking/schedule-update",
  bookingComplete: "/api/v1/customer/booking/mark-completed",
  reviewSubmit: "/api/v1/customer/review/submit",
  reviewList: "/api/v1/customer/review",

  address: "/api/v1/customer/address",
  notification: "/api/v1/customer/notification",

  chatCreate: "/api/v1/customer/chat/create-channel",
  chatList: "/api/v1/customer/chat/channel-list",
  chatConversation: "/api/v1/customer/chat/conversation",
  chatSend: "/api/v1/customer/chat/send-message",

  walletTx: "/api/v1/customer/wallet-transaction",
  walletAddFund: "/api/v1/customer/wallet/add-fund",
  loyaltyTx: "/api/v1/customer/loyalty-point-transaction",
  loyaltyTransfer: "/api/v1/customer/loyalty-point/wallet-transfer",

  proConfig: "/api/v1/customer/pro-member/config",
  proPlans: "/api/v1/customer/pro-member/plans",
  proCurrent: "/api/v1/customer/pro-member/current",
  proPurchase: "/api/v1/customer/pro-member/purchase",
  proTransactions: "/api/v1/customer/pro-member/transactions",
  proCancel: "/api/v1/customer/pro-member/cancel",
  proRenew: "/api/v1/customer/pro-member/renew",
  proHistory: "/api/v1/customer/pro-member/history",

  providerList: "/api/v1/customer/provider/list",
  providerDetails: "/api/v1/customer/provider-details",
  providerBySubcategory: "/api/v1/customer/provider/list-by-sub-category",

  customPost: "/api/v1/customer/post",
  customPostBid: "/api/v1/customer/post/bid",
  customPostBidStatus: "/api/v1/customer/post/bid/update-status",
  customPostDetails: "/api/v1/customer/post/details",
  customPostUpdate: "/api/v1/customer/post/update-info",
  customPostBidDetails: "/api/v1/customer/post/bid/details",

  addService: "/api/v1/provider/add_service",
  getAllCat: "/api/v1/getallcat",
  getAllSubCat: "/api/v1/getallsubcatbyid/",
  getFieldsById: "/api/v1/getfieldsbyid/",
  getPaymentGateway: "/api/v1/getpaymentgateway",
  myServices: "/api/v1/provider/myservices",
  providerBooking: "/api/v1/provider/booking",
  providerAccept: "/api/v1/provider/booking/request-accept",
  providerReject: "/api/v1/provider/booking/request-reject",
  providerBank: "/api/v1/provider/get-bank-details",
  providerBankUpdate: "/api/v1/provider/update-bank-details",
  providerWithdraw: "/api/v1/provider/withdraw",
  providerWithdrawMethods: "/api/v1/provider/withdraw/methods",
  providerReportTx: "/api/v1/provider/report/transaction",
  providerReportBooking: "/api/v1/provider/report/booking",
  providerAvailability: "/api/v1/provider/update/availability",
} as const;
