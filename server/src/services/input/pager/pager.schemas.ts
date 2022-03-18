import Joi from 'joi';

export const createSchema = Joi.object({
  selcall: Joi.string().length(5).required()
});
