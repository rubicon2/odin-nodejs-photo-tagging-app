import * as api from '../ext/api.admin';
import { useEffect, useState } from 'react';

export default function useAdminState() {
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    api.fetchPhotosWithTags().then((res) => {
      if (res.ok) {
        setIsAdmin(true);
      }
    });
  }, []);

  return isAdmin;
}
