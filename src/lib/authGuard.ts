import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export const requireAuth = async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');

  if (!token) {
    redirect('/login');
  }
};
