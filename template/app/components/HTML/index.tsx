import React, { Component } from 'react';

interface IProps {
    html: string;
    [key: string]: any;
}

class HTML extends Component<IProps> {
    render() {
        const { html: __html, ...others } = this.props;

        return <div {...others} dangerouslySetInnerHTML={{ __html }} />;
    }
}

export default HTML;
