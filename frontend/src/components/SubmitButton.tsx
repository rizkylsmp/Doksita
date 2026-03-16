interface SubmitButtonProps {
  loading: boolean;
  loadingText: string;
  text: string;
  disabled?: boolean;
}

const SubmitButton = ({
  loading,
  loadingText,
  text,
  disabled,
}: SubmitButtonProps) => (
  <button
    type="submit"
    disabled={loading || disabled}
    className="w-full bg-brand hover:bg-brand-dark disabled:opacity-50 text-white font-semibold py-3 rounded-xl text-sm cursor-pointer transition-colors"
  >
    {loading ? loadingText : text}
  </button>
);

export default SubmitButton;
