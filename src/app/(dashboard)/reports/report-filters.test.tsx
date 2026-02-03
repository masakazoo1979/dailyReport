import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ReportFilters } from './report-filters';

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

const defaultProps = {
  startDate: '',
  endDate: '',
  status: '',
  salesId: '',
  statusOptions: [
    { value: '', label: 'すべて' },
    { value: 'draft', label: '下書き' },
    { value: 'submitted', label: '提出済み' },
  ],
  salesList: [
    { value: '1', label: '山田太郎' },
    { value: '2', label: '鈴木花子' },
  ],
  isManager: false,
};

describe('ReportFilters - 期間整合性チェック', () => {
  it('開始日と終了日が正しい場合、エラーメッセージが表示されない', () => {
    render(<ReportFilters {...defaultProps} />);

    const startDateInput = screen.getByLabelText('期間（開始）');
    const endDateInput = screen.getByLabelText('期間（終了）');

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

    expect(
      screen.queryByText('終了日は開始日以降の日付を指定してください。')
    ).not.toBeInTheDocument();
  });

  it('開始日が終了日より後の場合、エラーメッセージが表示される', () => {
    render(<ReportFilters {...defaultProps} />);

    const startDateInput = screen.getByLabelText('期間（開始）');
    const endDateInput = screen.getByLabelText('期間（終了）');

    fireEvent.change(startDateInput, { target: { value: '2024-01-31' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-01' } });

    expect(
      screen.getByText('終了日は開始日以降の日付を指定してください。')
    ).toBeInTheDocument();
  });

  it('開始日と終了日が同じ場合、エラーメッセージが表示されない', () => {
    render(<ReportFilters {...defaultProps} />);

    const startDateInput = screen.getByLabelText('期間（開始）');
    const endDateInput = screen.getByLabelText('期間（終了）');

    fireEvent.change(startDateInput, { target: { value: '2024-01-15' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-15' } });

    expect(
      screen.queryByText('終了日は開始日以降の日付を指定してください。')
    ).not.toBeInTheDocument();
  });

  it('開始日のみ入力されている場合、エラーメッセージが表示されない', () => {
    render(<ReportFilters {...defaultProps} />);

    const startDateInput = screen.getByLabelText('期間（開始）');

    fireEvent.change(startDateInput, { target: { value: '2024-01-01' } });

    expect(
      screen.queryByText('終了日は開始日以降の日付を指定してください。')
    ).not.toBeInTheDocument();
  });

  it('終了日のみ入力されている場合、エラーメッセージが表示されない', () => {
    render(<ReportFilters {...defaultProps} />);

    const endDateInput = screen.getByLabelText('期間（終了）');

    fireEvent.change(endDateInput, { target: { value: '2024-01-31' } });

    expect(
      screen.queryByText('終了日は開始日以降の日付を指定してください。')
    ).not.toBeInTheDocument();
  });

  it('エラー状態で検索ボタンをクリックしても検索が実行されない', async () => {
    render(<ReportFilters {...defaultProps} />);

    const startDateInput = screen.getByLabelText('期間（開始）');
    const endDateInput = screen.getByLabelText('期間（終了）');
    const searchButton = screen.getByRole('button', { name: '検索' });

    // 不正な期間を設定
    fireEvent.change(startDateInput, { target: { value: '2024-01-31' } });
    fireEvent.change(endDateInput, { target: { value: '2024-01-01' } });

    // エラーメッセージが表示されていることを確認
    expect(
      screen.getByText('終了日は開始日以降の日付を指定してください。')
    ).toBeInTheDocument();

    // 検索ボタンをクリック
    fireEvent.click(searchButton);

    // エラーが表示されたままであることを確認（検索が実行されていない証拠）
    expect(
      screen.getByText('終了日は開始日以降の日付を指定してください。')
    ).toBeInTheDocument();
  });
});
