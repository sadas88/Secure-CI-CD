import { NextRequest, NextResponse } from 'next/server';
import { getDataSource } from '@/lib/database';
import { User } from '@/lib/entities/User';
import { comparePassword, generateToken } from '@/lib/auth';
import { logAudit, AuditAction } from '@/lib/audit';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Email and password are required' }, { status: 400 });
    }

    const dataSource = await getDataSource();
    const userRepository = dataSource.getRepository(User);

    const user = await userRepository.findOne({ where: { email: email.toLowerCase() } });

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const isValidPassword = await comparePassword(password, user.password);

    if (!isValidPassword) {
      // Increment failed login attempts
      user.failedLoginAttempts += 1;
      await userRepository.save(user);

      if (user.failedLoginAttempts >= 5) {
        user.isActive = false;
        await userRepository.save(user);
        return NextResponse.json({ error: 'Account locked due to multiple failed attempts' }, { status: 401 });
      }

      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Reset failed attempts and update last login
    user.failedLoginAttempts = 0;
    user.lastLogin = new Date();
    await userRepository.save(user);

    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await logAudit(user.id, user.email, user.role, AuditAction.LOGIN, 'User', user.id, 'User logged in', req);

    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });

    return response;
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
