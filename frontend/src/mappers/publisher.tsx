export default interface Publisher {
  id: string;
  name: string;
  address: string;
  email: string;
  website: string | null;
}

interface PublisherApiResponse {
  ID: string;
  Name: string;
  Address: string;
  Email: string;
  Website: string | null;
}

export function mapPublisherFromApi(raw: PublisherApiResponse): Publisher {
  return {
    id: raw.ID,
    name: raw.Name,
    address: raw.Address,
    email: raw.Email,
    website: raw.Website,
  };
}