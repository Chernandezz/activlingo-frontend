import { inject, Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { supabase } from '../../../core/utils/supabase-client';

export const GuestGuard: CanActivateFn = async (_, state) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    const router = inject(Router);
    router.navigate(['/chat']);
    return false;
  }

  return true;
};
