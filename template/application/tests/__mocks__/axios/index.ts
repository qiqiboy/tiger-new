import get from './get.mock';
import post from './post.mock';
import put from './put.mock';
import _delete from './delete.mock';
import head from './head.mock';
import patch from './patch.mock';
import request from './request.mock';

const exceptions: {
    [key: string]: Error;
} = {};

function createExceptionInject(method) {
    return jest.fn(async (...args) => {
        const url = typeof args[0] === 'object' ? args[0].url : args[0];

        if (url in exceptions) {
            throw exceptions[url];
        }

        return method(...args);
    });
}

export default {
    request: createExceptionInject(request),
    get: createExceptionInject(get),
    post: createExceptionInject(post),
    put: createExceptionInject(put),
    delete: createExceptionInject(_delete),
    head: createExceptionInject(head),
    patch: createExceptionInject(patch),
    mockException(url: string, error: Error | null | false) {
        if (error) {
            exceptions[url] = error;
        } else {
            delete exceptions[url];
        }
    },
    interceptors: {
        response: {
            use() {}
        },
        request: {
            use() {}
        }
    }
};
