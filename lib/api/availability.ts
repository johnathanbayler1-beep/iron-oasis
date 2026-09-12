// Typed client for the external availability feed.
//
// Architecture: Firebase Slot Generator -> getAvailability Cloud Function
// -> this client -> LiveAvailabilityBoard. The Cloud Function and the
// Firebase project that backs it live outside this repo (see CLAUDE.md
// project boundary) — this file only knows how to call it over HTTP.
//
// Read-only. No booking/reservation writes belong here or anywhere in this
// module — reservations are confirmed through the app, not the website.

export type AvailabilityStatus = 'available' | 'reserved';

export interface AvailabilitySlot {
  time: string;
  startHour: number;
  status: AvailabilityStatus;
  /** Reserved for when the Cloud Function starts returning slot identifiers. */
  slotId?: string;
}

export interface GetAvailabilityParams {
  locationId: string;
  date: string;
}

export class AvailabilityApiError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'AvailabilityApiError';
    this.status = status;
  }
}

// Base URL for the Cloud Function, e.g. a Firebase Functions HTTPS endpoint.
// Deliberately not hardcoded — until this is set, callers get a clear
// configuration error instead of a request to a guessed/fabricated host.
const AVAILABILITY_API_BASE_URL = process.env.NEXT_PUBLIC_AVAILABILITY_API_URL;

function isAvailabilityStatus(value: unknown): value is AvailabilityStatus {
  return value === 'available' || value === 'reserved';
}

function isAvailabilitySlot(value: unknown): value is AvailabilitySlot {
  if (!value || typeof value !== 'object') return false;
  const slot = value as Record<string, unknown>;
  return (
    typeof slot.time === 'string' &&
    typeof slot.startHour === 'number' &&
    isAvailabilityStatus(slot.status) &&
    (slot.slotId === undefined || typeof slot.slotId === 'string')
  );
}

/**
 * Fetches today's (or any given date's) availability for a location from
 * the getAvailability Cloud Function. Throws AvailabilityApiError on any
 * failure — missing config, network failure, non-2xx response, or a
 * response shape that doesn't match AvailabilitySlot.
 */
export async function getAvailability(
  { locationId, date }: GetAvailabilityParams,
  init?: RequestInit,
): Promise<AvailabilitySlot[]> {
  if (!AVAILABILITY_API_BASE_URL) {
    throw new AvailabilityApiError(
      'Availability API is not configured (NEXT_PUBLIC_AVAILABILITY_API_URL is unset).',
    );
  }
  if (!locationId || !date) {
    throw new AvailabilityApiError('locationId and date are required to fetch availability.');
  }

  const url = new URL('/getAvailability', AVAILABILITY_API_BASE_URL);
  url.searchParams.set('locationId', locationId);
  url.searchParams.set('date', date);

  let response: Response;
  try {
    response = await fetch(url.toString(), { ...init, method: 'GET' });
  } catch (cause) {
    throw new AvailabilityApiError('Could not reach the availability service.');
  }

  if (!response.ok) {
    throw new AvailabilityApiError(
      `Availability service returned an error (${response.status}).`,
      response.status,
    );
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AvailabilityApiError('Availability service returned an unreadable response.');
  }

  if (!Array.isArray(payload) || !payload.every(isAvailabilitySlot)) {
    throw new AvailabilityApiError('Availability service returned an unexpected shape.');
  }

  return payload;
}
