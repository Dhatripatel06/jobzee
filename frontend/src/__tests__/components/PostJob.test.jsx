import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import PostJob from '../../components/Job/PostJob';
import { Context } from '../../main';

vi.mock('axios');
vi.mock('react-hot-toast');

const mockEmployerContext = {
  isAuthorized: true,
  setIsAuthorized: vi.fn(),
  user: { _id: '123', name: 'Test Employer', role: 'Employer' },
  setUser: vi.fn(),
};

const mockJobSeekerContext = {
  isAuthorized: true,
  setIsAuthorized: vi.fn(),
  user: { _id: '456', name: 'Test Job Seeker', role: 'Job Seeker' },
  setUser: vi.fn(),
};

const renderWithContext = (component, contextValue = mockEmployerContext) => {
  return render(
    <BrowserRouter>
      <Context.Provider value={contextValue}>
        {component}
      </Context.Provider>
    </BrowserRouter>
  );
};

describe('PostJob Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render post job form correctly for employer', () => {
    renderWithContext(<PostJob />);
    
    expect(screen.getByText('Post New Job')).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Category/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Country/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Job Description/i)).toBeInTheDocument();
  });

  it('should update form fields on user input', async () => {
    renderWithContext(<PostJob />);
    
    const titleInput = screen.getByLabelText(/Job Title/i);
    const categorySelect = screen.getByLabelText(/Category/i);
    const countryInput = screen.getByLabelText(/Country/i);
    const cityInput = screen.getByLabelText(/City/i);

    fireEvent.change(titleInput, { target: { value: 'Software Engineer' } });
    fireEvent.change(categorySelect, { target: { value: 'IT' } });
    fireEvent.change(countryInput, { target: { value: 'USA' } });
    fireEvent.change(cityInput, { target: { value: 'New York' } });

    expect(titleInput.value).toBe('Software Engineer');
    expect(categorySelect.value).toBe('IT');
    expect(countryInput.value).toBe('USA');
    expect(cityInput.value).toBe('New York');
  });

  it('should have salary type options', () => {
    renderWithContext(<PostJob />);
    
    const salaryTypeSelect = screen.getByLabelText(/Salary Type/i);
    expect(salaryTypeSelect).toBeInTheDocument();
  });

  it('should show fixed salary field when fixed salary is selected', async () => {
    renderWithContext(<PostJob />);
    
    const salaryTypeSelect = screen.getByLabelText(/Salary Type/i);
    fireEvent.change(salaryTypeSelect, { target: { value: 'Fixed Salary' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/Fixed Salary/i)).toBeInTheDocument();
    });
  });

  it('should show salary range fields when ranged salary is selected', async () => {
    renderWithContext(<PostJob />);
    
    const salaryTypeSelect = screen.getByLabelText(/Salary Type/i);
    fireEvent.change(salaryTypeSelect, { target: { value: 'Ranged Salary' } });

    await waitFor(() => {
      expect(screen.getByLabelText(/Salary From/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Salary To/i)).toBeInTheDocument();
    });
  });

  it('should handle successful job posting with fixed salary', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'Job Posted Successfully!',
        job: {
          _id: '789',
          title: 'Software Engineer',
          fixedSalary: 100000,
        },
      },
    };

    axios.post.mockResolvedValueOnce(mockResponse);
    toast.success.mockImplementation(() => {});

    renderWithContext(<PostJob />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Job Title/i), {
      target: { value: 'Software Engineer' },
    });
    fireEvent.change(screen.getByLabelText(/Category/i), {
      target: { value: 'IT' },
    });
    fireEvent.change(screen.getByLabelText(/Job Description/i), {
      target: { value: 'Looking for an experienced software engineer' },
    });
    fireEvent.change(screen.getByLabelText(/Country/i), {
      target: { value: 'USA' },
    });
    fireEvent.change(screen.getByLabelText(/City/i), {
      target: { value: 'New York' },
    });
    fireEvent.change(screen.getByLabelText(/Location/i), {
      target: { value: '123 Tech Street, Manhattan' },
    });
    fireEvent.change(screen.getByLabelText(/Salary Type/i), {
      target: { value: 'Fixed Salary' },
    });

    await waitFor(() => {
      const fixedSalaryInput = screen.getByLabelText(/Fixed Salary/i);
      fireEvent.change(fixedSalaryInput, { target: { value: '100000' } });
    });

    const submitButton = screen.getByRole('button', { name: /Post Job/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Job Posted Successfully!');
    });
  });

  it('should handle job posting error', async () => {
    const errorMessage = 'Please provide full job details.';
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          message: errorMessage,
        },
      },
    });

    toast.error.mockImplementation(() => {});

    renderWithContext(<PostJob />);

    const submitButton = screen.getByRole('button', { name: /Post Job/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should have multiple job categories in dropdown', () => {
    renderWithContext(<PostJob />);
    
    const categorySelect = screen.getByLabelText(/Category/i);
    expect(categorySelect.children.length).toBeGreaterThan(1);
  });
});
