import { NextResponse } from 'next/server';
import connectDb from '../../../../config/connectDb';
import Expense from '../../../../models/expenseModel';

export async function GET(request, { params }) {
  try {
    await connectDb();
    
    const userEmail = request.headers.get('x-user-email');
    if (!userEmail) {
      return NextResponse.json({ message: 'User not authenticated' }, { status: 401 });
    }

    const { category } = params;
    
    const expenses = await Expense.find({ 
      user: userEmail, 
      category: category.replace('-', ' ') 
    }).sort({ date: -1 });

    return NextResponse.json(expenses);
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching expenses', error: error.message }, { status: 500 });
  }
}