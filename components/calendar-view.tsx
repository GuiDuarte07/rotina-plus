"use client"

import { useState, useEffect } from "react"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { useRouter } from "next/navigation"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { useApp } from "@/lib/context"
import { CalendarDay } from "react-day-picker"

interface CalendarViewProps {
  selectedDate: Date | undefined
  onDateSelect: (date: Date | undefined) => void
}

export default function CalendarView({ selectedDate, onDateSelect }: CalendarViewProps) {
  const { dataTypes, entries, getEntriesByDate, getEntriesByDateRange } = useApp()
  const [entriesForSelectedDate, setEntriesForSelectedDate] = useState<any[]>([])
  const [entriesByDay, setEntriesByDay] = useState<Record<string, any[]>>({})
  const [currentMonth, setCurrentMonth] = useState<Date>(selectedDate || new Date())
  const router = useRouter()

  // Atualizar entradas para a data selecionada
  useEffect(() => {
    const fetchEntriesForSelectedDate = async () => {
      if (selectedDate) {
        try {
          const entriesForDate = await getEntriesByDate(selectedDate)
          setEntriesForSelectedDate(entriesForDate)
        } catch (error) {
          console.error("Erro ao buscar entradas para a data selecionada:", error)
          setEntriesForSelectedDate([])
        }
      }
    }

    fetchEntriesForSelectedDate()
  }, [selectedDate, getEntriesByDate])

  // Pré-carregar entradas para o mês atual
  useEffect(() => {
    const fetchEntriesForMonth = async () => {
      // Criar o primeiro dia do mês
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      // Criar o último dia do mês
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      try {
        // Buscar todas as entradas do mês
        const monthEntries = await getEntriesByDateRange(firstDay, lastDay)

        // Agrupar entradas por dia
        const entriesByDayMap: Record<string, any[]> = {}

        monthEntries.forEach((entry) => {
          const entryDate = new Date(entry.date)
          const dateKey = format(entryDate, "yyyy-MM-dd")

          if (!entriesByDayMap[dateKey]) {
            entriesByDayMap[dateKey] = []
          }

          entriesByDayMap[dateKey].push(entry)
        })

        setEntriesByDay(entriesByDayMap)
      } catch (error) {
        console.error("Erro ao buscar entradas para o mês:", error)
      }
    }

    fetchEntriesForMonth()
  }, [currentMonth, getEntriesByDateRange])

  // Função para renderizar os dias do calendário com indicadores para entradas
  const renderDay = (day: CalendarDay) => {
    const dateKey = format(day.date, "yyyy-MM-dd")
    const dayEntries = entriesByDay[dateKey] || []

    // Agrupar entradas por tipo de dado
    const entriesByType: Record<string, any[]> = {}

    dayEntries.forEach((entry) => {
      if (!entriesByType[entry.dataTypeId]) {
        entriesByType[entry.dataTypeId] = []
      }
      entriesByType[entry.dataTypeId].push(entry)
    })

    return (
      <div className="relative w-full h-full">
        <div>{day.date.getDate()}adsdadasdasdasdas</div>
        <div className="absolute bottom-0 left-0 right-0 flex flex-wrap gap-1 justify-center">
          {Object.keys(entriesByType).map((typeId) => {
            const dataType = dataTypes.find((dt) => dt.id === typeId)
            return (
              <div
                key={typeId}
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: dataType?.color || "#3b82f6" }}
              />
            )
          })}
        </div>
      </div>
    )
  }

  // Atualizar o mês atual quando o calendário mudar de mês
  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Card className="md:col-span-2">
        <CardContent className="pt-6">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={onDateSelect}
            className="rounded-md border"
            locale={ptBR}
            onMonthChange={handleMonthChange}
            /* components={{
              Day: ({ day, ...props }) => <div {...props}>{renderDay(day)}</div>,
            }} */
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">
                {selectedDate ? format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR }) : "Selecione uma data"}
              </h3>
              {selectedDate && (
                <Button size="sm" onClick={() => router.push(`/entries/new?date=${selectedDate.toISOString()}`)}>
                  <Plus className="h-4 w-4 mr-1" /> Adicionar
                </Button>
              )}
            </div>

            {entriesForSelectedDate.length > 0 ? (
              <div className="space-y-2">
                {entriesForSelectedDate.map((entry) => {
                  const dataType = dataTypes.find((dt) => dt.id === entry.dataTypeId)
                  return (
                    <div
                      key={entry.id}
                      className="p-2 border rounded-md cursor-pointer hover:bg-accent"
                      onClick={() => router.push(`/entries/${entry.id}`)}
                    >
                      <div className="flex items-center gap-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: dataType?.color || "#3b82f6" }}
                        />
                        <span>{dataType?.name || "Tipo de dado desconhecido"}</span>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <p className="text-muted-foreground">Nenhum registro para esta data.</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

