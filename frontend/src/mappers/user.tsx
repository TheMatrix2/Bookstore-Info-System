export default interface User {
  username: string;
  email: string;
  phone: string | null;
}

interface UserApiResponse {
  Username: string;
  Email: string;
  Phone: string | null;
}

export function mapUserFromApi(raw: UserApiResponse): User {
  return {
    username: raw.Username,
    email: raw.Email,
    phone: raw.Phone,
  };
}

export function mapUserToApi(user: {
  username: string;
  email: string;
  phone: string | null;
}): UserApiResponse {
  return {
    Username: user.username,
    Email: user.email,
    Phone: user.phone,
  };
}