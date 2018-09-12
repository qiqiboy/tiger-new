import React from 'react';
import ReactFormutil from 'react-formutil';

type stateCall = ($state?: ReactFormutil.FieldState) => React.ReactNode;

interface FormFieldProps extends ReactFormutil.EasyFieldComponentProps {
    label?: string | React.ReactElement<any> | stateCall;
    content?: React.ReactNode | stateCall;
    controlClass?: string;
    className?: string;
}

class FormField extends React.Component<FormFieldProps> {}

export default FormField;
