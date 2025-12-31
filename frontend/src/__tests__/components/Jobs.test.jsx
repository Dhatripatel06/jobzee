import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import Jobs from '../../components/Job/Jobs';
import { Context } from '../../main';

vi.mock('axios');

const mockContextValue = {
  isAuthorized: true,
  setIsAuthorized: vi.fn(),
  user: { _id: '123', name: 'Test User', role: 'Job Seeker' },
  setUser: vi.fn(),
};

const mockJobs = {
  success: true,
  jobs: [
    {
      _id: '1',
      title: 'Software Engineer',
      description: 'Develop amazing software',
      category: 'IT',
      country: 'USA',
      city: 'New York',
      fixedSalary: 100000,
      expired: false,
    },
    {
      _id: '2',
      title: 'Product Manager',
      description: 'Manage product development',
      category: 'Management',
      country: 'USA',
      city: 'San Francisco',
      salaryFrom: 90000,
      salaryTo: 120000,
      expired: false,
    },
  ],
};

const renderWithContext = (component, contextValue = mockContextValue) => {
  return render(
    <BrowserRouter>
      <Context.Provider value={contextValue}>
        {component}
      </Context.Provider>
    </BrowserRouter>
  );
};

describe('Jobs Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render jobs list correctly', async () => {
    axios.get.mockResolvedValueOnce({ data: mockJobs });

    renderWithContext(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('All Available Jobs')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Software Engineer')).toBeInTheDocument();
      expect(screen.getByText('Product Manager')).toBeInTheDocument();
    });
  });

  it('should fetch jobs from API on mount', async () => {
    axios.get.mockResolvedValueOnce({ data: mockJobs });

    renderWithContext(<Jobs />);

    await waitFor(() => {
      expect(axios.get).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/job/getall',
        { withCredentials: true }
      );
    });
  });

  it('should display job categories and locations', async () => {
    axios.get.mockResolvedValueOnce({ data: mockJobs });

    renderWithContext(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText('IT')).toBeInTheDocument();
      expect(screen.getByText('Management')).toBeInTheDocument();
      expect(screen.getByText('USA')).toBeInTheDocument();
    });
  });

  it('should have view details links for each job', async () => {
    axios.get.mockResolvedValueOnce({ data: mockJobs });

    renderWithContext(<Jobs />);

    await waitFor(() => {
      const viewDetailsLinks = screen.getAllByText('View Details');
      expect(viewDetailsLinks).toHaveLength(2);
    });
  });

  it('should display message when no jobs available', async () => {
    axios.get.mockResolvedValueOnce({ data: { success: true, jobs: [] } });

    renderWithContext(<Jobs />);

    await waitFor(() => {
      expect(screen.getByText(/No jobs available at the moment/i)).toBeInTheDocument();
    });
  });

  it('should handle API errors gracefully', async () => {
    const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
    axios.get.mockRejectedValueOnce(new Error('API Error'));

    renderWithContext(<Jobs />);

    await waitFor(() => {
      expect(consoleLogSpy).toHaveBeenCalled();
    });

    consoleLogSpy.mockRestore();
  });
});
