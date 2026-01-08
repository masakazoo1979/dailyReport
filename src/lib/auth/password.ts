import bcrypt from "bcryptjs";
import { AUTH_CONSTANTS } from "../constants/auth";

/**
 * パスワードをハッシュ化する
 * @param password - ハッシュ化するパスワード
 * @returns ハッシュ化されたパスワード
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, AUTH_CONSTANTS.SALT_ROUNDS);
}

/**
 * パスワードを検証する
 * @param password - 検証するパスワード（プレーンテキスト）
 * @param hashedPassword - ハッシュ化されたパスワード
 * @returns パスワードが一致する場合true
 */
export async function verifyPassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}
