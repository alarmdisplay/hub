import Joi from '@hapi/joi';

export const createUpdateSchema = Joi.object({
  name: Joi.string().min(1).required(),
  type: Joi.string().valid('organization', 'group', 'vehicle', 'role', 'other').insensitive()
});

export const patchSchema = Joi.object({
  name: Joi.string().min(1),
  type: Joi.string().valid('organization', 'group', 'vehicle', 'role', 'other').insensitive().optional()
});
