import React, { Component } from 'react';
import Demo from '../Demo';
import './style.scss';

class App extends Component {
    render() {
        return (
            <div className="first-app">
                <h3 className="title">tiger-new</h3>
                <p>
                    To get started, edit <code>app/index.js</code> and save to reload.
                </p>
                <Demo />
            </div>
        );
    }
}

export default App;
