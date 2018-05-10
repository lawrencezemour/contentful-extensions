import url from 'url';

// When UI Extensions SDK is loaded the callback will be executed.
window.contentfulExtension.init(initExtension);

function initExtension(extension) {
  // "extension" provides an interface documented here:
  // https://github.com/contentful/ui-extensions-sdk/blob/master/docs/ui-extensions-sdk-frontend.md

  // Automatically adjust UI Extension size in the Web App.
  extension.window.updateHeight();
  extension.window.startAutoResizer();

  const inputEl = document.getElementById('extension-input');
  const { field, entry, space, locales } = extension;
  const {
    domain: domainField,
    zone: zoneField,
    slug: slugField,
    url: urlField
  } = entry.fields;
  const { locale: fieldLocale } = field;

  // Handle window unload.
  const handleUnload = detachHandlers => () => {
    window.removeEventListener('onbeforeunload', handleUnload);
    detachHandlers.forEach(fn => fn());
  };

  const clearUrl = locale => {
    urlField.setValue('', locale);
  };

  const updateUrl = (domain, zone, slug) => locale => {
    const newUrl = formatUrl(domain, zone, slug);
    urlField.setValue(newUrl, locale);
  };

  // Handle external field value changes.
  const handleFieldChange = value => {
    inputEl.value = value || '';
  };

  // Handle referenced field value changes.
  const handleSlugChange = async slug => {
    if (!slug) {
      clearUrl(fieldLocale);
      return;
    }

    const domainLink = domainField.getValue();
    const zoneLink = zoneField.getValue();

    if (!domainLink || !zoneLink) {
      return;
    }

    const [domainEntry, zoneEntry] = await Promise.all([
      space.getEntry(domainLink.sys.id),
      space.getEntry(zoneLink.sys.id)
    ]);

    const domain = domainEntry.fields.production[fieldLocale];
    const zone = zoneEntry.fields.slug[fieldLocale];
    updateUrl(domain, zone, slug)(fieldLocale);
  };

  // Callback for changes of the current field value.
  const detachUrlChangeHandler = field.onValueChanged(handleFieldChange);
  const detachSlugChangeHandler = slugField.onValueChanged(
    fieldLocale,
    handleSlugChange
  );

  // Only run code to update all field values in the default extension instance.
  if (fieldLocale !== locales.default) {
    // Handle DOM "onbeforeunload" event.
    window.addEventListener(
      'onbeforeunload',
      handleUnload([detachUrlChangeHandler, detachSlugChangeHandler])
    );
    return;
  }

  // Handle referenced field value changes.
  const handleLinkChange = async link => {
    if (!link) {
      locales.available.forEach(clearUrl);
      return;
    }

    const domainLink = domainField.getValue();
    const zoneLink = zoneField.getValue();

    if (!domainLink || !zoneLink) {
      return;
    }

    const [domainEntry, zoneEntry] = await Promise.all([
      space.getEntry(domainLink.sys.id),
      space.getEntry(zoneLink.sys.id)
    ]);

    locales.available.forEach(locale => {
      const domain = domainEntry.fields.production[locale];
      const zone = zoneEntry.fields.slug[locale];
      const slug = slugField.getValue(locale);
      updateUrl(domain, zone, slug)(locale);
    });
  };

  // Callbacks for changes of the field values.
  const detachDomainChangeHandler = domainField.onValueChanged(
    handleLinkChange
  );
  const detachZoneChangeHandler = zoneField.onValueChanged(handleLinkChange);

  // Handle DOM "onbeforeunload" event.
  window.addEventListener(
    'onbeforeunload',
    handleUnload([
      detachUrlChangeHandler,
      detachSlugChangeHandler,
      detachDomainChangeHandler,
      detachZoneChangeHandler
    ])
  );
}

function formatUrl(domain, zone, slug) {
  if (!domain || !zone || !slug) {
    return '';
  }
  return url.format({
    protocol: 'https',
    host: domain,
    pathname: `${zone}${slug}/`
  });
}
