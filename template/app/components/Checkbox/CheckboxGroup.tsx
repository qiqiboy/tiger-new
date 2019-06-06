import React from 'react';
import Checkbox from './Checkbox';
import classlist from 'utils/classlist';

export interface ICheckboxGroupProps {
    data: Array<{
        value: any;
        label: any;
    }>;
    className?: string;
    value?: any[];
    onChange?(value: any[]): void;
}

const CheckboxGroup: React.FC<ICheckboxGroupProps> = props => {
    const onChange = (item, checked) => {
        if (props.onChange) {
            props.onChange(checked ? props.value!.concat(item.value) : props.value!.filter(v => v !== item.value));
        }
    };

    return (
        <div className={classlist('form-checkbox-group', props.className)}>
            {props.data.map(item => (
                <Checkbox
                    key={item.value}
                    checked={props.value!.includes(item.value)}
                    onChange={onChange.bind(null, item)}>
                    {item.label}
                </Checkbox>
            ))}
        </div>
    );
};

CheckboxGroup.defaultProps = {
    value: []
};

// @ts-ignore 适配react-bootstrap-formuitl
CheckboxGroup.formutilType = 'array';

export default CheckboxGroup;
