/**
 * URL-based storage backend.
 *
 * Encodes the snippet state directly into the URL as query parameters:
 *   ?language=ocaml&code=<base64url-encoded source>
 *
 * No server required — everything lives in the URL.
 */

import {getCategoryByID, getDefaultParser} from '../parsers';

function encode(str) {
  // UTF-8 safe base64
  return btoa(unescape(encodeURIComponent(str)));
}

function decode(b64) {
  return decodeURIComponent(escape(atob(b64)));
}

function getParamsFromURL() {
  const params = new URLSearchParams(global.location.search);
  const code = params.get('code');
  const language = params.get('language');
  if (code) {
    return {code, language};
  }
  return null;
}

class Revision {
  constructor({code, language}) {
    this._code = code;
    this._language = language;
  }

  canSave() {
    return true;
  }

  getParserID() {
    const category = getCategoryByID(this._language);
    if (category) {
      const parser = getDefaultParser(category);
      return parser ? parser.id : null;
    }
    return null;
  }

  getCode() {
    return this._code;
  }

  getParserSettings() {
    return null;
  }

  // Not used for URL snippets, but satisfies the interface
  getSnippetID() {
    return null;
  }
}

export function owns(revision) {
  return revision instanceof Revision;
}

export function matchesURL() {
  return getParamsFromURL() !== null;
}

export function fetchFromURL() {
  const data = getParamsFromURL();
  if (!data) {
    return Promise.resolve(null);
  }
  try {
    const code = decode(data.code);
    return Promise.resolve(new Revision({code, language: data.language}));
  } catch (e) {
    return Promise.reject(new Error('Failed to decode code from URL.'));
  }
}

/**
 * Encode state into query params and update the browser URL without
 * triggering a page reload or a popstate event.
 */
export function updateURL({language, code}) {
  const params = new URLSearchParams();
  params.set('language', language);
  params.set('code', encode(code));
  const newURL = `${global.location.pathname}?${params.toString()}`;
  global.history.pushState(null, '', newURL);
}
