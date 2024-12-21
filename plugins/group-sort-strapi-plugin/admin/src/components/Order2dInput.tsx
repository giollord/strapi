import { Field, Flex, JSONInput, NumberInput } from '@strapi/design-system';
import { forwardRef } from 'react';
import { useTranslation } from '../utils/useTranslation';

const Order2dInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  const { attribute, hint, disabled = false, labelAction, label, name, required = false, onChange, value, error, placeholder } = props;
  const { formatMessage } = useTranslation();

  const handleChange = (i: string) => {
    onChange({
      target: { name, type: attribute.type, value: i },
    });
  };

  return (
    <Field.Root name={name} id={name} error={error} hint={hint} required={required}>
      <Flex direction="column" alignItems="stretch" gap={1}>
        <Field.Label action={labelAction}>{label}</Field.Label>
        <JSONInput
          ref={ref}
          disabled={disabled}
          value={value}
          required={required}
          onChange={handleChange} />
        <Field.Hint />
        <Field.Error />
      </Flex>
    </Field.Root>
  );
});

export default Order2dInput;