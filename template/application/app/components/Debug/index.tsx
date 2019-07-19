import React, { Component } from 'react';

interface IProps {
    data: object;
    title: string;
    disabled?: boolean;
}

class Debug extends Component<IProps> {
    static defaultProps = {
        title: 'Debug'
    };

    render() {
        return process.env.NODE_ENV === 'development' && !this.props.disabled ? (
            <pre style={{ margin: '30px 0' }}>
                <h4>{this.props.title}：</h4>
                {JSON.stringify(this.props.data, null, 2)}
            </pre>
        ) : null;
    }
}

export default Debug;
