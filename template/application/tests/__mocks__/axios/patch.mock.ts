// import API from 'utils/API';

export default jest.fn(async (url /* ,  config*/) => {
    switch (url) {
        default:
            throw new Error('Not mock');
    }
});
