import React, { Component } from 'react';

interface HTMLProps extends React.ComponentProps<'div'> {
    html: string;
}

class HTML extends Component<HTMLProps> {
    render() {
        const { html: __html, ...others } = this.props;

        return <div {...others} dangerouslySetInnerHTML={{ __html }} />;
    }
}

export default HTML;
