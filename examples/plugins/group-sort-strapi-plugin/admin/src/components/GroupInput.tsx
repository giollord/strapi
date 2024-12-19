import { Field, Flex, TextInput } from '@strapi/design-system';
import { ChangeEvent, EventHandler, forwardRef } from 'react';
import useTranslation from '../utils/useTranslation';

const GroupInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  const { attribute, hint, disabled = false, labelAction, label, name, required = false, onChange, value, error, placeholder } = props;
  const { formatMessage } = useTranslation();

  const handleChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    onChange({
      target: { name, type: attribute.type, value: e.currentTarget.value },
    });
  };

  return (
    <Field.Root name={name} id={name} error={error} hint={hint} required={required}>
      <Flex direction="column" alignItems="stretch" gap={1}>
        <Field.Label action={labelAction}>{label}</Field.Label>
        <TextInput
          ref={ref}
          name={name}
          disabled={disabled}
          value={value}
          required={required}
          placeholder={placeholder || formatMessage({ id: 'group.input.placeholder' })?.toString()}
          onChange={handleChange} />
        <Field.Hint />
        <Field.Error />
      </Flex>
    </Field.Root>
  );
});

export { GroupInput };