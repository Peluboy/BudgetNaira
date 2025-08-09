import React, { useState } from 'react';

interface EventFormProps {
  onSubmit: (data: any) => void;
  initialData?: any;
  onCancel: () => void;
  selectedDate?: Date | null;
}

const EventForm: React.FC<EventFormProps> = ({ onSubmit, initialData, onCancel, selectedDate }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    description: initialData?.description || '',
    amount: initialData?.amount || '',
    date: selectedDate 
      ? selectedDate.toISOString().split('T')[0] 
      : initialData?.date 
        ? new Date(initialData.date).toISOString().split('T')[0]
        : '',
    type: initialData?.type || 'bill',
    frequency: initialData?.frequency || 'once',
    reminderDays: initialData?.reminderDays || 3,
    category: initialData?.category || '',
    isCompleted: initialData?.isCompleted || false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      amount: formData.amount ? Number(formData.amount) : undefined
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title
        </label>
        <input
          id="title"
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
          rows={3}
        />
      </div>

      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Amount (₦)
        </label>
        <input
          id="amount"
          type="number"
          value={formData.amount}
          onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Date
        </label>
        <input
          id="date"
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
          required
        />
      </div>

      <div>
        <label htmlFor="type" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Event Type
        </label>
        <select
          id="type"
          value={formData.type}
          onChange={(e) => setFormData({ ...formData, type: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
          required
        >
          <option value="bill">Bill</option>
          <option value="payment">Payment</option>
          <option value="payday">Payday</option>
          <option value="goal_review">Goal Review</option>
          <option value="tax">Tax</option>
          <option value="custom">Custom</option>
        </select>
      </div>

      <div>
        <label htmlFor="frequency" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Frequency
        </label>
        <select
          id="frequency"
          value={formData.frequency}
          onChange={(e) => setFormData({ ...formData, frequency: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
          required
        >
          <option value="once">Once</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
          <option value="yearly">Yearly</option>
        </select>
      </div>

      <div>
        <label htmlFor="reminderDays" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Reminder Days Before
        </label>
        <input
          id="reminderDays"
          type="number"
          value={formData.reminderDays}
          onChange={(e) => setFormData({ ...formData, reminderDays: Number(e.target.value) })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
          min="0"
          max="30"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Category
        </label>
        <input
          id="category"
          type="text"
          value={formData.category}
          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:bg-gray-700 dark:border-gray-600"
        />
      </div>

      {initialData && (
        <div className="flex items-center">
          <input
            id="isCompleted"
            type="checkbox"
            checked={formData.isCompleted}
            onChange={(e) => setFormData({ ...formData, isCompleted: e.target.checked })}
            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
          />
          <label htmlFor="isCompleted" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
            Mark as Completed
          </label>
        </div>
      )}

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="btn btn-primary"
        >
          {initialData ? 'Update Event' : 'Create Event'}
        </button>
      </div>
    </form>
  );
};

export default EventForm; 