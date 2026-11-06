import type { Messages } from 'next-intl';

// Server actions return a key from messages/*.json "errors", and the client
// shows it in the visitor's language.
export type BookingErrorCode = keyof Messages['errors'];

export type BookingResult = { success: true } | { success: false; error: BookingErrorCode };

export const fail = (error: BookingErrorCode): BookingResult => ({ success: false, error });
