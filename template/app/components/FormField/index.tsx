import React, { Component, isValidElement } from 'react';
import PropTypes from 'prop-types';
import ReactFormutil, { EasyField, connect } from 'react-formutil';
import classlist from 'utils/classlist';
import './style.scss';

type stateCall = ($state?: ReactFormutil.FieldState) => React.ReactNode;

interface IFormFieldProps extends ReactFormutil.EasyFieldComponentProps {
    label?: string | React.ReactElement<any> | stateCall;
    content?: React.ReactNode | stateCall;
    controlClass?: string;
    className?: string;
    $formutil: ReactFormutil.$Formutil;
}

// @ts-ignore
@connect
class FormField extends Component<IFormFieldProps> {
    static propTypes = {
        content: PropTypes.oneOfType([PropTypes.node, PropTypes.func]), // 表单元素后方额外的内容
        label: PropTypes.oneOfType([PropTypes.string, PropTypes.element, PropTypes.func]), // 表单元素前方额外的内容
        controlClass: PropTypes.string // 传递给表单元素的额外的className
    };

    render() {
        const { $formutil, content, className, controlClass, label, ...others } = this.props;
        const { $weakErrors, $weakFocuses, $weakDirts, $weakStates } = $formutil;
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
                {content && (typeof content === 'function' ? (content as stateCall)($weakStates[name]) : content)}
            </div>
        );
    }
}

export default FormField;
