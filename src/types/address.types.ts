export interface Address {
  street: string;
  postal_code: string;
  city: string;
  sub_administrative_area?: string;
  administrative_area: string;
  country: string;
  country_code: string;
  coordinate: {
    lat: number;
    lon: number;
  };
  timezone: string;
}
