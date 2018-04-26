import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classlist from 'utils/classlist';
import { Fade } from '../Transition';
import './style.scss';

class Button extends Component {
    static propTypes = {
        className: PropTypes.string,
        disabled: PropTypes.bool.isRequired,
        block: PropTypes.bool.isRequired,
        active: PropTypes.bool.isRequired,
        size: PropTypes.oneOf(['lg', 'md', 'sm', 'xs']).isRequired,
        link: PropTypes.bool.isRequired,
        href: PropTypes.string,
        type: PropTypes.oneOf(['primary', 'danger', 'success', 'danger', 'info', 'default', 'warning']),
        isLoading: PropTypes.bool.isRequired,
        loading: PropTypes.bool.isRequired
    };

    static defaultProps = {
        isLoading: false,
        loading: false,
        disabled: false,
        block: false,
        active: false,
        link: false,
        size: 'md'
    };

    render() {
        const {
            className,
            disabled,
            size,
            type,
            link,
            block,
            active,
            isLoading,
            loading,
            children,
            ...restProps
        } = this.props;

        const Base = typeof this.props.href === 'string' ? 'a' : 'button';

        return (
            <Base
                {...restProps}
                className={classlist(className, 'btn', 'btn-' + size, {
                    ['btn-' + type]: !!type,
                    'btn-disabled': disabled,
                    'btn-loading': isLoading || loading,
                    'btn-block': block,
                    'btn-active': active,
                    'btn-link': link
                })}
                disabled={disabled}>
                <Fade in={!!(isLoading || loading)}>
                    <span className="spin" />
                </Fade>
                {children}
            </Base>
        );
    }
}

export default Button;
