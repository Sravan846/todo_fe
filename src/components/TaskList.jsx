import React, { useState } from "react";
import { toast } from "react-toastify";
import TaskForm from "./TaskFrom";
import {
  useGetTasksQuery,
  useDeleteTaskMutation,
  useGetProfileQuery,
} from "../store/api/apiSlice";
const apiUrl = import.meta.env.VITE_API_URL;


const TaskList = () => {
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("-createdAt");
  const [editingTask, setEditingTask] = useState(null);
  const {
    data: tasks = [],
    isLoading,
    error,
  } = useGetTasksQuery({ search, sortBy });
  const { data: user } = useGetProfileQuery();
  const [deleteTask] = useDeleteTaskMutation();

  const handleDelete = async (id) => {
    try {
      await deleteTask(id).unwrap();
      toast.success("Task deleted successfully!");
    } catch (error) {
      toast.error(error.data?.errors?.[0]?.msg || "Failed to delete task.");
    }
  };

  const handleSave = () => {
    setEditingTask(null); // Clear editing state after save
  };

  if (isLoading) return <div className="text-center mt-5">Loading...</div>;
  if (error) {
    toast.error("Failed to load tasks.");
    return <div className="text-center mt-5">Error loading tasks.</div>;
  }

  return (
    <div className="container mt-4">
      <div className="row mb-3">
        <div className="col-md-6">
          <input
            type="text"
            className="form-control"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tasks"
          />
        </div>
        <div className="col-md-6">
          <select
            className="form-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="title">Title A-Z</option>
          </select>
        </div>
      </div>
      <TaskForm task={editingTask} onSave={handleSave} />
      <div className="row">
        {tasks.map((task) => (
          <div className="col-md-4 mb-3" key={task._id}>
            <div className="card h-100">
              {task.image && (
                <img
                  src={`${apiUrl}/${task.image}`}
                  className="card-img-top"
                  alt={task.title}
                  style={{ maxHeight: "150px", objectFit: "cover" }}
                />
              )}
              <div className="card-body">
                <h5 className="card-title">{task.title}</h5>
                <p className="card-text">Description : {task.description}</p>
                <p className="card-text">{`Updated at :${new Date(
                  task.updatedAt
                ).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                })}`}</p>
                {user.role == "admin" && (
                  <p className="card-text">
                    {task.user.role === "admin"
                      ? "Created by Admin"
                      : `User ${task.user?.username} created`}
                  </p>
                )}

                <button
                  className="btn btn-warning me-2"
                  onClick={() => setEditingTask(task)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-danger"
                  onClick={() => handleDelete(task._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskList;
