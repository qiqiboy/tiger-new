import React, { Component } from 'react';

interface HTMLProps extends React.HTMLAttributes<HTMLDivElement> {
    html: string;
    [key: string]: any;
}

class HTML extends Component<HTMLProps> {
    render() {
        const { html: __html, ...others } = this.props;

        return <div {...others} dangerouslySetInnerHTML={{ __html }} />;
    }
}

export default HTML;
