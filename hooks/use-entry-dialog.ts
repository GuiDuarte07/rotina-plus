"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useEntryDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [dataTypeId, setDataTypeId] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se há um parâmetro new-entry na URL
    const newEntryParam = searchParams.get("new-entry");

    if (newEntryParam) {
      setDataTypeId(newEntryParam);
      setIsOpen(true);
    } else {
      setDataTypeId(null);
    }
  }, [searchParams]);

  const openDialog = (id?: string) => {
    if (id) {
      // Atualizar a URL com o parâmetro new-entry
      const params = new URLSearchParams(searchParams.toString());
      params.set("new-entry", id);
      router.push(`?${params.toString()}`);
    } else {
      setIsOpen(true);
    }
  };

  const closeDialog = () => {
    // Remover o parâmetro new-entry da URL
    if (searchParams.has("new-entry")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("new-entry");

      // Se não houver mais parâmetros, voltar para a URL base
      const newUrl = params.toString()
        ? `?${params.toString()}`
        : window.location.pathname;
      router.push(newUrl);
    }

    setIsOpen(false);
    setDataTypeId(null);
  };

  return {
    isOpen: isOpen || !!dataTypeId,
    dataTypeId,
    openDialog,
    closeDialog,
  };
}
