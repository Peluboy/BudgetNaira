import React, { useState } from 'react';

interface EventFormProps {
  onSubmit: (event: any) => void;
  initialData?: any;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    date: initialData?.date || '',
    type: initialData?.type || 'bill',
    frequency: initialData?.frequency || 'once',
    reminderDays: initialData?.reminderDays || 3
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>
      {/* Add other form fields */}
      <button type="submit">Save Event</button>
    </form>
  );
};

export default EventForm; 