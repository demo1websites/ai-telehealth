import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Props {
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  options: string[];
  otherPlaceholder?: string;
}

const OTHER_KEY = "__other__";

const SelectWithOther = ({ value, onValueChange, placeholder, options, otherPlaceholder = "Type your value..." }: Props) => {
  const isOtherSelected = value !== "" && !options.includes(value);
  const [showOther, setShowOther] = useState(isOtherSelected);

  const handleSelectChange = (v: string) => {
    if (v === OTHER_KEY) {
      setShowOther(true);
      onValueChange("");
    } else {
      setShowOther(false);
      onValueChange(v);
    }
  };

  return (
    <div className="space-y-2">
      <Select value={showOther ? OTHER_KEY : value} onValueChange={handleSelectChange}>
        <SelectTrigger><SelectValue placeholder={placeholder} /></SelectTrigger>
        <SelectContent>
          {options.map((o) => (
            <SelectItem key={o} value={o}>{o}</SelectItem>
          ))}
          <SelectItem value={OTHER_KEY}>Other</SelectItem>
        </SelectContent>
      </Select>
      {showOther && (
        <Input
          placeholder={otherPlaceholder}
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          autoFocus
        />
      )}
    </div>
  );
};

export default SelectWithOther;
