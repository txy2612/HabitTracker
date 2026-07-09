// we keep taling bout User (each user = one row -> UserRow)
// TypeScript give it its types
export type UserRow = {
  id: string;
  name: string;
  email: string;
  password_hash: string;
  created_at: string;
};

// async bcz program shouldnt freeze when db is doing transaction
// async: I'll continue doing other things. Tell me when you're done.
export async function findUserByEmail(_email: string): // _email, _ = TS convention naming
Promise<UserRow | null> {
    // Promise = async (takes time)
    // I promise to give u UserRow or null(no user) later
  return null;
}

// create user in db
// 1 object -> cleaner when many fields
// input must have these properties
export async function createUser(input: {
  name: string;
  email: string;
  passwordHash: string;// repo nvr receive raw pw
}): Promise<UserRow> {// I promise to return UserRow later
  return {
    id: "0",// later DB generate real id
    name: input.name,
    email: input.email,
    password_hash: input.passwordHash,// SQL (pw_hash) : JS ( pwHash )
    created_at: new Date().toISOString(),
  };
}
