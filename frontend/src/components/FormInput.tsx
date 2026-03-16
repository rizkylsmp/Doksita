import type { ReactNode } from "react";

interface FormInputProps {
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  icon: ReactNode;
  maxLength?: number;
  className?: string;
}

const FormInput = ({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  icon,
  maxLength,
  className = "",
}: FormInputProps) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1.5">
      {label}
    </label>
    <div className="relative">
      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted">
        {icon}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        maxLength={maxLength}
        className={`w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm bg-white outline-none focus:border-brand focus:ring-2 focus:ring-brand-light transition-colors ${className}`}
      />
    </div>
  </div>
);

export default FormInput;
