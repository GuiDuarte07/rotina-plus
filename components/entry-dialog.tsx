"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarIcon } from "lucide-react"
import { useApp } from "@/lib/context"
import { toast } from "sonner"
import type { DataType, Field } from "@/lib/types"

interface EntryDialogProps {
  isOpen: boolean
  dataTypeId: string | null
  onClose: () => void
}

export function EntryDialog({ isOpen, dataTypeId, onClose }: EntryDialogProps) {
  const { dataTypes, addEntry } = useApp()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDataType, setSelectedDataType] = useState<DataType | null>(null)
  const [date, setDate] = useState<Date>(new Date())
  const [fieldValues, setFieldValues] = useState<Record<string, any>>({})
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Carregar o tipo de dado selecionado
  useEffect(() => {
    if (dataTypeId) {
      const dataType = dataTypes.find((dt) => dt.id === dataTypeId)
      if (dataType) {
        setSelectedDataType(dataType)
        // Inicializar os valores dos campos
        const initialValues: Record<string, any> = {}
        dataType.fields.forEach((field) => {
          initialValues[field.id] = getDefaultValue(field)
        })
        setFieldValues(initialValues)
      }
    } else {
      setSelectedDataType(null)
      setFieldValues({})
    }

    // Resetar erros e data ao abrir o modal
    setErrors({})
    setDate(new Date())
  }, [dataTypeId, dataTypes, isOpen])

  // Função para obter o valor padrão com base no tipo do campo
  const getDefaultValue = (field: Field) => {
    switch (field.type) {
      case "boolean":
        return false
      case "number":
        return ""
      case "list":
        return field.options && field.options.length > 0 ? field.options[0] : ""
      case "date":
        return new Date().toISOString()
      default:
        return ""
    }
  }

  const handleFieldChange = (fieldId: string, value: any) => {
    setFieldValues((prev) => ({
      ...prev,
      [fieldId]: value,
    }))

    // Limpar erro do campo quando o usuário digitar
    if (errors[fieldId]) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldId]
        return newErrors
      })
    }
  }

  const validateForm = (): boolean => {
    if (!selectedDataType) return false

    const newErrors: Record<string, string> = {}
    let isValid = true

    // Verificar campos obrigatórios
    selectedDataType.fields.forEach((field) => {
      if (field.required) {
        const value = fieldValues[field.id]

        if (value === undefined || value === null || value === "") {
          newErrors[field.id] = "Este campo é obrigatório"
          isValid = false
        }
      }
    })

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async () => {
    if (!validateForm() || !selectedDataType) return

    try {
      setIsSubmitting(true)

      const fields = Object.entries(fieldValues)
        .filter(([_, value]) => value !== undefined && value !== null && value !== "")
        .map(([fieldId, value]) => ({
          fieldId,
          value,
        }))

      await addEntry({
        dataTypeId: selectedDataType.id,
        date: date.toISOString(),
        fields,
      })

      toast.success("Registro criado com sucesso", {
        description: "O registro foi adicionado ao sistema.",
      })

      onClose()
    } catch (error: any) {
      console.error("Erro ao criar entrada:", error)
      toast.error("Erro ao criar registro", {
        description: error.message || "Ocorreu um erro ao criar o registro.",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderFieldInput = (field: Field) => {
    const value = fieldValues[field.id] ?? ""
    const hasError = !!errors[field.id]

    switch (field.type) {
      case "text":
        return (
          <div className="space-y-1">
            <Textarea
              id={`field-${field.id}`}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={`Digite ${field.name.toLowerCase()}`}
              className={`min-h-[100px] ${hasError ? "border-destructive" : ""}`}
            />
            {hasError && <p className="text-sm text-destructive">{errors[field.id]}</p>}
          </div>
        )
      case "number":
        return (
          <div className="space-y-1">
            <Input
              id={`field-${field.id}`}
              type="number"
              value={value}
              onChange={(e) => handleFieldChange(field.id, Number.parseFloat(e.target.value) || "")}
              placeholder={`Digite ${field.name.toLowerCase()}`}
              className={hasError ? "border-destructive" : ""}
            />
            {hasError && <p className="text-sm text-destructive">{errors[field.id]}</p>}
          </div>
        )
      case "boolean":
        return (
          <div className="flex items-center space-x-2">
            <input
              id={`field-${field.id}`}
              type="checkbox"
              checked={value === true}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="h-4 w-4"
            />
            <label htmlFor={`field-${field.id}`}>Sim</label>
            {hasError && <p className="text-sm text-destructive ml-2">{errors[field.id]}</p>}
          </div>
        )
      case "list":
        return (
          <div className="space-y-1">
            <Select value={value} onValueChange={(val) => handleFieldChange(field.id, val)}>
              <SelectTrigger id={`field-${field.id}`} className={hasError ? "border-destructive" : ""}>
                <SelectValue placeholder={`Selecione ${field.name.toLowerCase()}`} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map((option) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {hasError && <p className="text-sm text-destructive">{errors[field.id]}</p>}
          </div>
        )
      case "date":
        return (
          <div className="space-y-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={`w-full justify-start text-left font-normal ${hasError ? "border-destructive" : ""}`}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {value ? format(new Date(value), "dd/MM/yyyy", { locale: ptBR }) : <span>Selecionar data</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={value ? new Date(value) : undefined}
                  onSelect={(date) => handleFieldChange(field.id, date?.toISOString())}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
            {hasError && <p className="text-sm text-destructive">{errors[field.id]}</p>}
          </div>
        )
      case "image":
        return (
          <div className="space-y-1">
            <Input
              id={`field-${field.id}`}
              type="file"
              accept="image/*"
              className={hasError ? "border-destructive" : ""}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) {
                  handleFieldChange(field.id, file.name)
                }
              }}
            />
            {hasError && <p className="text-sm text-destructive">{errors[field.id]}</p>}
          </div>
        )
      default:
        return (
          <div className="space-y-1">
            <Input
              id={`field-${field.id}`}
              value={value}
              onChange={(e) => handleFieldChange(field.id, e.target.value)}
              placeholder={`Digite ${field.name.toLowerCase()}`}
              className={hasError ? "border-destructive" : ""}
            />
            {hasError && <p className="text-sm text-destructive">{errors[field.id]}</p>}
          </div>
        )
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{selectedDataType ? `Novo Registro - ${selectedDataType.name}` : "Novo Registro"}</DialogTitle>
        </DialogHeader>

        {selectedDataType ? (
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="date">Data</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button id="date" variant="outline" className="w-full justify-start text-left font-normal">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {format(date, "dd/MM/yyyy", { locale: ptBR })}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar mode="single" selected={date} onSelect={(date) => date && setDate(date)} initialFocus />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">Campos</h3>
              {selectedDataType.fields.map((field) => (
                <div key={field.id}>
                  <Label htmlFor={`field-${field.id}`}>
                    {field.name}
                    {field.required && <span className="text-destructive ml-1">*</span>}
                  </Label>
                  {renderFieldInput(field)}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-6 text-center text-muted-foreground">Carregando dados...</div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting || !selectedDataType}>
            {isSubmitting ? "Salvando..." : "Salvar"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

