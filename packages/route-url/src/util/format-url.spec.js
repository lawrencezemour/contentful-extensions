import formatUrl, { removeLeadingSlash } from './format-url';

describe('Route URL extension', () => {
  const domain = 'support.sumup.com';
  const zone = '/article';
  const slug = '/getting-started';

  describe('should format the URL', () => {
    test('when domain, zone and slug are not null', () => {
      const actual = formatUrl(domain, zone, slug);
      const expected = `https://${domain}${zone}${slug}/`;
      expect(actual).toBe(expected);
    });
    test('when one of domain, zone or slug is null', () => {
      const actual = formatUrl(domain, zone, '');
      const expected = '';
      expect(actual).toBe(expected);
    });
  });

  describe('should remove a leading slash from a string', () => {
    test('when the string has a leading slash', () => {
      const actual = removeLeadingSlash('/mango');
      expect(actual).toBe('mango');
    });
    test('when the string does not have a leading slash', () => {
      const actual = removeLeadingSlash('mango');
      expect(actual).toBe('mango');
    });
    test('when the string is a slash', () => {
      const actual = removeLeadingSlash('/');
      expect(actual).toBe('');
    });
  });
});
