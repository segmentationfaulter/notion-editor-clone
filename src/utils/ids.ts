/**
 * ID generation utilities using nanoid
 *
 * nanoid generates short, URL-safe, unique IDs.
 * Default size is 21 characters, which provides collision-resistant IDs.
 */

import { nanoid } from "nanoid";

/**
 * Generate a unique ID
 *
 * Used for creating IDs for blocks, documents, and any other entities
 * that need a unique identifier.
 *
 * @returns A unique string ID
 *
 * @example
 * const blockId = createId();  // "V1StGXR8_Z5jdHi6B-myT"
 * const docId = createId();    // "a8F3kL9mN2pQ5rT7vX1zY"
 */
export function createId(): string {
  return nanoid();
}
