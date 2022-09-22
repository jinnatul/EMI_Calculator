import moment from "moment";
import SendMessage from "../utils/responses/SendMessage";
import SendData from "../utils/responses/SendData";
import { validateCheckEMI } from "../utils/validator/validator";

export const checkEMI = async (req, res, next) => {
  try {
    // await validateCheckEMI.validateAsync(req.body);
    SendData(res, []);
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
