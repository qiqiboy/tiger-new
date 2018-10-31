import React from 'react';
import Loadable from 'react-loadable';
import Loading from 'components/Loading';
import ErrorBox from 'components/ErrorBox';

import './style.scss';

function withLoadable(loader) {
    return Loadable({
        loader,
        loading: ({ error, retry }) =>
            error ? <ErrorBox error={error} onClick={retry} /> : <Loading className="app-bundle-loading" />
    });
}

export default withLoadable;
