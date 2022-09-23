import { Field } from 'react-final-form';
import { AxiosResponse, AxiosError } from 'axios';
import { FieldErrorMessage } from '@/components/form/FieldErrorMessage';

interface TextareaInputParams {
  name: string;
  apiResponse: AxiosResponse<unknown> | AxiosError | null;
  disabled?: boolean;
}

export const TextareaInput = ({
  name,
  apiResponse,
  disabled,
}: TextareaInputParams): JSX.Element => {
  return (
    <Field name={name} key={name}>
      {({ input }): JSX.Element => (
        <div>
          <textarea
            type="text"
            id={name}
            {...input}
            autoComplete="off"
            className="block w-full resize-y"
            rows={4}
            disabled={disabled || false}
          />
          {apiResponse && (
            <FieldErrorMessage name="name" apiResponse={apiResponse} />
          )}
        </div>
      )}
    </Field>
  );
};
