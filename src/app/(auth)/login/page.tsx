/**
 * Login Page (Sample)
 *
 * Temporary page to test auth layout
 * TODO: Replace with actual login implementation from Issue #6
 */
export default function LoginPage() {
  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">ログイン</h2>
      <p className="text-sm text-muted-foreground mb-6">
        メールアドレスとパスワードを入力してください
      </p>

      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium">メールアドレス</label>
          <input
            type="email"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="example@company.com"
          />
        </div>

        <div>
          <label className="text-sm font-medium">パスワード</label>
          <input
            type="password"
            className="w-full mt-1 px-3 py-2 border rounded-md"
            placeholder="••••••••"
          />
        </div>

        <button className="w-full bg-primary text-primary-foreground py-2 rounded-md font-medium">
          ログイン
        </button>
      </div>

      <p className="text-xs text-muted-foreground mt-4 text-center">
        This is a placeholder page for testing the auth layout.
      </p>
    </div>
  );
}
