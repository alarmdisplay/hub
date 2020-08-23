// Type definitions for gauss-krueger
declare module 'gauss-krueger' {
  export interface WGSCoordinates {
    latitude: number
    longitude: number
  }

  export interface GKCoordinates {
    x: number
    y: number
  }

  export function toGK(coordinates: WGSCoordinates, zone?: number): WGSCoordinates
  export function toWGS(coordinates: GKCoordinates): WGSCoordinates
}
