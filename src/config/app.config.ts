export const appConfig = {
  port: parseInt(process.env.APP_PORT || '3000'),
  name: process.env.APP_NAME || 'KHAO_DELIVERY',
  nodeEnv: process.env.NODE_ENV || 'development',
};

export const systemConfig = {
  deliveryRadiusKm: parseInt(process.env.DELIVERY_RADIUS_KM || '10'),
  orderTimeoutMinutes: parseInt(process.env.ORDER_TIMEOUT_MINUTES || '30'),
  cartExpiryHours: parseInt(process.env.CART_EXPIRY_HOURS || '24'),
  otpExpiryMinutes: parseInt(process.env.OTP_EXPIRY_MINUTES || '10'),
  commissionPercentage: parseInt(process.env.COMMISSION_PERCENTAGE || '15'),
};
