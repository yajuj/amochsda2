export interface AmoResponce {
  _embedded: {
    contacts: Contact[];
  };
}

export type Contact = { id: number; name: string };
