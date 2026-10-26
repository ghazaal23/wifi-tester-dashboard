// app/api/logout/route.ts
import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ message: 'Logout berhasil' });
  
  // Hapus cookie session
  response.cookies.delete('admin_token');

  return response;
}
