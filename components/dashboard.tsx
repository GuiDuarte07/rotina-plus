"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import DataTypeList from "./data-type-list"
import EntriesList from "./entries-list"
import CalendarView from "./calendar-view"
import DataVisualization from "./data-visualization"
import { DataTypeDialog } from "./data-types-dialog"

export default function Dashboard() {
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [activeTab, setActiveTab] = useState("calendar")
  const [dataTypeDialogOpen, setDataTypeDialogOpen] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()


  // Verificar se há um parâmetro na URL para abrir o dialog
  useEffect(() => {
    const newDataType = searchParams.get("new-datatype")
    if (newDataType === "true") {
      setDataTypeDialogOpen(true)
    }
  }, [searchParams])


  const openDataTypeDialog = () => {
    // Atualizar a URL sem recarregar a página
    const url = new URL(window.location.href)
    url.searchParams.set("new-datatype", "true")
    window.history.pushState({}, "", url.toString())

    setDataTypeDialogOpen(true)
  }

  // Função para fechar o dialog e limpar a URL
  const handleDialogOpenChange = (open: boolean) => {
    setDataTypeDialogOpen(open)

    if (!open) {
      // Remover o parâmetro da URL sem recarregar a página
      const url = new URL(window.location.href)
      url.searchParams.delete("new-datatype")
      window.history.pushState({}, "", url.toString())
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Rotina+</h1>
        <Button onClick={openDataTypeDialog}>
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
      <DataTypeDialog open={dataTypeDialogOpen} onOpenChange={handleDialogOpenChange} />
    </div>
    
  )
}

