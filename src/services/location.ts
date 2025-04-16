/**
 * Represents a geographical location with latitude and longitude coordinates.
 */
export interface Location {
  /**
   * The latitude of the location.
   */
  lat: number;
  /**
   * The longitude of the location.
   */
  lng: number;
}

/**
 * Asynchronously retrieves nearby locations based on a given location.
 *
 * @param location The location for which to retrieve nearby locations.
 * @returns A promise that resolves to an array of Location objects.
 */
export async function getNearbyLocations(location: Location): Promise<Location[]> {
  // TODO: Implement this by calling an API.

  return [
    {
      lat: location.lat + 0.01,
      lng: location.lng + 0.01,
    },
    {
      lat: location.lat - 0.01,
      lng: location.lng - 0.01,
    },
  ];
}
