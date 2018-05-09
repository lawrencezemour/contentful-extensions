// When UI Extensions SDK is loaded the callback will be executed.
window.contentfulExtension.init(initExtension);

function initExtension(extension) {
  // "extension" provides an interface documented here:
  // https://github.com/contentful/ui-extensions-sdk/blob/master/docs/ui-extensions-sdk-frontend.md

  // Automatically adjust UI Extension size in the Web App.
  extension.window.updateHeight();
  extension.window.startAutoResizer();
  console.log('🤡 Initialized');

  // Handle DOM "onbeforeunload" event.
  window.addEventListener('onbeforeunload', handleUnload);

  const inputEl = document.getElementById('url-input');

  const { field, entry, space, locales } = extension;
  const { locale: fieldLocale } = field;

  const { domain, zone, slug, url } = entry.fields;

  // Callbacks for changes of the field values.
  const detachUrlChangeHandler = field.onValueChanged(handleFieldChange);
  const detachSlugChangeHandler = slug.onValueChanged(handleSlugChange);
  const detachDomainChangeHandler = domain.onValueChanged(
    handleReferenceChange
  );
  const detachZoneChangeHandler = zone.onValueChanged(handleReferenceChange);

  // Handle external field value changes (e.g. when multiple authors are working on the same entry).
  function handleFieldChange(value) {
    inputEl.value = value || '';
  }

  // Handle slug field value change.
  async function handleSlugChange(value) {
    if (fieldLocale === 'fr-FR') {
      console.log('🤢🤢🤢🤢🤢', value);
    }

    const newDomainLink = domain.getValue();
    const newZoneLink = zone.getValue();
    const newSlug = slug.getValue(fieldLocale);

    // Only construct URL for route if all parts are set.
    if (!newDomainLink || !newZoneLink || !newSlug) {
      field.setValue('');
      inputEl.value = '';
      return;
    }

    const [newDomainEntry, newZoneEntry] = await Promise.all([
      space.getEntry(newDomainLink.sys.id),
      space.getEntry(newZoneLink.sys.id)
    ]);
    const newDomain = newDomainEntry.fields.production[fieldLocale];
    const newZone = newZoneEntry.fields.slug[locales.default];

    const newUrl = formatUrl(newDomain, newZone, newSlug);

    if (fieldLocale === 'fr-FR') {
      console.log('🤢🤢🤢🤢🤢', newUrl);
    }

    field.setValue(newUrl);
    inputEl.value = newUrl;
  }

  // Handle referenced field value changes.
  async function handleReferenceChange() {
    // Only run code to update fields in one field instance.
    if (fieldLocale !== locales.default) {
      return;
    }

    const newDomainLink = domain.getValue();
    const newZoneLink = zone.getValue();

    // Clear URL if a part is missing.
    if (!newDomainLink || !newZoneLink) {
      locales.available.forEach(locale => {
        url.setValue('', locale);
      });
      inputEl.value = '';
    }

    const [newDomainEntry, newZoneEntry] = await Promise.all([
      space.getEntry(newDomainLink.sys.id),
      space.getEntry(newZoneLink.sys.id)
    ]);

    locales.available.forEach(locale => {
      const newDomain = newDomainEntry.fields.production[locale];
      const newZone = newZoneEntry.fields.slug[locales];
      const newSlug = slug.getValue(locale);

      const newUrl = formatUrl(newDomain, newZone, newSlug);

      url.setValue(newUrl, locale);
      inputEl.value = newUrl;
    });
  }

  // Handle window unload.
  function handleUnload() {
    window.removeEventListener('onbeforeunload', handleUnload);
    detachUrlChangeHandler();
    detachDomainChangeHandler();
    detachZoneChangeHandler();
    detachSlugChangeHandler();
  }
}

function formatUrl(domain, zone, slug) {
  if (!domain || !zone || !slug) {
    return '';
  }
  // TODO: Format URL properly.
  return `${domain}${zone}${slug}`;
}
