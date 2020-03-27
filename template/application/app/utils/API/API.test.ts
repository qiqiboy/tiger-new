import API, { axiosMethods } from '.';
import axios from 'axios';

jest.mock('axios');

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
