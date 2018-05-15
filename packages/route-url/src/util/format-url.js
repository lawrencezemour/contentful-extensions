import url from 'url';

export default function formatUrl(domain, zone, slug) {
  if (!domain || !zone || !slug) {
    return '';
  }
  const formattedZone = removeLeadingSlash(zone);
  const formattedSlug = removeLeadingSlash(slug);
  return url.format({
    protocol: 'https',
    host: domain,
    pathname: `${formattedZone}/${formattedSlug}/`
  });
}

export function removeLeadingSlash(string) {
  const leadingSlashes = /^\/+/;
  return string.replace(leadingSlashes, '');
}
