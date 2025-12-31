import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Register from '../../components/Auth/Register';
import { Context } from '../../main';

vi.mock('axios');
vi.mock('react-hot-toast');

const mockContextValue = {
  isAuthorized: false,
  setIsAuthorized: vi.fn(),
  user: null,
  setUser: vi.fn(),
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

describe('Register Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render registration form correctly', () => {
    renderWithContext(<Register />);
    
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByLabelText(/Register As/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Phone Number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Register/i })).toBeInTheDocument();
  });

  it('should update form fields on user input', async () => {
    renderWithContext(<Register />);
    
    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const roleSelect = screen.getByLabelText(/Register As/i);

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(roleSelect, { target: { value: 'Job Seeker' } });

    expect(nameInput.value).toBe('John Doe');
    expect(emailInput.value).toBe('john@example.com');
    expect(phoneInput.value).toBe('1234567890');
    expect(passwordInput.value).toBe('password123');
    expect(roleSelect.value).toBe('Job Seeker');
  });

  it('should handle successful registration', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'User Registered! Successfully',
        user: {
          _id: '123',
          name: 'John Doe',
          email: 'john@example.com',
          role: 'Job Seeker',
        },
      },
    };

    axios.post.mockResolvedValueOnce(mockResponse);
    toast.success.mockImplementation(() => {});

    renderWithContext(<Register />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const roleSelect = screen.getByLabelText(/Register As/i);
    const registerButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(roleSelect, { target: { value: 'Job Seeker' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/user/register',
        {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '1234567890',
          password: 'password123',
          role: 'Job Seeker',
        },
        {
          withCredentials: true,
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
    });

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalledWith(mockResponse.data.message);
      expect(mockContextValue.setIsAuthorized).toHaveBeenCalledWith(true);
    });
  });

  it('should handle registration error for duplicate email', async () => {
    const errorMessage = 'Email already exists!';
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          message: errorMessage,
        },
      },
    });

    toast.error.mockImplementation(() => {});

    renderWithContext(<Register />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const roleSelect = screen.getByLabelText(/Register As/i);
    const registerButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'existing@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(roleSelect, { target: { value: 'Job Seeker' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should redirect to home if already authorized', () => {
    const authorizedContext = {
      ...mockContextValue,
      isAuthorized: true,
    };

    renderWithContext(<Register />, authorizedContext);
    
    expect(screen.queryByText('Create Account')).not.toBeInTheDocument();
  });

  it('should have link to login page', () => {
    renderWithContext(<Register />);
    
    const loginLink = screen.getByText(/Already have an account/i).closest('p').querySelector('a');
    expect(loginLink).toBeInTheDocument();
    expect(loginLink).toHaveAttribute('href', '/login');
  });

  it('should render both role options', () => {
    renderWithContext(<Register />);
    
    expect(screen.getByRole('option', { name: /Employer/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Job Seeker/i })).toBeInTheDocument();
  });

  it('should clear form fields after successful registration', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'User Registered! Successfully',
        user: { _id: '123', name: 'John Doe', role: 'Job Seeker' },
      },
    };

    axios.post.mockResolvedValueOnce(mockResponse);
    toast.success.mockImplementation(() => {});

    renderWithContext(<Register />);

    const nameInput = screen.getByLabelText(/Full Name/i);
    const emailInput = screen.getByLabelText(/Email Address/i);
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const roleSelect = screen.getByLabelText(/Register As/i);
    const registerButton = screen.getByRole('button', { name: /Register/i });

    fireEvent.change(nameInput, { target: { value: 'John Doe' } });
    fireEvent.change(emailInput, { target: { value: 'john@example.com' } });
    fireEvent.change(phoneInput, { target: { value: '1234567890' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(roleSelect, { target: { value: 'Job Seeker' } });

    fireEvent.click(registerButton);

    await waitFor(() => {
      expect(mockContextValue.setIsAuthorized).toHaveBeenCalledWith(true);
    });

    // After successful registration, form should be cleared
    await waitFor(() => {
      expect(nameInput.value).toBe('');
      expect(emailInput.value).toBe('');
      expect(phoneInput.value).toBe('');
      expect(passwordInput.value).toBe('');
      expect(roleSelect.value).toBe('');
    });
  });
});
