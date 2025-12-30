import { useFormContext } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"

export interface TextFieldProps {
  name: string
  label: string
  placeholder?: string
  type?: "text" | "email" | "url" | "tel"
  required?: boolean
  disabled?: boolean
}

export function TextField({
  name,
  label,
  placeholder,
  type = "text",
  required = false,
  disabled = false,
}: TextFieldProps) {
  const form = useFormContext()

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>
            {label}
            {required && <span className="text-destructive"> *</span>}
          </FormLabel>
          <FormControl>
            <Input
              placeholder={placeholder || label}
              type={type}
              disabled={disabled}
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
