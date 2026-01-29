/**
 * Profile Settings Integration Tests
 * Tests complete user workflows including view → edit → save flows
 * Tests form submission and API integration
 * Tests navigation and routing functionality
 * 
 * Task: 10.4 Write integration tests for complete workflows
 */

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { act } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, test, vi } from 'vitest';
import ProfilePage from '../../src/components/ProfilePage';
import { AuthContext } from '../../src/context/AuthContext';
import api from '../../src/utils/api.js';

// Mock dependencies
vi.mock('../../src/utils/api.js', () => ({
  default: {
    get: vi.fn(),
    put: vi.fn()
  }
}));

vi.mock('react-hot-toast', () => {
  return {
    default: {
      success: vi.fn(),
      error: vi.fn(),
      loading: vi.fn(),
      dismiss: vi.fn()
    },
    Toaster: () => null
  };
});

// Mock framer-motion completely
vi.mock('framer-motion', () => {
  const React = require('react');
  return {
    motion: new Proxy({}, {
      get: (target, prop) => {
        const Component = React.forwardRef(({ children, ...props }, ref) => {
          return React.createElement(prop, { ...props, ref }, children);
        });
        Component.displayName = `motion.${prop}`;
        return Component;
      }
    })
  };
});

describe('Profile Settings Integration Tests', () => {
  // Mock user data
  const mockUser = {
    _id: '507f1f77bcf86cd799439011',
    name: 'Test User',
    email: 'test@example.com',
    profile: {
      phone: '+1234567890',
      location: 'Test City',
      avatar: ''
    },
    preferences: {
      notifications: true,
      dailyReminders: true,
      achievementAlerts: true,
      emailUpdates: false
    },
    stats: {
      streak: 5,
      totalSessions: 10,
      totalMinutes: 100,
      longestStreak: 7
    },
    achievements: [],
    createdAt: '2024-01-01T00:00:00.000Z'
  };

  const mockAuthContext = {
    user: mockUser,
    token: 'mock-jwt-token',
    logout: vi.fn()
  };

  const renderProfilePage = (authContext = mockAuthContext) => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={authContext}>
          <ProfilePage />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Default successful API response
    api.get.mockResolvedValue({
      data: {
        success: true,
        data: mockUser
      }
    });
  });

  describe('Complete User Workflow: View → Edit → Save', () => {
    test('should complete full profile edit workflow successfully', async () => {
      // Render the profile page
      renderProfilePage();

      // Wait for profile data to load
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/user/profile');
      });

      await waitFor(() => {
        const userName = screen.queryByText('Test User');
        expect(userName).not.toBeNull();
      });

      // Step 1: View - Verify initial data is displayed
      expect(screen.queryByText('Test User')).not.toBeNull();
      expect(screen.queryByText('test@example.com')).not.toBeNull();
      expect(screen.queryByText('Test City')).not.toBeNull();

      // Step 2: Edit - Click edit button on PersonalInfoCard
      const editButton = screen.getByRole('button', { name: /edit/i });
      expect(editButton).not.toBeNull();

      await act(async () => {
        fireEvent.click(editButton);
      });

      // Verify form fields are now editable
      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('Test User');
        expect(nameInput).not.toBeNull();
        expect(nameInput.disabled).toBe(false);
      });

      // Step 3: Modify data
      const nameInput = screen.getByDisplayValue('Test User');
      const emailInput = screen.getByDisplayValue('test@example.com');
      const locationInput = screen.getByDisplayValue('Test City');

      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Updated User' } });
        fireEvent.change(emailInput, { target: { value: 'updated@example.com' } });
        fireEvent.change(locationInput, { target: { value: 'Updated City' } });
      });

      // Verify inputs were updated
      expect(nameInput.value).toBe('Updated User');
      expect(emailInput.value).toBe('updated@example.com');
      expect(locationInput.value).toBe('Updated City');

      // Step 4: Save - Mock successful API response
      const updatedUser = {
        ...mockUser,
        name: 'Updated User',
        email: 'updated@example.com',
        profile: {
          ...mockUser.profile,
          location: 'Updated City'
        }
      };

      api.put.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Profile updated successfully',
          data: updatedUser
        }
      });

      // Click save button
      const saveButton = screen.getByRole('button', { name: /save/i });
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Step 5: Verify - Check API was called with correct data
      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith('/user/profile', expect.objectContaining({
          name: 'Updated User',
          email: 'updated@example.com',
          profile: expect.objectContaining({
            location: 'Updated City'
          })
        }));
      });

      // Verify UI shows updated data
      await waitFor(() => {
        expect(screen.queryByText('Updated User')).not.toBeNull();
      });
    });

    test('should handle edit cancellation and revert changes', async () => {
      renderProfilePage();

      // Wait for profile data to load
      await waitFor(() => {
        expect(screen.queryByText('Test User')).not.toBeNull();
      });

      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit/i });
      await act(async () => {
        fireEvent.click(editButton);
      });

      // Modify data
      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('Test User');
        expect(nameInput).not.toBeNull();
      });

      const nameInput = screen.getByDisplayValue('Test User');
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Changed Name' } });
      });

      expect(nameInput.value).toBe('Changed Name');

      // Click cancel button
      const cancelButton = screen.getByRole('button', { name: /cancel/i });
      await act(async () => {
        fireEvent.click(cancelButton);
      });

      // Verify original data is restored
      await waitFor(() => {
        expect(screen.queryByText('Test User')).not.toBeNull();
      });

      // Verify API was not called
      expect(api.put).not.toHaveBeenCalled();
    });

    test('should handle validation errors during save', async () => {
      renderProfilePage();

      // Wait for profile data to load
      await waitFor(() => {
        expect(screen.queryByText('Test User')).not.toBeNull();
      });

      // Click edit button
      const editButton = screen.getByRole('button', { name: /edit/i });
      await act(async () => {
        fireEvent.click(editButton);
      });

      // Enter invalid data
      await waitFor(() => {
        const emailInput = screen.getByDisplayValue('test@example.com');
        expect(emailInput).not.toBeNull();
      });

      const emailInput = screen.getByDisplayValue('test@example.com');
      await act(async () => {
        fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      });

      // Mock validation error response
      api.put.mockRejectedValueOnce({
        response: {
          status: 400,
          data: {
            success: false,
            message: 'Validation error',
            errors: {
              email: 'Invalid email format'
            }
          }
        }
      });

      // Click save button
      const saveButton = screen.getByRole('button', { name: /save/i });
      await act(async () => {
        fireEvent.click(saveButton);
      });

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.queryByText(/Invalid email format/i)).not.toBeNull();
      });

      // Verify form remains in edit mode
      expect(emailInput).not.toBeNull();
      expect(emailInput.disabled).toBe(false);
    });
  });

  describe('Form Submission and API Integration', () => {
    test('should handle successful preference toggle with API integration', async () => {
      renderProfilePage();

      // Wait for profile data to load
      await waitFor(() => {
        expect(screen.queryByText('Test User')).not.toBeNull();
      });

      // Mock successful preference update
      const updatedUser = {
        ...mockUser,
        preferences: {
          ...mockUser.preferences,
          notifications: false
        }
      };

      api.put.mockResolvedValueOnce({
        data: {
          success: true,
          data: updatedUser
        }
      });

      // Find and click the notifications toggle
      const toggleButtons = screen.getAllByRole('switch');
      const notificationsToggle = toggleButtons[0]; // First toggle is notifications

      await act(async () => {
        fireEvent.click(notificationsToggle);
      });

      // Verify API was called
      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith('/user/preferences', expect.objectContaining({
          notifications: false
        }));
      });

      // Verify toggle state changed
      await waitFor(() => {
        expect(notificationsToggle.getAttribute('aria-checked')).toBe('false');
      });
    });

    test('should handle network errors gracefully', async () => {
      // Mock network error on initial load
      api.get.mockRejectedValueOnce({
        message: 'Network Error',
        code: 'ERR_NETWORK'
      });

      renderProfilePage();

      // Verify error message is displayed
      await waitFor(() => {
        expect(screen.queryByText(/Network error/i)).not.toBeNull();
      });

      // Verify retry button is available
      const retryButton = screen.getByRole('button', { name: /try again/i });
      expect(retryButton).not.toBeNull();

      // Mock successful retry
      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockUser
        }
      });

      // Click retry
      await act(async () => {
        fireEvent.click(retryButton);
      });

      // Verify data loads successfully
      await waitFor(() => {
        expect(screen.queryByText('Test User')).not.toBeNull();
      });
    });
  });

  describe('Navigation and Routing Functionality', () => {
    test('should handle 401 errors and redirect to login', async () => {
      // Mock 401 error
      api.get.mockRejectedValueOnce({
        response: {
          status: 401,
          data: {
            success: false,
            message: 'Not authorized'
          }
        }
      });

      const mockLogout = vi.fn();
      const authContextWith401 = {
        ...mockAuthContext,
        logout: mockLogout
      };

      renderProfilePage(authContextWith401);

      // Verify logout was called
      await waitFor(() => {
        expect(mockLogout).toHaveBeenCalled();
      });
    });

    test('should maintain profile state during navigation', async () => {
      const { rerender } = renderProfilePage();

      // Wait for profile data to load
      await waitFor(() => {
        expect(screen.queryByText('Test User')).not.toBeNull();
      });

      // Verify initial data
      expect(screen.queryByText('Test City')).not.toBeNull();

      // Simulate navigation away and back (rerender with same context)
      rerender(
        <BrowserRouter>
          <AuthContext.Provider value={mockAuthContext}>
            <ProfilePage />
          </AuthContext.Provider>
        </BrowserRouter>
      );

      // Verify data is fetched again on mount
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledTimes(2);
      });
    });
  });

  describe('Complete Workflow: Multiple Component Interactions', () => {
    test('should handle profile update and preference change in sequence', async () => {
      renderProfilePage();

      // Wait for profile data to load
      await waitFor(() => {
        expect(screen.queryByText('Test User')).not.toBeNull();
      });

      // Step 1: Update profile
      const editButton = screen.getByRole('button', { name: /edit/i });
      await act(async () => {
        fireEvent.click(editButton);
      });

      await waitFor(() => {
        const nameInput = screen.getByDisplayValue('Test User');
        expect(nameInput).not.toBeNull();
      });

      const nameInput = screen.getByDisplayValue('Test User');
      await act(async () => {
        fireEvent.change(nameInput, { target: { value: 'Updated User' } });
      });

      api.put.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Profile updated successfully',
          data: { ...mockUser, name: 'Updated User' }
        }
      });

      const saveButton = screen.getByRole('button', { name: /save/i });
      await act(async () => {
        fireEvent.click(saveButton);
      });

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith('/user/profile', expect.any(Object));
      });

      // Step 2: Change preference
      api.put.mockResolvedValueOnce({
        data: {
          success: true,
          data: {
            ...mockUser,
            name: 'Updated User',
            preferences: {
              ...mockUser.preferences,
              notifications: false
            }
          }
        }
      });

      const toggleButtons = screen.getAllByRole('switch');
      const notificationsToggle = toggleButtons[0];

      await act(async () => {
        fireEvent.click(notificationsToggle);
      });

      // Verify both operations completed successfully
      await waitFor(() => {
        expect(api.put).toHaveBeenCalledTimes(2);
      });

      expect(api.put).toHaveBeenNthCalledWith(1, '/user/profile', expect.any(Object));
      expect(api.put).toHaveBeenNthCalledWith(2, '/user/preferences', expect.any(Object));
    });

    test('should display loading state during data fetch', async () => {
      // Mock slow API response
      let resolveApiCall;
      const apiPromise = new Promise((resolve) => {
        resolveApiCall = resolve;
      });

      api.get.mockImplementationOnce(() => apiPromise);

      renderProfilePage();

      // Verify loading state is displayed
      expect(screen.queryByText(/Loading profile/i)).not.toBeNull();

      // Resolve API call
      await act(async () => {
        resolveApiCall({
          data: {
            success: true,
            data: mockUser
          }
        });
      });

      // Verify loading state is removed and data is displayed
      await waitFor(() => {
        expect(screen.queryByText(/Loading profile/i)).toBeNull();
        expect(screen.queryByText('Test User')).not.toBeNull();
      });
    });
  });

  describe('Error Recovery and Edge Cases', () => {
    test('should recover from transient errors with retry', async () => {
      // First call fails, second succeeds
      api.get
        .mockRejectedValueOnce({
          message: 'Network Error',
          code: 'ERR_NETWORK'
        })
        .mockResolvedValueOnce({
          data: {
            success: true,
            data: mockUser
          }
        });

      renderProfilePage();

      // Verify error is displayed
      await waitFor(() => {
        expect(screen.queryByText(/Network error/i)).not.toBeNull();
      });

      // Click retry
      const retryButton = screen.getByRole('button', { name: /try again/i });
      await act(async () => {
        fireEvent.click(retryButton);
      });

      // Verify data loads successfully
      await waitFor(() => {
        expect(screen.queryByText('Test User')).not.toBeNull();
      });

      // Verify retry count is reset
      expect(screen.queryByText(/Retry attempt/i)).toBeNull();
    });

    test('should handle empty profile data gracefully', async () => {
      const emptyUser = {
        _id: '507f1f77bcf86cd799439011',
        name: 'Test User',
        email: 'test@example.com',
        profile: {
          phone: '',
          location: '',
          avatar: ''
        },
        preferences: {
          notifications: true,
          dailyReminders: true,
          achievementAlerts: true,
          emailUpdates: false
        },
        stats: {
          streak: 0,
          totalSessions: 0,
          totalMinutes: 0,
          longestStreak: 0
        },
        achievements: [],
        createdAt: '2024-01-01T00:00:00.000Z'
      };

      api.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: emptyUser
        }
      });

      renderProfilePage();

      // Verify page renders without errors
      await waitFor(() => {
        expect(screen.queryByText('Test User')).not.toBeNull();
      });

      // Verify stats display zeros
      expect(screen.queryByText('0')).not.toBeNull();
    });

    test('should handle server errors with appropriate messaging', async () => {
      api.get.mockRejectedValueOnce({
        response: {
          status: 500,
          data: {
            success: false,
            message: 'Internal Server Error'
          }
        }
      });

      renderProfilePage();

      // Verify server error message is displayed
      await waitFor(() => {
        expect(screen.queryByText(/Server error/i)).not.toBeNull();
      });

      // Verify retry option is available
      expect(screen.getByRole('button', { name: /try again/i })).not.toBeNull();
    });
  });
});
