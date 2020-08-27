import Joi from "@hapi/joi";

export const createSchema = Joi.object({
  selcall: Joi.string().length(5).required()
})
