import React, { Component } from 'react';

interface DebugProps {
    data: object;
    title: string;
    maxHeight?: number;
    disabled?: boolean;
}

class Debug extends Component<DebugProps> {
    static defaultProps = {
        title: 'Debug'
    };

    render() {
        return process.env.NODE_ENV === 'development' && !this.props.disabled ? (
            <pre
                className="react-app-debug"
                style={{ margin: '30px 0', overflow: 'auto', maxHeight: this.props.maxHeight }}>
                <h4>{this.props.title}：</h4>
                {JSON.stringify(this.props.data, null, 2)}
            </pre>
        ) : null;
    }
}

export default Debug;
