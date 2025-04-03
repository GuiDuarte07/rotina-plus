"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  addMonths,
  addYears,
  subMonths,
  subYears,
} from "date-fns"
import { ptBR } from "date-fns/locale"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Entry {
  _id: string
  dataTypeId: string
  date: string
  fields: {
    fieldId: string
    value: any
  }[]
}

interface DataType {
  _id: string
  name: string
  color: string
  fields: {
    _id: string
    name: string
    type: string
  }[]
}

interface EntriesListProps {
  selectedDate?: Date
}

type DateFilterType = "day" | "month" | "year"

export default function EntriesList({ selectedDate }: EntriesListProps) {
  const [entries, setEntries] = useState<Entry[]>([])
  const [dataTypes, setDataTypes] = useState<DataType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null)
  const [selectedDataType, setSelectedDataType] = useState<string | "all">("all")
  const [currentDate, setCurrentDate] = useState<Date>(selectedDate || new Date())
  const [dateFilterType, setDateFilterType] = useState<DateFilterType>("month") // Default to month view
  const router = useRouter()

  // Buscar tipos de dados
  useEffect(() => {
    const fetchDataTypes = async () => {
      try {
        const response = await fetch("/api/data-types")
        if (response.ok) {
          const data = await response.json()
          setDataTypes(data)
        }
      } catch (error) {
        console.error("Erro ao buscar tipos de dados:", error)
      }
    }

    fetchDataTypes()
  }, [])

  // Atualizar o filtro de data quando selectedDate mudar
  useEffect(() => {
    if (selectedDate) {
      setCurrentDate(selectedDate)
    }
  }, [selectedDate])

  // Buscar entradas com filtros
  useEffect(() => {
    const fetchEntries = async () => {
      try {
        setIsLoading(true)
        let url = "/api/entries?"

        if (selectedDataType && selectedDataType !== "all") {
          url += `dataTypeId=${selectedDataType}&`
        }

        // Definir intervalo de datas com base no tipo de filtro
        let startDate: Date, endDate: Date

        if (dateFilterType === "day") {
          // Filtrar por dia específico
          startDate = new Date(currentDate)
          startDate.setHours(0, 0, 0, 0)

          endDate = new Date(currentDate)
          endDate.setHours(23, 59, 59, 999)
        } else if (dateFilterType === "month") {
          // Filtrar por mês
          startDate = startOfMonth(currentDate)
          endDate = endOfMonth(currentDate)
        } else {
          // Filtrar por ano
          startDate = startOfYear(currentDate)
          endDate = endOfYear(currentDate)
        }

        url += `startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`

        const response = await fetch(url)
        if (response.ok) {
          const data = await response.json()
          setEntries(data)
        }
      } catch (error) {
        console.error("Erro ao buscar entradas:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchEntries()
  }, [selectedDataType, currentDate, dateFilterType])

  const handleDelete = async () => {
    if (!entryToDelete) return

    try {
      const response = await fetch(`/api/entries/${entryToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setEntries((prev) => prev.filter((entry) => entry._id !== entryToDelete))
      }
    } catch (error) {
      console.error("Erro ao excluir entrada:", error)
    } finally {
      setEntryToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  // Navegar para o período anterior
  const navigatePrevious = () => {
    if (dateFilterType === "day") {
      setCurrentDate((prev) => new Date(prev.setDate(prev.getDate() - 1)))
    } else if (dateFilterType === "month") {
      setCurrentDate((prev) => subMonths(prev, 1))
    } else {
      setCurrentDate((prev) => subYears(prev, 1))
    }
  }

  // Navegar para o próximo período
  const navigateNext = () => {
    if (dateFilterType === "day") {
      setCurrentDate((prev) => new Date(prev.setDate(prev.getDate() + 1)))
    } else if (dateFilterType === "month") {
      setCurrentDate((prev) => addMonths(prev, 1))
    } else {
      setCurrentDate((prev) => addYears(prev, 1))
    }
  }

  // Formatar o título do período atual
  const formatPeriodTitle = () => {
    if (dateFilterType === "day") {
      return format(currentDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
    } else if (dateFilterType === "month") {
      return format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })
    } else {
      return format(currentDate, "yyyy", { locale: ptBR })
    }
  }

  // Função para renderizar o valor de um campo
  const renderFieldValue = (field: { fieldId: string; value: any }, dataType: DataType | undefined) => {
    if (!dataType) return String(field.value)

    const fieldDef = dataType.fields.find((f) => f._id === field.fieldId)
    if (!fieldDef) return String(field.value)

    switch (fieldDef.type) {
      case "boolean":
        return field.value ? "Sim" : "Não"
      case "date":
        return format(new Date(field.value), "dd/MM/yyyy", { locale: ptBR })
      case "list":
        return field.value
      default:
        return String(field.value)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold">Registros</h2>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Select value={selectedDataType} onValueChange={(value) => setSelectedDataType(value)}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {dataTypes.map((type) => (
                <SelectItem key={type._id} value={type._id}>
                  {type.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Controles de período */}
      <div className="flex flex-col space-y-4">
        <Tabs value={dateFilterType} onValueChange={(value) => setDateFilterType(value as DateFilterType)}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="day">Dia</TabsTrigger>
            <TabsTrigger value="month">Mês</TabsTrigger>
            <TabsTrigger value="year">Ano</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="flex items-center justify-between">
          <Button variant="outline" size="icon" onClick={navigatePrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-medium">{formatPeriodTitle()}</h3>
          <Button variant="outline" size="icon" onClick={navigateNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : entries.length > 0 ? (
        <div className="space-y-4">
          {entries.map((entry) => {
            const dataType = dataTypes.find((dt) => dt._id === entry.dataTypeId)
            return (
              <Card key={entry._id}>
                <div className="h-2" style={{ backgroundColor: dataType?.color || "#3b82f6" }}></div>
                <CardContent className="p-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <div>
                      <h3 className="font-medium">{dataType?.name || "Tipo desconhecido"}</h3>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(entry.date), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => router.push(`/entries/${entry._id}`)}>
                        <Edit className="h-4 w-4 mr-1" /> Editar
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          setEntryToDelete(entry._id)
                          setDeleteDialogOpen(true)
                        }}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Excluir
                      </Button>
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {entry.fields.map((field) => (
                      <div key={field.fieldId} className="flex flex-col">
                        <span className="text-xs text-muted-foreground">
                          {dataType?.fields.find((f) => f._id === field.fieldId)?.name || "Campo desconhecido"}
                        </span>
                        <span className="truncate">{renderFieldValue(field, dataType)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground mb-4">Nenhum registro encontrado para os filtros selecionados.</p>
            <Button onClick={() => router.push("/entries/new")}>
              <Plus className="mr-2 h-4 w-4" /> Criar Novo Registro
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente este registro.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

