import API from 'utils/API';

// eslint-disable-next-line
export default async (url /* , config*/) => {
    switch (url) {
        case API.PORTAL.userStatus():
            return 'done';
        default:
            throw new Error('Not mock');
    }
};
