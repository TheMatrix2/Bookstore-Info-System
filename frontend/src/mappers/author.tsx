export default interface Author {
  id: string;
  surname: string;
  name: string;
  patronymic: string;
  info: string;
}

interface AuthorApiResponse {
  ID: string;
  Surname: string;
  Name: string;
  Patronymic: string;
  Info: string;
}

export function mapAuthorFromApi(raw: AuthorApiResponse): Author {
  return {
    id: raw.ID,
    surname: raw.Surname,
    name: raw.Name,
    patronymic: raw.Patronymic,
    info: raw.Info,
  };
}