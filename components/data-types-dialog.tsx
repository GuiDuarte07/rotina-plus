"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { FieldType, FrequencyType } from "@/lib/types";
import { useApp } from "@/lib/context";

interface Field {
  id: string;
  name: string;
  type: FieldType;
  required: boolean;
  options?: string[];
}

interface DataTypeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editId: string | null;
}

export function DataTypeDialog({
  open,
  onOpenChange,
  editId,
}: DataTypeDialogProps) {
  const { dataTypes, addDataType, updateDataType } = useApp();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<FrequencyType>("daily");
  const [color, setColor] = useState("#3b82f6");
  const [fields, setFields] = useState<Field[]>([
    { id: crypto.randomUUID(), name: "", type: "text", required: false },
  ]);
  const [error, setError] = useState("");
  const [isEditing, setIsEditing] = useState(false);



  // Carregar dados se estiver editando
  useEffect(() => {
    if (editId !== "true" && editId !== null && open) {
      const dataType = dataTypes.find((dt) => dt.id === editId);
      if (dataType) {
        setName(dataType.name);
        setDescription(dataType.description || "");
        setFrequency(dataType.frequency);
        setColor(dataType.color);
        setFields(dataType.fields);
        setIsEditing(true);
      }
    } else if (open) {
      // Reset form quando abrir para criar novo
      resetForm();
      setIsEditing(false);
    }
  }, [editId, open, dataTypes]);

  // Mantém pelo menos um campo do dado com required=true
  useEffect(() => {
    const hasRequired = fields.some(f => f.required === true);
    console.log(hasRequired, fields)
    if (!hasRequired) {
      setFields((fields) => {
        fields[0].required = true
        return fields;
      })
    }
    
  }, [fields])

  const resetForm = () => {
    setName("");
    setDescription("");
    setFrequency("daily");
    setColor("#3b82f6");
    setFields([
      { id: crypto.randomUUID(), name: "", type: "text", required: false },
    ]);
    setError("");
  };

  const addField = () => {
    setFields([
      ...fields,
      { id: crypto.randomUUID(), name: "", type: "text", required: false },
    ]);
  };

  const removeField = (id: string) => {
    if (fields.length > 1) {
      setFields(fields.filter((field) => field.id !== id));
    }
  };

  const updateField = (id: string, updates: Partial<Field>) => {
    setFields(
      fields.map((field) =>
        field.id === id ? { ...field, ...updates } : field
      )
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validação
    if (!name.trim()) {
      setError("O nome é obrigatório");
      return;
    }

    if (fields.some((field) => !field.name.trim())) {
      setError("Todos os campos precisam ter um nome");
      return;
    }

    try {
      setIsSubmitting(true);

      if (isEditing && editId) {
        await updateDataType(editId, {
          name,
          description,
          frequency,
          color,
          fields,
        });
      } else {
        await addDataType({
          name,
          description,
          frequency,
          color,
          fields,
        });
      }

      onOpenChange(false);
      resetForm();
    } catch (error: any) {
      setError(error.message || "Erro ao salvar tipo de dado");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
    resetForm();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90vh] md:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Editar Tipo de Dado" : "Novo Tipo de Dado"}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? "Edite as informações do tipo de dado existente."
              : "Crie um novo tipo de dado para registrar suas informações."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <Label className="pb-1" htmlFor="name">
                Nome
              </Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: Peso, Treino, Diário..."
              />
            </div>

            <div>
              <Label className="pb-1" htmlFor="description">
                Descrição (opcional)
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Descreva o propósito deste tipo de dado"
              />
            </div>

            <div className="flex gap-16">
              <div>
                <Label className="pb-1" htmlFor="frequency">
                  Frequência
                </Label>
                <Select
                  value={frequency}
                  onValueChange={(value) =>
                    setFrequency(value as FrequencyType)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a frequência" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                    <SelectItem value="timeless">Atemporal</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="pb-1" htmlFor="color">
                  Cor
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="color"
                    type="color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                    className="w-12 h-10 p-1"
                  />
                  <div
                    className="w-10 h-10 rounded-md"
                    style={{ backgroundColor: color }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label>Campos</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addField}
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar Campo
                </Button>
              </div>

              <div className="space-y-4">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="grid grid-cols-1 md:grid-cols-5 gap-4 p-4 border rounded-md"
                  >
                    <div className="col-span-2">
                      <Label
                        className="pb-1"
                        htmlFor={`field-name-${field.id}`}
                      >
                        Nome
                      </Label>
                      <Input
                        id={`field-name-${field.id}`}
                        value={field.name}
                        onChange={(e) =>
                          updateField(field.id, { name: e.target.value })
                        }
                        placeholder="Nome do campo"
                      />
                    </div>

                    <div>
                      <Label
                        className="pb-1"
                        htmlFor={`field-type-${field.id}`}
                      >
                        Tipo
                      </Label>
                      <Select
                        value={field.type}
                        onValueChange={(value) =>
                          updateField(field.id, { type: value as FieldType })
                        }
                      >
                        <SelectTrigger id={`field-type-${field.id}`}>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="text">Texto</SelectItem>
                          <SelectItem value="number">Número</SelectItem>
                          <SelectItem value="boolean">Sim/Não</SelectItem>
                          <SelectItem value="list">Lista</SelectItem>
                          <SelectItem value="date">Data</SelectItem>
                          <SelectItem value="image">Imagem</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id={`field-required-${field.id}`}
                        checked={field.required}
                        onChange={(e) =>
                          updateField(field.id, { required: e.target.checked })
                        }
                        className="h-4 w-4"
                        disabled={fields.length <= 1}
                      />
                      <Label
                        className="pb-1"
                        htmlFor={`field-required-${field.id}`}
                      >
                        Obrigatório
                      </Label>
                    </div>

                    <div className="flex items-center justify-center">
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        onClick={() => removeField(field.id)}
                        disabled={fields.length === 1}
                      >
                        <Trash2 className="h-4 w-4 mr-1" /> Remover
                      </Button>
                    </div>

                    {field.type === "list" && (
                      <div className="col-span-full">
                        <Label
                          className="pb-1"
                          htmlFor={`field-options-${field.id}`}
                        >
                          Opções (separadas por vírgula)
                        </Label>
                        <Input
                          id={`field-options-${field.id}`}
                          value={field.options?.join(", ") || ""}
                          onChange={(e) =>
                            updateField(field.id, {
                              options: e.target.value
                                .split(",")
                                .map((opt) => opt.trim())
                                .filter(Boolean),
                            })
                          }
                          placeholder="Opção 1, Opção 2, Opção 3..."
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
