export interface UpdateComposerProps {
  value: string;
  onChange: (v: string) => void;
  onSubmit: () => void;
  posting?: boolean;
  disabled?: boolean;
}

