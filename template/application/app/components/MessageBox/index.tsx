import React, { Component } from 'react';
import { Panel, Glyphicon } from 'react-bootstrap';
import classlist from 'utils/classlist';
import './style.scss';

export interface IMessageBoxProps {
    message?: React.ReactNode;
    className?: string;
    icon?: React.ReactNode; // 可以自定义iocn，参考：https://getbootstrap.com/docs/3.3/components/
    type: 'primary' | 'warning' | 'danger' | 'success' | 'info' | 'default';
}

class MessageBox extends Component<IMessageBoxProps> {
    static defaultProps = {
        type: 'default'
    };

    defaultIcons = {
        warning: 'info-sign',
        danger: 'remove-sign',
        success: 'ok-sign',
        info: 'plus-sign',
        default: 'question-sign'
    };

    public render() {
        let icon;

        if ('icon' in this.props) {
            icon = this.props.icon;
        } else {
            icon = this.defaultIcons[this.props.type] || 'info-sign';
        }

        const iconNode = typeof icon === 'string' ? <Glyphicon className="mb-icon" glyph={icon} /> : icon;

        return (
            <Panel
                className={classlist('message-box-root', 'message-box-type-' + this.props.type, this.props.className, {
                    'has-icon': icon
                })}>
                {iconNode}
                <Panel.Body>{this.props.message || this.props.children}</Panel.Body>
            </Panel>
        );
    }
}

export default MessageBox;
