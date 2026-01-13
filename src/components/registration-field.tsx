import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";

interface RegistrationFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  error?: string[];
  required?: boolean;
}

export function RegistrationField({
  name,
  label,
  type = "text",
  placeholder,
  error,
  required = true,
}: RegistrationFieldProps) {
  return (
    <div className="space-y-2">
      <Label htmlFor={name} className="label">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <Input
        id={name}
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        className={error ? "border-destructive" : ""}
      />
      {error && <p className="body-xs text-destructive">{error[0]}</p>}
    </div>
  );
}
