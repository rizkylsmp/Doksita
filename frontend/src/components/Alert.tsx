import { CheckCircleIcon, ExclamationCircleIcon } from "./icons";

interface AlertProps {
  type: "success" | "error";
  message: string;
}

const Alert = ({ type, message }: AlertProps) => {
  const styles =
    type === "success"
      ? "bg-accent-light border-emerald-200 text-emerald-700"
      : "bg-danger-light border-red-200 text-danger-dark";

  return (
    <div
      className={`mb-4 flex items-center gap-2 text-sm border rounded-lg px-4 py-3 ${styles}`}
    >
      {type === "success" ? (
        <CheckCircleIcon className="w-5 h-5 shrink-0" />
      ) : (
        <ExclamationCircleIcon className="w-5 h-5 shrink-0" />
      )}
      {message}
    </div>
  );
};

export default Alert;
