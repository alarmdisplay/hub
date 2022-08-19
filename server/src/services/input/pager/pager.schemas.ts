import Joi from 'joi';

export const createSchema = Joi.object({
  selcall: Joi.string().regex(/^\d{5}$/).required()
});
