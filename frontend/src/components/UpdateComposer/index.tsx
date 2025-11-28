import Input from "../Input";
import PrimaryButton from "../PrimaryButton";
import { composerWrapperStyle, composerActionsStyle } from "./style";
import type { UpdateComposerProps } from "./interface";

export default function UpdateComposer({ value, onChange, onSubmit, posting, disabled }: UpdateComposerProps) {
  const canSend = !disabled && !posting && Boolean(String(value || "").trim());
  return (
    <div style={composerWrapperStyle}>
      <Input
        multiline
        value={value}
        onChange={onChange}
        placeholder="Adicionar comentário"
        style={{ width: "100%" }}
        disabled={disabled}
      />
      <div style={composerActionsStyle}>
        <PrimaryButton disabled={!canSend} onClick={onSubmit}>
          {posting ? "Enviando..." : "Adicionar"}
        </PrimaryButton>
      </div>
    </div>
  );
}
