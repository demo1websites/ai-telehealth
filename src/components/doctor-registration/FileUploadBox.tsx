import { useRef, ReactNode } from "react";
import { Upload } from "lucide-react";

interface Props {
  icon: ReactNode;
  label: string;
  hint: string;
  file: File | null;
  onFileChange: (file: File | null) => void;
  accept?: string;
}

const FileUploadBox = ({ icon, label, hint, file, onFileChange, accept = "image/png,image/jpeg" }: Props) => {
  const ref = useRef<HTMLInputElement>(null);

  return (
    <button
      type="button"
      onClick={() => ref.current?.click()}
      className="flex w-full flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-6 text-center transition-colors hover:border-primary/50 hover:bg-muted/50"
    >
      {file ? (
        <p className="text-sm font-medium text-foreground truncate max-w-full">{file.name}</p>
      ) : (
        <>
          {icon}
          <span className="text-sm font-medium text-foreground">{label}</span>
        </>
      )}
      <span className="text-xs text-muted-foreground">{hint}</span>
      <input ref={ref} type="file" accept={accept} className="hidden" onChange={(e) => onFileChange(e.target.files?.[0] ?? null)} />
    </button>
  );
};

export default FileUploadBox;
