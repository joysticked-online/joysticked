import type { AnyFieldApi } from '@tanstack/react-form';

export function FieldInfo({ field }: { field: AnyFieldApi }) {
  return (
    <>
      {field.state.meta.isTouched && field.state.meta.errors.length > 0 ? (
        <span className="text-destructive text-sm">{field.state.meta.errors.join(', ')}</span>
      ) : null}
      {field.state.meta.isValidating ? (
        <span className="text-muted-foreground text-sm">Validating...</span>
      ) : null}
    </>
  );
}
