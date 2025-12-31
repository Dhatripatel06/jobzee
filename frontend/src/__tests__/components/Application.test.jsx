import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Application from '../../components/Application/Application';
import { Context } from '../../main';

vi.mock('axios');
vi.mock('react-hot-toast');

const mockJobSeekerContext = {
  isAuthorized: true,
  setIsAuthorized: vi.fn(),
  user: { _id: '123', name: 'Test Job Seeker', role: 'Job Seeker' },
  setUser: vi.fn(),
};

const renderWithContext = (component, contextValue = mockJobSeekerContext, initialRoute = '/application/job123') => {
  window.history.pushState({}, 'Test page', initialRoute);
  
  return render(
    <BrowserRouter>
      <Context.Provider value={contextValue}>
        <Routes>
          <Route path="/application/:id" element={component} />
        </Routes>
      </Context.Provider>
    </BrowserRouter>
  );
};

describe('Application Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render application form correctly', () => {
    renderWithContext(<Application />);
    
    expect(screen.getByText('Job Application Form')).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cover Letter/i)).toBeInTheDocument();
  });

  it('should update form fields on user input', async () => {
    renderWithContext(<Application />);
    
    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email/i);
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    const addressInput = screen.getByLabelText(/Address/i);
    const coverLetterInput = screen.getByLabelText(/Cover Letter/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(addressInput, { target: { value: '123 Main St' } });
    fireEvent.change(coverLetterInput, { target: { value: 'I am interested in this position' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(phoneInput.value).toBe('1234567890');
    expect(addressInput.value).toBe('123 Main St');
    expect(coverLetterInput.value).toBe('I am interested in this position');
  });

  it('should have file upload input for resume', () => {
    renderWithContext(<Application />);
    
    const fileInput = screen.getByLabelText(/Upload Resume/i);
    expect(fileInput).toBeInTheDocument();
    expect(fileInput).toHaveAttribute('type', 'file');
  });

  it('should handle file selection', async () => {
    renderWithContext(<Application />);
    
    const fileInput = screen.getByLabelText(/Upload Resume/i);
    const file = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });

    fireEvent.change(fileInput, { target: { files: [file] } });

    await waitFor(() => {
      expect(fileInput.files[0]).toBe(file);
      expect(fileInput.files[0].name).toBe('resume.pdf');
    });
  });

  it('should handle successful application submission', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'Application Submitted!',
        application: {
          _id: '789',
          name: 'John Doe',
        },
      },
    };

    axios.post.mockResolvedValueOnce(mockResponse);
    toast.success.mockImplementation(() => {});

    renderWithContext(<Application />);

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'john@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '1234567890' },
    });
    fireEvent.change(screen.getByLabelText(/Address/i), {
      target: { value: '123 Main St' },
    });
    fireEvent.change(screen.getByLabelText(/Cover Letter/i), {
      target: { value: 'I am interested in this position' },
    });

    const fileInput = screen.getByLabelText(/Upload Resume/i);
    const file = new File(['resume content'], 'resume.pdf', { type: 'application/pdf' });
    fireEvent.change(fileInput, { target: { files: [file] } });

    const submitButton = screen.getByRole('button', { name: /Submit Application/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/application/post',
        expect.any(FormData),
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith('Application Submitted!');
    });
  });

  it('should handle application submission error', async () => {
    const errorMessage = 'Please fill all fields.';
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          message: errorMessage,
        },
      },
    });

    toast.error.mockImplementation(() => {});

    renderWithContext(<Application />);

    const submitButton = screen.getByRole('button', { name: /Submit Application/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should clear form after successful submission', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'Application Submitted!',
      },
    };

    axios.post.mockResolvedValueOnce(mockResponse);
    toast.success.mockImplementation(() => {});

    renderWithContext(<Application />);

    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Email/i), {
      target: { value: 'john@example.com' },
    });

    const submitButton = screen.getByRole('button', { name: /Submit Application/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });

    // Form should be cleared
    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/i).value).toBe('');
      expect(screen.getByLabelText(/Email/i).value).toBe('');
    });
  });
});
