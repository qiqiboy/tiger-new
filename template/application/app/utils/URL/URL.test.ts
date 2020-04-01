import URL from '.';

test('should parse a url', () => {
    expect(URL.parse('https://example.com:80/p1/p2?a=1&b=2&a=3&d=4#a=1&b=2')).toEqual({
        auth: null,
        hash: '#a=1&b=2',
        host: 'example.com:80',
        hostname: 'example.com',
        href: 'https://example.com:80/p1/p2?a=1&b=2&a=3&d=4#a=1&b=2',
        path: '/p1/p2?a=1&b=2&a=3&d=4',
        pathname: '/p1/p2',
        port: '80',
        protocol: 'https:',
        query: 'a=1&b=2&a=3&d=4',
        search: '?a=1&b=2&a=3&d=4',
        slashes: true
    });

    expect(URL.parse('https://example.com:80/p1/p2?a=1&b=2&a=3&d=4#a=1&b=2', true).query).toEqual({
        a: ['1', '3'],
        b: '2',
        d: '4'
    });
});

test('should merge url partials into a output', () => {
    expect(URL.merge('https://example.com:80/p1/p2?a=1&b=2&a=3&d=4#a=1&b=2', '?s=1')).toBe(
        'https://example.com:80/p1/p2?a=1&a=3&b=2&d=4&s=1#a=1&b=2'
    );

    expect(URL.merge('https://example.com:80/p1/p2?a=1&b=2&a=3&d=4#a=1&b=2', '?s=1', true)).toBe('?s=1');

    expect(
        URL.merge('https://example.com:80/p1/p2?a=1&b=2&a=3&d=4#a=1&b=2', {
            query: {
                s: '1'
            }
        })
    ).toBe('https://example.com:80/p1/p2?a=1&a=3&b=2&d=4&s=1#a=1&b=2');

    expect(
        URL.merge(
            'https://example.com:80/p1/p2?a=1&b=2&a=3&d=4#a=1&b=2',
            {
                query: {
                    s: '1'
                }
            },
            true
        )
    ).toBe('https://example.com:80/p1/p2?s=1#a=1&b=2');

    expect(URL.merge('https://example.com:80/p1/p2?a=1&b=2&a=3&d=4#a=1&b=2', 'https://new-host.com/new-path/')).toBe(
        'https://new-host.com/new-path/?a=1&a=3&b=2&d=4#a=1&b=2'
    );
});

test('should parse current location href', () => {
    expect(URL.current('https://example.com:80/p1/p2?a=1&b=2&a=3&d=4#a=1&b=2')).toEqual({
        auth: null,
        hash: '#a=1&b=2',
        host: 'example.com:80',
        hostname: 'example.com',
        href: 'https://example.com:80/p1/p2?a=1&b=2&a=3&d=4#a=1&b=2',
        path: '/p1/p2?a=1&b=2&a=3&d=4',
        pathname: '/p1/p2',
        port: '80',
        protocol: 'https:',
        query: {
            a: ['1', '3'],
            b: '2',
            d: '4'
        },
        search: '?a=1&b=2&a=3&d=4',
        slashes: true
    });
});
