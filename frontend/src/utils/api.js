const NETWORK_ERROR_MESSAGE =
  'Unable to connect to the server. Check your connection and try again.';
const INVALID_RESPONSE_MESSAGE = 'The server returned an invalid response.';

const isRecord = (value) =>
  value !== null && typeof value === 'object' && !Array.isArray(value);

const getErrorMessage = (payload, includeMessage = true) => {
  if (typeof payload === 'string') {
    return payload.trim();
  }

  if (!isRecord(payload)) {
    return '';
  }

  const details = includeMessage
    ? [payload.error, payload.message]
    : [payload.error];

  for (const detail of details) {
    if (typeof detail === 'string' && detail.trim()) {
      return detail.trim();
    }

    if (isRecord(detail) && typeof detail.message === 'string' && detail.message.trim()) {
      return detail.message.trim();
    }
  }

  return '';
};

const isHtml = (text) => /^\s*</.test(text);

export const requestJson = async (url, options) => {
  let response;

  try {
    response = await fetch(url, options);
  } catch {
    throw new Error(NETWORK_ERROR_MESSAGE);
  }

  let responseText;
  try {
    responseText = await response.text();
  } catch {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  let payload = null;
  let malformedJson = false;

  if (responseText.trim()) {
    try {
      payload = JSON.parse(responseText);
    } catch {
      malformedJson = true;
      payload = responseText.trim();
    }
  }

  if (!response.ok) {
    const backendMessage = malformedJson
      ? isHtml(payload) ? '' : payload
      : getErrorMessage(payload);

    throw new Error(
      backendMessage || `Request failed with status ${response.status}.`
    );
  }

  if (malformedJson) {
    throw new Error(INVALID_RESPONSE_MESSAGE);
  }

  if (isRecord(payload) && payload.error != null) {
    throw new Error(
      getErrorMessage(payload, false) || INVALID_RESPONSE_MESSAGE
    );
  }

  return payload;
};
