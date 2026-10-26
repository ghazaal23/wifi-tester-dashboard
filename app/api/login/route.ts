// app/api/login/route.ts
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    // Validasi kredensial admin sederhana
    if (username === 'admin' && password === 'admin123') {
      const response = NextResponse.json(
        { success: true, message: 'Login berhasil' },
        { status: 200 }
      )

      // Simpan HTTP-Only Cookie sebagai penanda sesi login
      response.cookies.set('admin_token', 'wifi_tester_secret_session', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 60 * 60 * 24, // Berlaku 1 hari
        path: '/',
      })

      return response
    }

    return NextResponse.json(
      { success: false, message: 'Username atau password yang Anda masukkan salah.' },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, message: 'Terjadi kesalahan sistem server.' },
      { status: 500 }
    )
  }
}
