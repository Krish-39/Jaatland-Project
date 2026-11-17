// Shared by the browser form and the server. Kept apart from password.ts,
// which uses node:crypto and must not be bundled for the browser.
export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 200;
