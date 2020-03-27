import API from 'utils/API';

export default jest.fn(async (url /* , config*/) => {
    switch (url) {
        case API.PORTAL.userStatus():
            return 'done';
        default:
            throw new Error('Not mock');
    }
});
