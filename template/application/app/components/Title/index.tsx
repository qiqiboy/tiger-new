import { Component } from 'react';

interface ITitleProps {
    title: string;
}

class Title extends Component<ITitleProps> {
    preTitle: string;

    componentDidMount() {
        this.preTitle = document.title;

        document.title = this.props.title + ' - Tiger Trade';
    }

    componentWillUnmount() {
        // document.title = this.preTitle;
    }

    render() {
        return null;
    }
}

export default Title;
