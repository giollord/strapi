import { TextInput } from '@strapi/design-system';
import { ChangeEvent, EventHandler, forwardRef } from 'react';
import { useIntl } from 'react-intl';

const GroupInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  const { attribute, disabled, intlLabel, name, onChange, required, value } = props;
  const { formatMessage } = useIntl();

  const handleChange: EventHandler<ChangeEvent<HTMLInputElement>> = (e) => {
    onChange({
      target: { name, type: attribute.type, value: e.target.value },
    });
  };

  return (
    <TextInput 
      ref={ref}
      name={name}
      disabled={disabled}
      value={value}
      required={required}
      placeholder={formatMessage(intlLabel)}
      onChange={handleChange}
    />
  );
});

export { GroupInput };