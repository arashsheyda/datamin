export const configuration = () => ({
  prefix: 'api',
  environment: process.env.NODE_ENV,
  host: process.env.APP_HOST,
  port: '9000',
});
