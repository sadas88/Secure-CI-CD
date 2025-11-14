import { NextResponse } from 'next/server';
import { initializeDatabase } from '@/lib/init-db';

export async function GET() {
  try {
    await initializeDatabase();
    return NextResponse.json({ message: 'Database initialized successfully' });
  } catch (error: any) {
    console.error('Error initializing database:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
