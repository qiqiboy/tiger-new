// import API from 'utils/API';

export default jest.fn(async (url /* ,params,  config*/) => {
    switch (url) {
        default:
            throw new Error('Not mock');
    }
});
