import Joi from "joi";

export const validateCheckEMI = Joi.object({
  f_name: Joi.string().required().error(new Error('Please provide your first name!')),
  l_name: Joi.string().required().error(new Error('Please provide your last name!'))
});
