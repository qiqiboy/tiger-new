import classlist from '.';

test('should get a className', () => {
    expect(classlist('a', 'b', 'c')).toBe('a b c');
    expect(classlist('a', ['b', 'c'])).toBe('a b c');
    expect(classlist('a', 'b', 'c', 0, null, true, false, undefined)).toBe('a b c');

    expect(
        classlist('a', {
            b: true,
            c: false
        })
    ).toBe('a b');
});
