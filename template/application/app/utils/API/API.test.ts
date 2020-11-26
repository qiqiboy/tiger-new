import axios from 'axios';
import API, { axiosMethods } from '.';

test('should return a url', () => {
    expect(API.PORTAL.userStatus()).toMatch(/^https:\/\//);
});

test('should contains axios methods', () => {
    axiosMethods.forEach(name => {
        expect(API.PORTAL.userStatus[name]).toBeInstanceOf(Function);
    });
});

test('should call axios same name method', async () => {
    const data = await API.PORTAL.userStatus.get();

    expect(axios.get).toBeCalledWith(API.PORTAL.userStatus());
    expect(data).toBe('done');
});

test('should throw a error use mockException', async () => {
    axios.mockException(API.PORTAL.userStatus(), new Error('abc'));

    try {
        await API.PORTAL.userStatus.get();
    } catch (error) {
        // eslint-disable-next-line
        expect(error).toEqual(new Error('abc'));
    }

    axios.mockException(API.PORTAL.userStatus(), null);
});
