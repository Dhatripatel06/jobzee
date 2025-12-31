import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import Login from '../../components/Auth/Login';
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

describe('Login Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render login form correctly', () => {
    renderWithContext(<Login />);
    
    expect(screen.getByText('Welcome Back')).toBeInTheDocument();
    expect(screen.getByLabelText(/Login As/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('should show role dropdown options', () => {
    renderWithContext(<Login />);
    
    const roleSelect = screen.getByLabelText(/Login As/i);
    expect(roleSelect).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Employer/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /Job Seeker/i })).toBeInTheDocument();
  });

  it('should update form fields on user input', async () => {
    renderWithContext(<Login />);
    
    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const roleSelect = screen.getByLabelText(/Login As/i);

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(roleSelect, { target: { value: 'Job Seeker' } });

    expect(emailInput.value).toBe('test@example.com');
    expect(passwordInput.value).toBe('password123');
    expect(roleSelect.value).toBe('Job Seeker');
  });

  it('should handle successful login', async () => {
    const mockResponse = {
      data: {
        success: true,
        message: 'User Logged in successfully!',
        user: { _id: '123', name: 'Test User', role: 'Job Seeker' },
      },
    };

    axios.post.mockResolvedValueOnce(mockResponse);
    toast.success.mockImplementation(() => {});

    renderWithContext(<Login />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const roleSelect = screen.getByLabelText(/Login As/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(roleSelect, { target: { value: 'Job Seeker' } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        'http://localhost:4000/api/v1/user/login',
        {
          email: 'test@example.com',
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

  it('should handle login error', async () => {
    const errorMessage = 'Invalid Email Or Password.';
    axios.post.mockRejectedValueOnce({
      response: {
        data: {
          success: false,
          message: errorMessage,
        },
      },
    });

    toast.error.mockImplementation(() => {});

    renderWithContext(<Login />);

    const emailInput = screen.getByLabelText(/Email Address/i);
    const passwordInput = screen.getByLabelText(/Password/i);
    const roleSelect = screen.getByLabelText(/Login As/i);
    const loginButton = screen.getByRole('button', { name: /Login/i });

    fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
    fireEvent.change(passwordInput, { target: { value: 'wrongpassword' } });
    fireEvent.change(roleSelect, { target: { value: 'Job Seeker' } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith(errorMessage);
    });
  });

  it('should redirect to home if already authorized', () => {
    const authorizedContext = {
      ...mockContextValue,
      isAuthorized: true,
    };

    const { container } = renderWithContext(<Login />, authorizedContext);
    
    // When authorized, the component should redirect (render Navigate component)
    // In test environment, we can check that the login form is not rendered
    expect(screen.queryByText('Welcome Back')).not.toBeInTheDocument();
  });

  it('should have link to register page', () => {
    renderWithContext(<Login />);
    
    const registerLink = screen.getByText(/Don't have an account/i).closest('p').querySelector('a');
    expect(registerLink).toBeInTheDocument();
    expect(registerLink).toHaveAttribute('href', '/register');
  });

  it('should require all fields to be filled', async () => {
    renderWithContext(<Login />);
    
    const loginButton = screen.getByRole('button', { name: /Login/i });

    // Try to submit without filling fields
    fireEvent.click(loginButton);

    // Form should not be submitted (axios should not be called)
    expect(axios.post).not.toHaveBeenCalled();
  });
});
