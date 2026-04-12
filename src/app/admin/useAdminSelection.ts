// src/app/admin/useAdminSelection.ts
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";

export function useAdminSelection(paramName: string = "id") {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const selectedId = searchParams.get(paramName) || null;

  const select = useCallback((id: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (id) {
      params.set(paramName, id);
    } else {
      params.delete(paramName);
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }, [searchParams, router, pathname, paramName]);

  return { selectedId, select };
}