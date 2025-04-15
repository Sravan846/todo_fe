import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { useCreateTaskMutation, useUpdateTaskMutation } from '../store/api/apiSlice';

const taskSchema = Yup.object().shape({
  title: Yup.string().min(3, 'Title must be at least 3 characters').required('Title is required'),
  description: Yup.string().max(500, 'Description cannot exceed 500 characters'),
});

const TaskForm = ({ task, onSave }) => {
  // Initialize form data with task if provided
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
  });
  const [image, setImage] = useState(null);
  const [errors, setErrors] = useState({});
  const [createTask, { isLoading: isCreating }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdating }] = useUpdateTaskMutation();

  // Reset form when task prop changes (e.g., switching edit task or clearing)
  useEffect(() => {
    setFormData({
      title: task?.title || '',
      description: task?.description || '',
    });
    setImage(null);
    setErrors({});
  }, [task]);

  // Validate form dynamically
  useEffect(() => {
    taskSchema
      .validate(formData, { abortEarly: false })
      .then(() => {
        const newErrors = { ...errors };
        delete newErrors.title;
        delete newErrors.description;
        setErrors(newErrors);
      })
      .catch((err) => {
        const newErrors = { ...errors };
        err.inner.forEach((error) => {
          newErrors[error.path] = error.message;
        });
        setErrors(newErrors);
      });

    // Validate image
    if (image) {
      if (image.size > 2 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image size must be less than 2MB' }));
      } else if (!image.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Only image files are allowed' }));
      } else {
        setErrors((prev) => {
          const newErrors = { ...prev };
          delete newErrors.image;
          return newErrors;
        });
      }
    } else {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.image;
        return newErrors;
      });
    }
  }, [formData, image]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await taskSchema.validate(formData, { abortEarly: false });
      if (image && (image.size > 2 * 1024 * 1024 || !image.type.startsWith('image/'))) {
        throw new Error('Invalid image');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('description', formData.description);
      if (image) formDataToSend.append('image', image);

      if (task) {
        await updateTask({ id: task._id, taskData: formDataToSend }).unwrap();
        toast.success('Task updated successfully!');
      } else {
        await createTask(formDataToSend).unwrap();
        toast.success('Task created successfully!');
      }

      // Reset form after save
      setFormData({ title: '', description: '' });
      setImage(null);
      setErrors({});
      onSave();
    } catch (error) {
      if (error.name === 'ValidationError') {
        const newErrors = {};
        error.inner.forEach((err) => {
          newErrors[err.path] = err.message;
        });
        setErrors(newErrors);
        toast.error('Please fix the form errors.');
      } else if (error.message === 'Invalid image') {
        toast.error('Please fix the image errors.');
      } else {
        toast.error(error.data?.errors?.[0]?.msg || 'Failed to save task.');
      }
    }
  };

  return (
    <div className="card p-3 mb-4">
      <h3>{task ? 'Edit Task' : 'Add Task'}</h3>
      <form onSubmit={handleSubmit} noValidate>
        <div className="mb-3">
          <label htmlFor="title" className="form-label">Title</label>
          <input
            type="text"
            className={`form-control ${errors.title ? 'is-invalid' : ''}`}
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="Task title"
          />
          {errors.title && <div className="invalid-feedback">{errors.title}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="description" className="form-label">Description</label>
          <textarea
            className={`form-control ${errors.description ? 'is-invalid' : ''}`}
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Task description"
          />
          {errors.description && <div className="invalid-feedback">{errors.description}</div>}
        </div>
        <div className="mb-3">
          <label htmlFor="image" className="form-label">Image</label>
          <input
            type="file"
            className={`form-control ${errors.image ? 'is-invalid' : ''}`}
            id="image"
            onChange={handleFileChange}
            accept="image/*"
          />
          {errors.image && <div className="invalid-feedback">{errors.image}</div>}
        </div>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isCreating || isUpdating}
        >
          {isCreating || isUpdating ? 'Saving...' : 'Save'}
        </button>
      </form>
    </div>
  );
};

export default TaskForm;