export const envConfig = () => ({
  app: {
    nodeEnv: process.env.NODE_ENV ?? 'development',
    port: Number(process.env.PORT ?? 3000),
  },
  database: {
    url: process.env.DATABASE_URL,
  },
  jwt: {
    secret: process.env.JWT_SECRET ?? 'please_change_this_secret',
    expiresIn: process.env.JWT_EXPIRES_IN ?? '7d',
  },
  wechat: {
    appId: process.env.WECHAT_APP_ID ?? '',
    appSecret: process.env.WECHAT_APP_SECRET ?? '',
  },
  admin: {
    initialUsername: process.env.ADMIN_INITIAL_USERNAME ?? 'admin',
    initialPassword: process.env.ADMIN_INITIAL_PASSWORD ?? 'change_me',
  },
});
