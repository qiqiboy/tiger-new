import React, { Component } from 'react';
import { Button, ButtonProps } from 'react-bootstrap';
import Loading from 'components/Loading';
import classlist from 'utils/classlist';
import './style.scss';

export interface IHButtonProps extends ButtonProps {
    loading?: boolean;
}

class HButton extends Component<IHButtonProps> {
    public render() {
        const { children, loading, ...props } = this.props;
        return (
            <Button
                {...props}
                className={classlist(props.className, {
                    'btn-loading': loading
                })}>
                {loading && <Loading type="circle" />}
                {children}
            </Button>
        );
    }
}

export default HButton;
