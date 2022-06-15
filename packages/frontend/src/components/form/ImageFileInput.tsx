import { Field } from 'react-final-form';

const ImageFileInput = (name: string, src: string | undefined): JSX.Element => {
  return (
    <Field<FileList> name={name} key={name}>
      {({ input: { onChange, onFocus, onBlur } }): JSX.Element => (
        <div>
          <input
            onFocus={onFocus}
            onBlur={onBlur}
            id={name}
            type="file"
            className="block w-full"
            onChange={({ target }): void => onChange(target.files)}
          />

          <div className="mt-2">
            {src ? (
              <img src={src} className="block w-auto h-48" />
            ) : (
              <div className="block w-auto h-48 bg-gray-300 "></div>
            )}
          </div>
        </div>
      )}
    </Field>
  );
};

export default ImageFileInput;
