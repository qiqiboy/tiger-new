import { Component } from 'react';

interface TitleProps {
    title: string;
}

class Title extends Component<TitleProps> {
    preTitle: string;

    componentDidMount() {
        this.preTitle = document.title;

        document.title = this.props.title + ' - React App';
    }

    componentWillUnmount() {
        // document.title = this.preTitle;
    }

    render() {
        return null;
    }
}

export default Title;
