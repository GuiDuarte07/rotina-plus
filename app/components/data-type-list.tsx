"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Plus } from "lucide-react"
import { useRouter } from "next/navigation"
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

interface DataType {
  _id: string
  name: string
  description: string
  frequency: string
  color: string
  fields: {
    name: string
    type: string
    required: boolean
  }[]
}

export default function DataTypeList() {
  const [dataTypes, setDataTypes] = useState<DataType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [dataTypeToDelete, setDataTypeToDelete] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchDataTypes = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/data-types")
        if (response.ok) {
          const data = await response.json()
          setDataTypes(data)
        }
      } catch (error) {
        console.error("Erro ao buscar tipos de dados:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDataTypes()
  }, [])

  const handleDelete = async () => {
    if (!dataTypeToDelete) return

    try {
      const response = await fetch(`/api/data-types/${dataTypeToDelete}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setDataTypes((prev) => prev.filter((dt) => dt._id !== dataTypeToDelete))
      }
    } catch (error) {
      console.error("Erro ao excluir tipo de dado:", error)
    } finally {
      setDataTypeToDelete(null)
      setDeleteDialogOpen(false)
    }
  }

  const frequencyLabels = {
    daily: "Diário",
    weekly: "Semanal",
    monthly: "Mensal",
    yearly: "Anual",
    timeless: "Atemporal",
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Tipos de Dados</h2>
        <Button onClick={() => router.push("/data-types/new")}>
          <Plus className="mr-2 h-4 w-4" /> Novo Tipo de Dado
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : dataTypes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {dataTypes.map((dataType) => (
            <Card key={dataType._id} className="overflow-hidden">
              <div className="h-2" style={{ backgroundColor: dataType.color }}></div>
              <CardHeader className="pb-2">
                <CardTitle>{dataType.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">{dataType.description || "Sem descrição"}</p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                      {frequencyLabels[dataType.frequency as keyof typeof frequencyLabels]}
                    </span>
                    <span className="text-xs bg-secondary text-secondary-foreground px-2 py-1 rounded-md">
                      {dataType.fields.length} campo(s)
                    </span>
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button variant="outline" size="sm" onClick={() => router.push(`/data-types/${dataType._id}`)}>
                      <Edit className="h-4 w-4 mr-1" /> Editar
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => {
                        setDataTypeToDelete(dataType._id)
                        setDeleteDialogOpen(true)
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Excluir
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-6">
            <p className="text-muted-foreground mb-4">Você ainda não criou nenhum tipo de dado.</p>
            <Button onClick={() => router.push("/data-types/new")}>
              <Plus className="mr-2 h-4 w-4" /> Criar Primeiro Tipo de Dado
            </Button>
          </CardContent>
        </Card>
      )}

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente este tipo de dado e todos os registros
              associados a ele.
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

