import { PLUGIN_ID } from '../pluginId';
import {
  MessageDescriptor,
  useIntl
} from 'react-intl';
import { FormatXMLElementFn, PrimitiveType } from 'intl-messageformat';
import { ReactNode } from 'react';
import { Options as IntlMessageFormatOptions } from 'intl-messageformat';

const getTranslation = (id: string | undefined) => `${PLUGIN_ID}.${id}`;
const useTranslation = () => {
  const intl = useIntl();

  return {
    ...intl,
    formatMessage: (
      descriptor: MessageDescriptor,
      values?: Record<string, ReactNode | PrimitiveType | FormatXMLElementFn<string, ReactNode>>,
      opts?: IntlMessageFormatOptions
    ): string | ReactNode => {
      const formattedMessage = intl.formatMessage(
        { ...descriptor, id: getTranslation(descriptor.id) },
        values,
        opts
      );
      return formattedMessage;
    },
  };
}

export default useTranslation;
