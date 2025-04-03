"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { format } from "date-fns"
import { Line, LineChart, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts"
import { useApp } from "@/lib/context"

export default function DataVisualization() {
  const { dataTypes, entries } = useApp()
  const [selectedDataType, setSelectedDataType] = useState<string>("")
  const [selectedField, setSelectedField] = useState<string>("")
  const [chartData, setChartData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  // Filtrar tipos de dados com campos numéricos
  const dataTypesWithNumericFields = dataTypes.filter((type) => type.fields.some((field) => field.type === "number"))

  // Inicializar seleção quando os dados estiverem disponíveis
  useEffect(() => {
    if (dataTypesWithNumericFields.length > 0 && !selectedDataType) {
      setSelectedDataType(dataTypesWithNumericFields[0].id)

      // Selecionar o primeiro campo numérico
      const numericFields = dataTypesWithNumericFields[0].fields.filter((field) => field.type === "number")
      if (numericFields.length > 0) {
        setSelectedField(numericFields[0].id)
      }
    }
  }, [dataTypesWithNumericFields, selectedDataType])

  // Atualizar campo selecionado quando o tipo de dado mudar
  useEffect(() => {
    if (!selectedDataType) return

    const dataType = dataTypes.find((dt) => dt.id === selectedDataType)
    if (!dataType) return

    const numericFields = dataType.fields.filter((field) => field.type === "number")

    if (numericFields.length > 0) {
      setSelectedField(numericFields[0].id)
    } else {
      setSelectedField("")
    }
  }, [selectedDataType, dataTypes])

  // Preparar dados para o gráfico
  useEffect(() => {
    if (!selectedDataType || !selectedField) return

    setIsLoading(true)

    try {
      // Filtrar entradas para o tipo de dado selecionado
      const filteredEntries = entries.filter((entry) => entry.dataTypeId === selectedDataType)

      // Filtrar entradas que têm o campo selecionado
      const entriesWithField = filteredEntries.filter((entry) =>
        entry.fields.some((field) => field.fieldId === selectedField),
      )

      // Preparar dados para o gráfico
      const data = entriesWithField
        .map((entry) => {
          const fieldValue: number = entry.fields.find((field) => field.fieldId === selectedField)?.value

          return {
            date: format(new Date(entry.date), "dd/MM/yyyy"),
            value: fieldValue || 0,
          }
        })
        .sort((a, b) => {
          const dateA = new Date(a.date.split("/").reverse().join("-"))
          const dateB = new Date(b.date.split("/").reverse().join("-"))
          return dateA.getTime() - dateB.getTime()
        })

      setChartData(data)
    } catch (err) {
      console.error("Erro ao preparar dados do gráfico:", err)
      setError("Erro ao preparar dados do gráfico")
    } finally {
      setIsLoading(false)
    }
  }, [selectedDataType, selectedField, entries])

  const getFieldName = () => {
    if (!selectedDataType || !selectedField) return ""

    const dataType = dataTypes.find((dt) => dt.id === selectedDataType)
    if (!dataType) return ""

    const field = dataType.fields.find((f) => f.id === selectedField)
    return field?.name || ""
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Visualização de Dados</CardTitle>
      </CardHeader>
      <CardContent>
        {error ? (
          <div className="bg-destructive/10 text-destructive p-3 rounded-md">{error}</div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Tipo de Dado</label>
                <Select
                  value={selectedDataType}
                  onValueChange={setSelectedDataType}
                  disabled={dataTypesWithNumericFields.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um tipo de dado" />
                  </SelectTrigger>
                  <SelectContent>
                    {dataTypesWithNumericFields.map((type) => (
                      <SelectItem key={type.id} value={type.id}>
                        {type.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Campo</label>
                <Select value={selectedField} onValueChange={setSelectedField} disabled={!selectedDataType}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um campo" />
                  </SelectTrigger>
                  <SelectContent>
                    {selectedDataType &&
                      dataTypes
                        .find((dt) => dt.id === selectedDataType)
                        ?.fields.filter((field) => field.type === "number")
                        .map((field) => (
                          <SelectItem key={field.id} value={field.id}>
                            {field.name}
                          </SelectItem>
                        ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center p-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : chartData.length > 0 ? (
              <div className="h-[300px] mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={2} name={getFieldName()} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="text-center p-8 text-muted-foreground">
                {selectedDataType && selectedField
                  ? "Não há dados suficientes para exibir o gráfico."
                  : "Selecione um tipo de dado e um campo para visualizar o gráfico."}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

