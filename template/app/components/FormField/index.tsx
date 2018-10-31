import React, { Component, isValidElement } from 'react';
import ReactFormutil, { EasyField, connect } from 'react-formutil';
import classlist from 'utils/classlist';
import './style.scss';

type TRender<T, P> = ($state: ReactFormutil.FieldState<T, P>) => React.ReactNode;

interface IFormFieldProps<T, P, K, D> extends ReactFormutil.EasyFieldComponentProps<T, P, K, D> {
    label: string | React.ReactElement<any> | TRender<T, P>;
    content: React.ReactNode | TRender<T, P>;
    controlClass: string;
    className: string;
    $formutil: ReactFormutil.$Formutil<K, P, D>;
    [key: string]: any;
}

// @ts-ignore
@connect
class FormField<T = any, P = {}, K = {}, D = K> extends Component<Partial<IFormFieldProps<T, P, K, D>>> {
    render() {
        const { $formutil, content, className, controlClass, label, ...others } = this.props;
        const { $weakErrors, $weakFocuses, $weakDirts, $weakStates } = $formutil!;
        const name = others.name as string;
        const hasError = $weakErrors[name] && $weakDirts[name];

        return (
            <div
                className={classlist('form-group form-field-group', className, {
                    'has-label': !!label,
                    'has-error': $weakDirts[name] && $weakErrors[name]
                })}>
                {typeof label === 'function'
                    ? label($weakStates[name])
                    : label && (isValidElement(label) ? label : <label className="form-field-label">{label}</label>)}
                <EasyField
                    {...others}
                    className={classlist(
                        {
                            'form-control': /checkbox|radio/.test(others.type as string) === false
                        },
                        controlClass
                    )}
                />
                {hasError &&
                    $weakFocuses[name] && <div className="form-field-error">{Object.values($weakErrors[name])[0]}</div>}
                {content && (typeof content === 'function' ? (content as TRender<T, P>)($weakStates[name]) : content)}
            </div>
        );
    }
}

export default FormField;
