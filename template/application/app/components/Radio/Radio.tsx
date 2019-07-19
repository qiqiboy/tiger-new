import React, { useState } from 'react';
import classlist from 'utils/classlist';
import './style.scss';

export interface RadioProps {
    children?: React.ReactNode;
    className?: string;
    inline?: boolean;
    disabled?: boolean;
    checked?: boolean;
    defaultChecked?: boolean;
    onChange?(checked: boolean): void;
}

const Radio: React.FC<RadioProps> = props => {
    const [checked, setChecked] = useState(() => !!props.defaultChecked);
    const isChecked = typeof props.checked === 'boolean' ? props.checked : checked;
    const onClick = ev => {
        if (!isChecked && !props.disabled && ev.target.nodeName !== 'A') {
            if (typeof props.checked !== 'boolean') {
                setChecked(!isChecked);
            }

            if (props.onChange) {
                props.onChange(!isChecked);
            }
        }
    };

    return (
        <div
            className={classlist('form-radio', props.className, {
                'radio-disabled': props.disabled,
                'radio-checked': isChecked
            })}
            onClick={onClick}>
            <div className="checked-icon" />
            {props.children}
        </div>
    );
};

// @ts-ignore 适配react-bootstrap-formuitl
Radio.formutilType = 'checked';

export default Radio;
