import React from 'react';
import Radio from './Radio';
import classlist from 'utils/classlist';

export interface RadioGroupProps {
    data: Array<{
        value: any;
        label: any;
    }>;
    className?: string;
    value?: any[];
    onChange?(value: any[]): void;
}

const RadioGroup: React.FC<RadioGroupProps> = props => {
    const onChange = item => {
        if (props.onChange) {
            props.onChange(item.value);
        }
    };

    return (
        <div className={classlist('form-radio-group', props.className)}>
            {props.data.map(item => (
                <Radio key={item.value} checked={props.value === item.value} onChange={onChange.bind(null, item)}>
                    {item.label}
                </Radio>
            ))}
        </div>
    );
};

export default RadioGroup;
