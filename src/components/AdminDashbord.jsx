import React from 'react';
import { toast } from 'react-toastify';
import { useGetUsersQuery, useBlockUserMutation } from '../store/api/apiSlice';

const AdminDashboard = () => {
  const { data: users = [], isLoading, error } = useGetUsersQuery();
  const [blockUser] = useBlockUserMutation();

  const handleBlock = async (id) => {
    try {
      await blockUser(id).unwrap();
      toast.success('User status updated!');
    } catch (error) {
      toast.error(error.data?.errors?.[0]?.msg || 'Failed to update user status.');
    }
  };

  if (isLoading) return <div className="text-center mt-5">Loading...</div>;
  if (error) {
    toast.error('Failed to load users.');
    return <div className="text-center mt-5">Error loading users.</div>;
  }

  return (
    <div className="container mt-5">
      <h2 className="mb-4">Admin Dashboard</h2>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Username</th>
              <th>Email</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td>{user.username}</td>
                <td>{user.email}</td>
                <td>{user.isBlocked ? 'Blocked' : 'Active'}</td>
                <td>
                  <button
                    className={`btn ${user.isBlocked ? 'btn-success' : 'btn-danger'}`}
                    onClick={() => handleBlock(user._id)}
                  >
                    {user.isBlocked ? 'Unblock' : 'Block'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminDashboard;