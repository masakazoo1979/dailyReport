import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from './page';
import * as loginActions from './actions/login';

// モックの設定
vi.mock('./actions/login', () => ({
  loginAction: vi.fn(),
}));

describe('LoginPage (S-001 ログイン画面)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('画面表示', () => {
    it('ログイン画面が正しく表示される', () => {
      render(<LoginPage />);

      // タイトルとディスクリプションの確認
      expect(
        screen.getByRole('heading', { name: '営業日報システム' })
      ).toBeInTheDocument();
      expect(
        screen.getByText('メールアドレスとパスワードでログインしてください')
      ).toBeInTheDocument();

      // フォーム要素の確認
      expect(screen.getByLabelText('メールアドレス')).toBeInTheDocument();
      expect(screen.getByLabelText('パスワード')).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: 'ログイン' })
      ).toBeInTheDocument();
    });

    it('L-001: メールアドレス入力欄が正しく表示される', () => {
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      expect(emailInput).toHaveAttribute('type', 'email');
      expect(emailInput).toHaveAttribute('placeholder', 'user@example.com');
      expect(emailInput).toHaveAttribute('autocomplete', 'email');
    });

    it('L-002: パスワード入力欄がマスク表示される', () => {
      render(<LoginPage />);

      const passwordInput = screen.getByLabelText('パスワード');
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('autocomplete', 'current-password');
    });

    it('L-003: ログインボタンが表示される', () => {
      render(<LoginPage />);

      const loginButton = screen.getByRole('button', { name: 'ログイン' });
      expect(loginButton).toBeInTheDocument();
      expect(loginButton).toHaveAttribute('type', 'submit');
    });
  });

  describe('バリデーション', () => {
    it('E-001: メールアドレスが未入力の場合、エラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');

      // メールアドレスを空白のままフォーカスアウト
      await user.click(emailInput);
      await user.click(passwordInput);

      await waitFor(() => {
        expect(
          screen.getByText('メールアドレスを入力してください')
        ).toBeInTheDocument();
      });
    });

    it('E-002: メールアドレスの形式が正しくない場合、エラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');

      // 無効なメールアドレスを入力
      await user.type(emailInput, 'invalid-email');
      await user.click(passwordInput);

      await waitFor(() => {
        expect(
          screen.getByText('有効なメールアドレスを入力してください')
        ).toBeInTheDocument();
      });
    });

    it('E-003: パスワードが未入力の場合、エラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');

      // パスワードを空白のままフォーカスアウト
      await user.click(passwordInput);
      await user.click(emailInput);

      await waitFor(() => {
        expect(
          screen.getByText('パスワードを入力してください')
        ).toBeInTheDocument();
      });
    });

    it('パスワードが8文字未満の場合、エラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');

      // 8文字未満のパスワードを入力
      await user.type(passwordInput, 'pass123');
      await user.click(emailInput);

      await waitFor(() => {
        expect(
          screen.getByText('パスワードは8文字以上で入力してください')
        ).toBeInTheDocument();
      });
    });
  });

  describe('ログイン処理', () => {
    it('正しい入力でログインボタンをクリックすると、loginActionが呼び出される', async () => {
      const user = userEvent.setup();
      const mockLoginAction = vi.mocked(loginActions.loginAction);
      mockLoginAction.mockResolvedValue(null);

      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      // フォームに入力
      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      // ログインボタンをクリック
      await user.click(loginButton);

      await waitFor(() => {
        expect(mockLoginAction).toHaveBeenCalledTimes(1);
      });
    });

    it('ログイン中はボタンが無効化され、ローディングテキストが表示される', async () => {
      const user = userEvent.setup();
      const mockLoginAction = vi.mocked(loginActions.loginAction);

      // ログインアクションを遅延させる
      mockLoginAction.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(null), 1000))
      );

      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      // ローディング中の状態を確認
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: 'ログイン中...' })
        ).toBeInTheDocument();
        expect(
          screen.getByRole('button', { name: 'ログイン中...' })
        ).toBeDisabled();
      });
    });

    it('E-004: 認証失敗時にエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      const mockLoginAction = vi.mocked(loginActions.loginAction);
      mockLoginAction.mockResolvedValue({
        error: 'メールアドレスまたはパスワードが正しくありません。',
      });

      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);

      await waitFor(() => {
        expect(
          screen.getByText('メールアドレスまたはパスワードが正しくありません。')
        ).toBeInTheDocument();
      });
    });

    it('E-999: システムエラー時にエラーメッセージが表示される', async () => {
      const user = userEvent.setup();
      const mockLoginAction = vi.mocked(loginActions.loginAction);
      mockLoginAction.mockRejectedValue(new Error('System error'));

      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');
      const loginButton = screen.getByRole('button', { name: 'ログイン' });

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');
      await user.click(loginButton);

      await waitFor(() => {
        expect(
          screen.getByText(
            'システムエラーが発生しました。管理者にお問い合わせください。'
          )
        ).toBeInTheDocument();
      });
    });
  });

  describe('アクセシビリティ', () => {
    it('メールアドレスエラー時にaria-invalid属性が設定される', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');

      await user.click(emailInput);
      await user.click(passwordInput);

      await waitFor(() => {
        expect(emailInput).toHaveAttribute('aria-invalid', 'true');
        expect(emailInput).toHaveAttribute('aria-describedby', 'email-error');
      });
    });

    it('パスワードエラー時にaria-invalid属性が設定される', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');

      await user.click(passwordInput);
      await user.click(emailInput);

      await waitFor(() => {
        expect(passwordInput).toHaveAttribute('aria-invalid', 'true');
        expect(passwordInput).toHaveAttribute(
          'aria-describedby',
          'password-error'
        );
      });
    });

    it('エラーメッセージにrole="alert"が設定される', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');

      await user.click(emailInput);
      await user.click(passwordInput);

      await waitFor(() => {
        const errorMessage = screen.getByRole('alert');
        expect(errorMessage).toHaveTextContent(
          'メールアドレスを入力してください'
        );
      });
    });
  });

  describe('フォームの状態管理', () => {
    it('入力値が正しく保持される', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText(
        'メールアドレス'
      ) as HTMLInputElement;
      const passwordInput = screen.getByLabelText(
        'パスワード'
      ) as HTMLInputElement;

      await user.type(emailInput, 'test@example.com');
      await user.type(passwordInput, 'password123');

      expect(emailInput.value).toBe('test@example.com');
      expect(passwordInput.value).toBe('password123');
    });

    it('エラー表示後に正しい値を入力すると、エラーが消える', async () => {
      const user = userEvent.setup();
      render(<LoginPage />);

      const emailInput = screen.getByLabelText('メールアドレス');
      const passwordInput = screen.getByLabelText('パスワード');

      // エラーを表示
      await user.click(emailInput);
      await user.click(passwordInput);

      await waitFor(() => {
        expect(
          screen.getByText('メールアドレスを入力してください')
        ).toBeInTheDocument();
      });

      // 正しい値を入力
      await user.type(emailInput, 'test@example.com');
      await user.click(passwordInput);

      await waitFor(() => {
        expect(
          screen.queryByText('メールアドレスを入力してください')
        ).not.toBeInTheDocument();
      });
    });
  });
});
