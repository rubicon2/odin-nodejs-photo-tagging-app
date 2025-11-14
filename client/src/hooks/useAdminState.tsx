import * as api from '../ext/api.admin';
import { useEffect, useState } from 'react';

export default function useAdminState() {
  const [isAdmin, setIsAdmin] = useState(false);

  // Use no dependency array, so this re-runs every time the hook is used.
  useEffect(() => {
    api.fetchPhotosWithTags().then((res) => {
      if (res.ok) {
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
    });
  });

  return isAdmin;
}
