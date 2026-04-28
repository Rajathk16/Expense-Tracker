import { NextResponse } from 'next/server';
import connectDb from '../../../config/connectDb';
import Expense from '../../../models/expenseModel';

export async function POST(request) {
  try {
    await connectDb();
    
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { amount, category, description, date } = await request.json();

    // For now, use email as user identifier since we don't have user IDs
    const expense = new Expense({
      user: userEmail, // Using email as user identifier
      amount,
      category,
      description,
      date: date || new Date(),
    });

    await expense.save();
    return NextResponse.json({ message: 'Expense added successfully', expense }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: 'Error adding expense', error: error.message }, { status: 500 });
  }
}