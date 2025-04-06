"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export function useDataTypeDialog() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isOpen, setIsOpen] = useState(false);
  const [dataTypeId, setDataTypeId] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se há um parâmetro new-entry na URL
    const dataTypeParam = searchParams.get("new-datatype");

    if (dataTypeParam) {
      setDataTypeId(dataTypeParam);
      setIsOpen(true);
    } else {
      setDataTypeId(null);
    }
  }, [searchParams]);

  const openDialog = (id: string = "true") => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("new-datatype", id);
    router.push(`?${params.toString()}`);
  };

  const closeDialog = () => {
    // Remover o parâmetro new-entry da URL
    if (searchParams.has("new-datatype")) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("new-datatype");

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
