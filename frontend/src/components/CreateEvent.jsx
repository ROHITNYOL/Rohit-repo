
import React, { useState } from 'react';
import axios from 'axios';

const CreateEvent = () => {
  const [events, setEvents] = useState({
    summary: '',
    location: '',
    description: '',
    start: '',
    end: '',
  });

  const handleChange = (e) => {
    setEvents({ ...events, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/events', 
      {
        ...events,
      },
      { withCredentials: true }
    );
      console.log(response.data);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" name="summary" onChange={handleChange} placeholder="Summary" />
      <input type="text" name="location" onChange={handleChange} placeholder="Location" />
      <input type="text" name="description" onChange={handleChange} placeholder="Description" />
      <input type="datetime-local" name="start" onChange={handleChange} placeholder="Start Time" />
      <input type="datetime-local" name="end" onChange={handleChange} placeholder="End Time" />
      <button type="submit">Create Event</button>
    </form>
  );
};

export default CreateEvent;
