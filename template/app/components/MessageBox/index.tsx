import React, { Component } from 'react';
import { Panel, Glyphicon } from 'react-bootstrap';
import classlist from 'utils/classlist';
import './style.less';

export interface IMessageBoxProps {
    message?: React.ReactNode;
    className?: string;
    icon?: string | null; // 可以自定义iocn，参考：https://getbootstrap.com/docs/3.3/components/
    type: 'warning' | 'danger' | 'success' | 'info' | 'default';
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

        return (
            <Panel
                className={classlist('message-box-root', 'message-box-type-' + this.props.type, this.props.className, {
                    'has-icon': icon
                })}>
                {icon && <Glyphicon className="mb-icon" glyph={icon} />}
                <Panel.Body>{this.props.message || this.props.children}</Panel.Body>
            </Panel>
        );
    }
}

export default MessageBox;
