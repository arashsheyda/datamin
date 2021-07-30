import * as Joi from '@hapi/joi';

export const validationSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test', 'provision').required(),
  APP_HOST: Joi.string().alphanum().default('localhost'),
  APP_PORT: Joi.number().default(9000),
});
