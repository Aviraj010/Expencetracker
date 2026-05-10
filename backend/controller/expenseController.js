import expenseModel from "../models/expenseModel.js";
import getDateRange from "../utils/dataFilter.js";
import XLSX from "xlsx";
//add expense
export async function addExpense(req, res) {
  const userId = req.user._id;
  const { description, amount, category, date } = req.body;

  try {
    if (!description || amount == null || !category || !date) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    if (amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Amount must be greater than 0",
      });
    }

    const newExpense = new expenseModel({
      userId,
      description,
      amount,
      category,
      date: new Date(date),
    });

    await newExpense.save();

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      data: newExpense,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Unable to add Expense, server error",
    });
  }
}

//get all expense
export async function getAllExpense(req, res) {
  const userId = req.user._id;

  try {
    const expense = await expenseModel
      .find({ userId })
      .sort({ date: -1 });

    res.json({
      success: true,
      data: expense
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}

//update expense
export async function updateExpense(req,res){
     const { id } = req.params;
  const userId = req.user._id;
  const { description, amount } = req.body;

  try {
    const updatedExpense = await expenseModel.findOneAndUpdate(
      { _id: id, userId },
      { description, amount },
      { new: true }
    );

    if (!updatedExpense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    res.json({
      success: true,
      message: "Updated expense successfully",
      data: updatedExpense,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}

//delete expense
export async function deleteExpense(req, res) {
  const userId = req.user._id;

  try {
    const expense = await expenseModel.findOneAndDelete({
      _id: req.params.id,
      userId,
    });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found",
      });
    }

    return res.json({
      success: true,
      message: `Expense with id ${expense._id} deleted`,
    });

  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}

//download_expense
export async function downloadExpense(req, res) {
  const userId = req.user._id;

  try {
    const expense = await expenseModel
      .find({ userId })
      .sort({ date: -1 });

    const plainData = expense.map((enc) => ({
      Description: enc.description,
      Amount: enc.amount,
      Category: enc.category,
      Date: new Date(enc.date).toLocaleDateString(),
    }));

    // create worksheet
    const worksheet = XLSX.utils.json_to_sheet(plainData);

    // create workbook
    const workbook = XLSX.utils.book_new();

    // append sheet
    XLSX.utils.book_append_sheet(workbook, worksheet, "Expenses");

    // convert workbook into buffer
    const buffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // set headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.setHeader(
      "Content-Disposition",
      "attachment; filename=expense_details.xlsx"
    );

    // send buffer
    return res.send(buffer);

  } catch (err) {
    console.log(err);

    return res.status(500).json({
      success: false,
      message: "server error",
    });
  }
}

//expense over view
export async function getExpenseOverview(req, res) {
  try {
    const userId = req.user._id;
    const { range = "monthly" } = req.query;

    const { start, end } = getDateRange(range);

    const expense = await expenseModel
      .find({
        userId,
        date: { $gte: start, $lte: end },
      })
      .sort({ date: -1 });

    const totalExpense = expense.reduce(
      (acc, cur) => acc + cur.amount,
      0
    );

    const averageExpense =
      expense.length > 0 ? totalExpense / expense.length : 0;

    const numberOfTransactions = expense.length;

    const recentTransactions = expense.slice(0, 9);

    return res.json({
      success: true,
      data: {
        totalExpense,
        averageExpense,
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