"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DataTypeList from "./data-type-list";
import EntriesList from "./entries-list";
import CalendarView from "./calendar-view";
import DataVisualization from "./data-visualization";
import { DataTypeDialog } from "./data-types-dialog";
import { useEntryDialog } from "@/hooks/use-entry-dialog";
import { EntryDialog } from "@/components/entry-dialog";
import { useDataTypeDialog } from "@/hooks/use-datatype-dialog";

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [activeTab, setActiveTab] = useState("calendar");
  const entryDialog = useEntryDialog();
  const dataTypeDialog = useDataTypeDialog();


  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rotina+</h1>
        <Button onClick={() => dataTypeDialog.openDialog()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Tipo de Dado
        </Button>
      </div>

      <Tabs defaultValue="calendar" onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
          <TabsTrigger value="data-types">Tipos de Dados</TabsTrigger>
          <TabsTrigger value="entries">Registros</TabsTrigger>
          <TabsTrigger value="visualization">Gráficos</TabsTrigger>
        </TabsList>
        <TabsContent value="calendar">
          <CalendarView selectedDate={date} onDateSelect={setDate} />
        </TabsContent>
        <TabsContent value="data-types">
          <DataTypeList />
        </TabsContent>
        <TabsContent value="entries">
          <EntriesList selectedDate={date} />
        </TabsContent>
        <TabsContent value="visualization">
          <DataVisualization />
        </TabsContent>
      </Tabs>

      {/* Dialog para criar/editar tipos de dados */}
      <DataTypeDialog
        open={dataTypeDialog.isOpen}
        editId={dataTypeDialog.dataTypeId}
        onOpenChange={dataTypeDialog.closeDialog}
      />

      {/* Modal de entrada de dados */}
      <EntryDialog
        isOpen={entryDialog.isOpen}
        dataTypeId={entryDialog.dataTypeId}
        onClose={entryDialog.closeDialog}
      />
    </div>
  );
}
