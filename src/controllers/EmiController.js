import moment from "moment";
import SendData from "../utils/responses/SendData";
import { validateCheckEMI } from "../utils/validator/validator";

export const checkEMI = async (req, res, next) => {
  try {
    await validateCheckEMI.validateAsync(req.body);

    const {
      booking_date,
      checkin_date,
      down_payment,
      amount,
      instalment_type,
      no_of_emi,
    } = req.body;

    // If the Check In date is within 30 days then Emi is not available
    const daysDiff = moment(checkin_date).diff(moment(booking_date), "days");
    if (daysDiff < 31 || amount < 5) {
      return notEligible(res);
    }

    console.log("days", daysDiff - 14);

    // Installment frequency can be weekly, biweekly & monthly
    if (instalment_type === "weekly") {
      return calculateEMI(
        7,
        daysDiff,
        no_of_emi,
        amount,
        booking_date,
        down_payment,
        res
      );
    } else if (instalment_type === "biweekly") {
      return calculateEMI(
        14,
        daysDiff,
        no_of_emi,
        amount,
        booking_date,
        down_payment,
        res
      );
    } else if (instalment_type === "monthly") {
      return calculateEMI(
        30,
        daysDiff,
        no_of_emi,
        amount,
        booking_date,
        down_payment,
        res
      );
    }
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const calculateEMI = (
  days,
  daysDiff,
  no_of_emi,
  amount,
  booking_date,
  down_payment,
  res
) => {
  // All EMI should be completed before 14 days of check-in
  let minEmiCount = parseInt((daysDiff - 14) / days);
  console.log("calculate emi count", minEmiCount);

  if (no_of_emi > minEmiCount) {
    return notEligible(res);
  }

  minEmiCount = Math.min(no_of_emi, minEmiCount);
  console.log("min emi count", minEmiCount);

  let eachInstallment = +(amount / minEmiCount).toFixed(2);
  console.log("eachInstallment", eachInstallment);
  if (eachInstallment < 5) {
    return notEligible(res);
  }

  // special case
  if (minEmiCount === 1 || amount < 10) {
    return SendData(res, {
      emi_available: true,
      data: [
        {
          emi_date: booking_date,
          amount,
        },
      ],
    });
  }

  // First EMI (down payment) should be 25% or it can be passed by user
  let firstInstallment = eachInstallment;
  if (down_payment) {
    // Minimum installment should be 5
    firstInstallment = amount * 0.25 < 5 ? 5 : +(amount * 0.25).toFixed(2);
  }

  console.log("firstInstallment", firstInstallment);
  const extraAmount = amount - firstInstallment;
  console.log("extraAmount", extraAmount);

  const data = [];

  console.log("Before EmiCount", minEmiCount);
  while (true) {
    if (extraAmount / minEmiCount < 5) {
      minEmiCount--;
    } else {
      break;
    }
  }

  console.log("After EmiCount", minEmiCount);

  if (no_of_emi > minEmiCount) {
    return notEligible(res);
  }

  eachInstallment = +(extraAmount / (minEmiCount - 1)).toFixed(2);

  let sumOfEachamount = 0;
  for (let i = 0; i < minEmiCount; i++) {
    sumOfEachamount = +(
      sumOfEachamount + (i === 0 ? firstInstallment : eachInstallment)
    ).toFixed(2);
    data.push({
      emi_date:
        i === 0
          ? booking_date
          : moment(data[i - 1].emi_date)
              .add("days", days)
              .format("YYYY-MM-DD"),
      amount: i === 0 ? firstInstallment : eachInstallment,
    });
  }

  data[0].amount += +(amount - sumOfEachamount).toFixed(2);
  console.log(sumOfEachamount);

  return SendData(res, {
    emi_available: true,
    data,
  });
};

const notEligible = (res) => {
  return SendData(res, {
    emi_available: false,
    data: [],
  });
};
