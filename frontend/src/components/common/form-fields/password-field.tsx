import { useFormContext } from "react-hook-form"
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { PasswordInput } from "@/components/ui/password-input"

export interface PasswordFieldProps {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  disabled?: boolean
}

export function PasswordField({
  name,
  label,
  placeholder,
  required = false,
  disabled = false,
}: PasswordFieldProps) {
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
            <PasswordInput
              placeholder={placeholder || label}
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
