import incomeModel from "../models/incomeModel.js";
import XLSX from "xlsx"
import getDateRange from "../utils/dataFilter.js";



// add income
export async function addIncome(req, res) {
  const userId = req.user._id;
  const { description, amount, category, date } = req.body;

  try {
    if (!description || !amount || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const newIncome = new incomeModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });

    await newIncome.save();

    res.json({
      success: true,
      message: "Income added successfully",
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Unable to add income, server error",
    });
  }
}

//to get income
export async function getAllIncome(req, res) {
  const userId = req.user._id;

  try {
    const income = await incomeModel
      .find({ userId })
      .sort({ date: -1 });

    res.json(income);
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}

//update an income
export async function updateIncome(req, res) {
  const { id } = req.params;
  const userId = req.user._id;
  const { description, amount } = req.body;

  try {
    const updatedIncome = await incomeModel.findOneAndUpdate(
      { _id: id, userId },
      { description, amount },
      { new: true }
    );

    if (!updatedIncome) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    res.json({
      success: true,
      message: "Updated successfully",
      data: updatedIncome,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}
// to delete an income
export async function deleteIncome(req, res) {
  try {
    // delete income by ID from URL params
    const income = await incomeModel.findByIdAndDelete(req.params.id);

    // if no income found
    if (!income) {
      return res.status(404).json({
        success: false,
        message: "Income not found",
      });
    }

    // success response
    return res.json({
      success: true,
      message: `Income with id ${income._id} deleted`,
    });

  } catch (err) {
    // server error
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}

//Download the data  in an excel sheet
export async function downloadIncomeExcel(req, res) {
  const userId = req.user._id;

  try {
    const income = await incomeModel
      .find({ userId })
      .sort({ date: -1 });

    const plainData = income.map((inc) => ({
      Description: inc.description,
      Amount: inc.amount,
      Category: inc.category,
      Date: new Date(inc.date).toLocaleDateString(),
    }));

    // create worksheet
    const worksheet = XLSX.utils.json_to_sheet(plainData);

    // create workbook
    const workbook = XLSX.utils.book_new();

    // append worksheet
    XLSX.utils.book_append_sheet(workbook, worksheet, "Income");

    // convert workbook to buffer
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=income_details.xlsx"
    );

    // send file buffer
    return res.send(buffer);

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}

//to get income overview
export async function getIncomeOverview(req, res) {
  try {
    const userId = req.user._id;

    // query params come from req.query (NOT res.query)
    const { range = "monthly" } = req.query;

    const { start, end } = getDateRange(range);

    const incomes = await incomeModel
      .find({
        userId,
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });

    const totalIncome = incomes.reduce((acc, cur) => acc + cur.amount, 0);

    const averageIncome =
      incomes.length > 0 ? totalIncome / incomes.length : 0;

    const numberOfTransactions = incomes.length;

    const recentTransactions = incomes.slice(0, 9);

    return res.json({
      success: true,
      data: {
        totalIncome,
        averageIncome,
        numberOfTransactions,
        recentTransactions,
        range,
      },
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}