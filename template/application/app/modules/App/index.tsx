import React, { Component } from 'react';
import withLoadable from 'utils/withLoadable';
import { hot } from 'react-hot-loader/root';

const Demo = withLoadable(() => import('../Demo'));

class App extends Component {
    render() {
        return (
            <div className="first-app container">
                <h3 className="text-center">tiger-new</h3>
                <blockquote>
                    <p>
                        To get started, edit <code>app/index.tsx</code> and save to reload.
                    </p>
                </blockquote>
                <Demo />
            </div>
        );
    }
}

export default hot(App);
