import bcrypt from 'bcrypt';
const SALT_ROUNDS = 10;

export const hashPassword = (password: string): string => {
  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  return bcrypt.hashSync(password, salt);
};

export const comparePassword = (password: string, hashedPassword: string): boolean => {
  return bcrypt.compareSync(password, hashedPassword);
};
