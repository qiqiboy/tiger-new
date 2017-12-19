import React, { Component } from 'react';
import FeedBack from 'components/FeedBack';
import './style.scss';

import catImg from 'static/images/cat.jpg';

class App extends Component {
    state = {
        current: 'img'
    };

    navs = {
        img: '显示图片',
        form: '显示表单'
    };

    switchNav = current => {
        this.setState({
            current
        });
    };

    render() {
        return (
            <div className="react-app main">
                <h3>我的react应用</h3>
                <nav>
                    {Object.keys(this.navs).map(type => (
                        <button
                            key={type}
                            className={type == this.state.current ? 'current' : null}
                            onClick={this.switchNav.bind(this, type)}>
                            {this.navs[type]}
                        </button>
                    ))}
                </nav>
                {this.state.current === 'img' ? <img className="my-img" src={catImg} alt="cat" /> : <FeedBack />}
            </div>
        );
    }
}

export default App;
