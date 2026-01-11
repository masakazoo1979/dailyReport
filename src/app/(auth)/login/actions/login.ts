'use server';

import { signIn } from '@/lib/auth';
import { loginSchema } from '@/lib/validations/auth';
import { AuthError } from 'next-auth';

/**
 * ログイン処理のサーバーアクション
 *
 * @param formData - フォームデータ（email, password）
 * @returns 成功時は null、失敗時はエラーメッセージオブジェクト
 */
export async function loginAction(formData: FormData) {
  try {
    // FormDataからデータを取得
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    // バリデーション
    const validatedFields = loginSchema.safeParse({
      email,
      password,
    });

    if (!validatedFields.success) {
      return {
        error: 'メールアドレスまたはパスワードが正しくありません。',
      };
    }

    // NextAuthのsignInを実行
    await signIn('credentials', {
      email: validatedFields.data.email,
      password: validatedFields.data.password,
      redirect: true,
      redirectTo: '/dashboard',
    });

    return null;
  } catch (error) {
    // NextAuthのエラーハンドリング
    if (error instanceof AuthError) {
      switch (error.type) {
        case 'CredentialsSignin':
          return {
            error: 'メールアドレスまたはパスワードが正しくありません。',
          };
        case 'CallbackRouteError':
          return {
            error: 'メールアドレスまたはパスワードが正しくありません。',
          };
        default:
          return {
            error:
              'システムエラーが発生しました。管理者にお問い合わせください。',
          };
      }
    }

    // リダイレクトエラーは再スロー（Next.jsの正常なリダイレクト）
    if (error && typeof error === 'object' && 'digest' in error) {
      throw error;
    }

    // その他のエラー
    console.error('Login error:', error);
    return {
      error: 'システムエラーが発生しました。管理者にお問い合わせください。',
    };
  }
}
