import { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { firebaseAuth } from './firebase';

export function useAuth() {
  const [user, setUser] = useState<User | null>(() => firebaseAuth?.currentUser ?? null);
  const [loading, setLoading] = useState(Boolean(firebaseAuth && !firebaseAuth.currentUser));

  useEffect(() => {
    if (!firebaseAuth) {
      setLoading(false);
      return;
    }

    return onAuthStateChanged(firebaseAuth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
  }, []);

  return { user, loading };
}
