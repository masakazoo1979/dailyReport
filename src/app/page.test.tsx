import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import Home from './page';

describe('Home Page', () => {
  it('should render the setup test title', () => {
    render(<Home />);
    expect(
      screen.getByText('Tailwind CSS & shadcn/ui Setup Test')
    ).toBeInTheDocument();
  });

  it('should render the card component', () => {
    render(<Home />);
    expect(screen.getByText('Card Component')).toBeInTheDocument();
    expect(
      screen.getByText('This is a test card from shadcn/ui')
    ).toBeInTheDocument();
  });

  it('should render status badges', () => {
    render(<Home />);
    expect(screen.getByText('下書き')).toBeInTheDocument();
    expect(screen.getByText('提出済み')).toBeInTheDocument();
    expect(screen.getByText('承認済み')).toBeInTheDocument();
    expect(screen.getByText('差し戻し')).toBeInTheDocument();
  });

  it('should render the setup complete alert', () => {
    render(<Home />);
    expect(screen.getByText('Setup Complete!')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Tailwind CSS and shadcn/ui are configured and working correctly.'
      )
    ).toBeInTheDocument();
  });
});
