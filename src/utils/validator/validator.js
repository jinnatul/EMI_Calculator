import Joi from "joi";

export const validateCheckEMI = Joi.object({
  booking_date: Joi.string()
    .required()
    .error(new Error("Please provide booking date!")),
  checkin_date: Joi.string()
    .required()
    .error(new Error("Please provide checkin date!")),
  down_payment: Joi.any().error(new Error("Please provide down payment info!")),
  amount: Joi.number().required().error(new Error("Please provide amount!")),
  instalment_type: Joi.string()
    .valid("weekly", "biweekly", "monthly")
    .required()
    .error(new Error("Please provide valid instalment type!")),
  no_of_emi: Joi.any().error(new Error("Please provide no of emi!")),
});
