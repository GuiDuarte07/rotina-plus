"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DataTypeList from "./data-type-list"

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("calendar")
  const router = useRouter()

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rotina+</h1>
        <Button onClick={() => router.push("/data-types/new")}>
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
          {/* <CalendarView selectedDate={date} onDateSelect={setDate} /> */}
        </TabsContent>
        <TabsContent value="data-types">
          <DataTypeList />
        </TabsContent>
        <TabsContent value="entries">
          {/* <EntriesList selectedDate={date} /> */}
        </TabsContent>
        <TabsContent value="visualization">
          {/* <DataVisualization /> */}
        </TabsContent>
      </Tabs>
    </div>
  )
}

