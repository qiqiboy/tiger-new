import get from './get.mock';
import post from './post.mock';
import put from './put.mock';
import _delete from './delete.mock';
import head from './head.mock';
import patch from './patch.mock';

export default {
    get,
    post,
    put,
    delete: _delete,
    head,
    patch,
    interceptors: {
        response: {
            use() {}
        },
        request: {
            use() {}
        }
    }
};
