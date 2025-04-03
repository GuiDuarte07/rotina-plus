"use client";

import type React from "react";
import { createContext, useContext, useState, useEffect } from "react";
import type { DataType, Entry } from "./types";

interface AppContextType {
  dataTypes: DataType[];
  entries: Entry[];
  addDataType: (
    dataType: Omit<DataType, "id" | "createdAt">
  ) => Promise<DataType>;
  updateDataType: (
    id: string,
    dataType: Partial<DataType>
  ) => Promise<DataType>;
  deleteDataType: (id: string) => Promise<void>;
  addEntry: (entry: Omit<Entry, "id" | "createdAt">) => Promise<Entry>;
  updateEntry: (id: string, entry: Partial<Entry>) => Promise<Entry>;
  deleteEntry: (id: string) => Promise<void>;
  getEntriesByDate: (date: Date) => Promise<Entry[]>;
  getEntriesByDateRange: (startDate: Date, endDate: Date) => Promise<Entry[]>;
  getEntriesByDataType: (dataTypeId: string) => Promise<Entry[]>;
  isLoading: boolean;
  error: string | null;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [dataTypes, setDataTypes] = useState<DataType[]>([]);
  const [entries, setEntries] = useState<Entry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar tipos de dados e entradas ao inicializar
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        await fetchDataTypes();
        await fetchEntries();
      } catch (err) {
        console.error("Erro ao buscar dados iniciais:", err);
        setError("Erro ao carregar dados. Por favor, recarregue a página.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Função para buscar tipos de dados
  const fetchDataTypes = async () => {
    try {
      const response = await fetch("/api/data-types");
      if (!response.ok) throw new Error("Falha ao buscar tipos de dados");

      const data = await response.json();

      // Converter _id para id para manter compatibilidade
      const formattedData = data.map((item: any) => ({
        id: item._id,
        name: item.name,
        description: item.description,
        frequency: item.frequency,
        fields: item.fields.map((field: any) => ({
          id: field._id,
          name: field.name,
          type: field.type,
          required: field.required,
          options: field.options,
        })),
        color: item.color,
        icon: item.icon,
        createdAt: item.createdAt,
      }));

      setDataTypes(formattedData);
    } catch (err) {
      console.error("Erro ao buscar tipos de dados:", err);
      throw err;
    }
  };

  // Função para buscar todas as entradas
  const fetchEntries = async () => {
    try {
      const response = await fetch("/api/entries");
      if (!response.ok) throw new Error("Falha ao buscar entradas");

      const data = await response.json();

      // Converter _id para id para manter compatibilidade
      const formattedData = data.map((item: any) => ({
        id: item._id,
        dataTypeId: item.dataTypeId,
        date: item.date,
        fields: item.fields,
        createdAt: item.createdAt,
      }));

      setEntries(formattedData);
    } catch (err) {
      console.error("Erro ao buscar entradas:", err);
      throw err;
    }
  };

  // Adicionar um novo tipo de dado
  const addDataType = async (dataType: Omit<DataType, "id" | "createdAt">) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/data-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataType),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar tipo de dado");
      }

      const newDataType = await response.json();

      // Converter _id para id para manter compatibilidade
      const formattedDataType = {
        id: newDataType._id,
        name: newDataType.name,
        description: newDataType.description,
        frequency: newDataType.frequency,
        fields: newDataType.fields.map((field: any) => ({
          id: field._id,
          name: field.name,
          type: field.type,
          required: field.required,
          options: field.options,
        })),
        color: newDataType.color,
        icon: newDataType.icon,
        createdAt: newDataType.createdAt,
      };

      setDataTypes((prev) => [...prev, formattedDataType]);
      return formattedDataType;
    } catch (err: any) {
      console.error("Erro ao adicionar tipo de dado:", err);
      setError(err.message || "Erro ao adicionar tipo de dado");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar um tipo de dado existente
  const updateDataType = async (id: string, dataType: Partial<DataType>) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/data-types/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataType),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar tipo de dado");
      }

      const updatedDataType = await response.json();

      // Converter _id para id para manter compatibilidade
      const formattedDataType = {
        id: updatedDataType._id,
        name: updatedDataType.name,
        description: updatedDataType.description,
        frequency: updatedDataType.frequency,
        fields: updatedDataType.fields.map((field: any) => ({
          id: field._id,
          name: field.name,
          type: field.type,
          required: field.required,
          options: field.options,
        })),
        color: updatedDataType.color,
        icon: updatedDataType.icon,
        createdAt: updatedDataType.createdAt,
      };

      setDataTypes((prev) =>
        prev.map((dt) => (dt.id === id ? formattedDataType : dt))
      );
      return formattedDataType;
    } catch (err: any) {
      console.error("Erro ao atualizar tipo de dado:", err);
      setError(err.message || "Erro ao atualizar tipo de dado");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir um tipo de dado
  const deleteDataType = async (id: string) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/data-types/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir tipo de dado");
      }

      setDataTypes((prev) => prev.filter((dt) => dt.id !== id));

      // Também excluir todas as entradas associadas a este tipo de dado
      setEntries((prev) => prev.filter((entry) => entry.dataTypeId !== id));
    } catch (err: any) {
      console.error("Erro ao excluir tipo de dado:", err);
      setError(err.message || "Erro ao excluir tipo de dado");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Adicionar uma nova entrada
  const addEntry = async (entry: Omit<Entry, "id" | "createdAt">) => {
    try {
      setIsLoading(true);

      const response = await fetch("/api/entries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao criar entrada");
      }

      const newEntry = await response.json();

      // Converter _id para id para manter compatibilidade
      const formattedEntry = {
        id: newEntry._id,
        dataTypeId: newEntry.dataTypeId,
        date: newEntry.date,
        fields: newEntry.fields,
        createdAt: newEntry.createdAt,
      };

      setEntries((prev) => [...prev, formattedEntry]);
      return formattedEntry;
    } catch (err: any) {
      console.error("Erro ao adicionar entrada:", err);
      setError(err.message || "Erro ao adicionar entrada");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Atualizar uma entrada existente
  const updateEntry = async (id: string, entry: Partial<Entry>) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/entries/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(entry),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao atualizar entrada");
      }

      const updatedEntry = await response.json();

      // Converter _id para id para manter compatibilidade
      const formattedEntry = {
        id: updatedEntry._id,
        dataTypeId: updatedEntry.dataTypeId,
        date: updatedEntry.date,
        fields: updatedEntry.fields,
        createdAt: updatedEntry.createdAt,
      };

      setEntries((prev) => prev.map((e) => (e.id === id ? formattedEntry : e)));
      return formattedEntry;
    } catch (err: any) {
      console.error("Erro ao atualizar entrada:", err);
      setError(err.message || "Erro ao atualizar entrada");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Excluir uma entrada
  const deleteEntry = async (id: string) => {
    try {
      setIsLoading(true);

      const response = await fetch(`/api/entries/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao excluir entrada");
      }

      setEntries((prev) => prev.filter((e) => e.id !== id));
    } catch (err: any) {
      console.error("Erro ao excluir entrada:", err);
      setError(err.message || "Erro ao excluir entrada");
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Obter entradas por data
  const getEntriesByDate = async (date: Date) => {
    try {
      const dateStr = date.toISOString().split("T")[0];
      const startDate = new Date(dateStr);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(dateStr);
      endDate.setHours(23, 59, 59, 999);

      const response = await fetch(
        `/api/entries?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error("Falha ao buscar entradas por data");
      }

      const data = await response.json();

      // Converter _id para id para manter compatibilidade
      return data.map((item: any) => ({
        id: item._id,
        dataTypeId: item.dataTypeId,
        date: item.date,
        fields: item.fields,
        createdAt: item.createdAt,
      }));
    } catch (err) {
      console.error("Erro ao buscar entradas por data:", err);
      throw err;
    }
  };

  // Obter entradas por intervalo de datas
  const getEntriesByDateRange = async (startDate: Date, endDate: Date) => {
    try {
      const response = await fetch(
        `/api/entries?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );

      if (!response.ok) {
        throw new Error("Falha ao buscar entradas por intervalo de datas");
      }

      const data = await response.json();

      // Converter _id para id para manter compatibilidade
      return data.map((item: any) => ({
        id: item._id,
        dataTypeId: item.dataTypeId,
        date: item.date,
        fields: item.fields,
        createdAt: item.createdAt,
      }));
    } catch (err) {
      console.error("Erro ao buscar entradas por intervalo de datas:", err);
      throw err;
    }
  };

  // Obter entradas por tipo de dado
  const getEntriesByDataType = async (dataTypeId: string) => {
    try {
      const response = await fetch(`/api/entries?dataTypeId=${dataTypeId}`);

      if (!response.ok) {
        throw new Error("Falha ao buscar entradas por tipo de dado");
      }

      const data = await response.json();

      // Converter _id para id para manter compatibilidade
      return data.map((item: any) => ({
        id: item._id,
        dataTypeId: item.dataTypeId,
        date: item.date,
        fields: item.fields,
        createdAt: item.createdAt,
      }));
    } catch (err) {
      console.error("Erro ao buscar entradas por tipo de dado:", err);
      throw err;
    }
  };

  return (
    <AppContext.Provider value={{
        dataTypes,
        entries,
        addDataType,
        updateDataType,
        deleteDataType,
        addEntry,
        updateEntry,
        deleteEntry,
        getEntriesByDate,
        getEntriesByDateRange,
        getEntriesByDataType,
        isLoading,
        error,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useApp must be used within an AppProvider");
  }
  return context;
}
