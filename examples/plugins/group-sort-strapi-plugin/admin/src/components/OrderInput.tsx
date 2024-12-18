import { NumberInput } from '@strapi/design-system';
import { forwardRef } from 'react';
import { useIntl } from 'react-intl';

const OrderInput = forwardRef<HTMLInputElement, any>((props, ref) => {
  const { attribute, disabled, intlLabel, name, onChange, required, value } = props;
  const { formatMessage } = useIntl();

  const handleChange = (value: number | undefined) => {
    onChange({
      target: { name, type: attribute.type, value: value },
    });
  };

  return (
    <NumberInput 
      ref={ref}
      name={name}
      disabled={disabled}
      value={value}
      required={required}
      placeholder={formatMessage(intlLabel)}
      onValueChange={handleChange}
    />
  );
});

export { OrderInput };