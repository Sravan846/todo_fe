import React from 'react';
import { toast } from 'react-toastify';
import { useGetProfileQuery } from '../store/api/apiSlice';

const Profile = () => {
  const { data: user, isLoading, error } = useGetProfileQuery();

  if (isLoading) return <div className="text-center mt-5">Loading...</div>;
  if (error) {
    toast.error('Failed to load profile.');
    return <div className="text-center mt-5">Unable to load profile.</div>;
  }

  return (
    <div className="container mt-5">
      <div className="row justify-content-center">
        <div className="col-md-6">
          <div className="card p-4">
            <h2 className="text-center mb-4">Profile</h2>
            <p><strong>Username:</strong> {user.username}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Role:</strong> {user.role}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;