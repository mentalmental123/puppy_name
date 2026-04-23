import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import App from './App';
import { usePetData } from './hooks/usePetData';
import type { PetDataResponse } from './types';

vi.mock('./hooks/usePetData', () => ({
  usePetData: vi.fn()
}));

const mockUsePetData = vi.mocked(usePetData);

const fixtureData: PetDataResponse = {
  categories: [
    { id: 'classic', label: 'Classic' },
    { id: 'nature', label: 'Nature' }
  ],
  filterGroups: [{ id: 'style', label: 'Style', categoryIds: ['classic', 'nature'] }],
  letters: ['A', 'B', 'L', 'M', 'R'],
  names: [
    {
      id: '1',
      name: 'Luna',
      description: 'Bright and playful.',
      gender: 'female',
      categoryIds: ['nature'],
      relatedNameIds: ['2']
    },
    {
      id: '2',
      name: 'Milo',
      description: 'Friendly and curious.',
      gender: 'male',
      categoryIds: ['classic'],
      relatedNameIds: ['1']
    },
    {
      id: '3',
      name: 'Riley',
      description: 'Happy companion.',
      gender: 'both',
      categoryIds: ['classic', 'nature'],
      relatedNameIds: []
    }
  ]
};

afterEach(() => {
  vi.clearAllMocks();
});

describe('App', () => {
  it('shows loading state', () => {
    mockUsePetData.mockReturnValue({
      data: null,
      loading: true,
      error: null
    });

    render(<App />);

    expect(screen.getByText('Loading names...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    mockUsePetData.mockReturnValue({
      data: null,
      loading: false,
      error: 'Could not load pet names.'
    });

    render(<App />);

    expect(screen.getByText('Data not available')).toBeInTheDocument();
    expect(screen.getByText('Could not load pet names.')).toBeInTheDocument();
  });

  it('filters names by search and resets with clear', async () => {
    mockUsePetData.mockReturnValue({
      data: fixtureData,
      loading: false,
      error: null
    });

    render(<App />);

    expect(screen.getByText('I NEED A NAME')).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText('Search'), {
      target: { value: 'mi' }
    });

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 3, name: 'Milo' })).toBeInTheDocument();
    });

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }));

    await waitFor(() => {
      expect(screen.getByText('I NEED A NAME')).toBeInTheDocument();
    });
  });
});
