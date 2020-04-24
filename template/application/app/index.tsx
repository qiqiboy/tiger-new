import React from 'react';
import ReactDOM from 'react-dom';

import App from 'modules/App';

ReactDOM[__SSR__ ? 'hydrate' : 'render'](<App />, document.getElementById('wrap'));
