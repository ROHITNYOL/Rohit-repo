import { useState, useEffect } from "react";

const Googlecalendar = () => {
  const [events, setEvents] = useState([]);
  const [selectedTimePeriod, setSelectedTimePeriod] = useState("today"); // State to track selected time period
  const [refresh, setRefresh] = useState(false);

  useEffect(() => {
    fetchEvents(selectedTimePeriod);
    // Fetch events for the initial selected time period when component mounts
  }, [selectedTimePeriod]);
//basically to update the events being shown whenever a new event is added 
  useEffect(() => {
    if (refresh) {
      fetchEvents(selectedTimePeriod);
      setRefresh(false);
    } // Fetch events when refresh state changes
  }, [refresh]);

  // Function to fetch events from Google Calendar based on time period
  const fetchEvents = async (timePeriod) => {
    try {
      let timeMin, timeMax;

      switch (timePeriod) {
        case "today":
          // Get current date in IST
          const currentDate = new Date();
          currentDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 IST

          // Construct timeMin for the start of current day in IST
          timeMin = currentDate.toISOString();

          // Construct timeMax for the end of current day in IST (23:59:59)
          const todayMax = new Date(currentDate);
          todayMax.setDate(todayMax.getDate() + 1); // Move to tomorrow
          todayMax.setHours(0, 0, 0, 0); // Set time to 00:00:00 of tomorrow (IST)
          timeMax = todayMax.toISOString();
          break;

        case "tomorrow":
          // Get tomorrow's date in IST
          const tomorrowDate = new Date();
          tomorrowDate.setDate(tomorrowDate.getDate() + 1);
          tomorrowDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 IST tomorrow

          // Construct timeMin for the start of tomorrow in IST
          timeMin = tomorrowDate.toISOString();

          // Construct timeMax for the end of tomorrow in IST (23:59:59)
          const tomorrowMax = new Date(tomorrowDate);
          tomorrowMax.setDate(tomorrowMax.getDate() + 1); // Move to the day after tomorrow
          tomorrowMax.setHours(0, 0, 0, 0); // Set time to 23:59:59 of the day after tomorrow (IST)
          timeMax = tomorrowMax.toISOString();
          break;

        case "thisweek":
          // Get the start and end of the current week in IST (Sunday to Saturday)
          const today = new Date();
          const startOfWeek = new Date(today);
          startOfWeek.setDate(today.getDate() - today.getDay()); // Adjust for day of the week
          startOfWeek.setHours(0, 0, 0, 0); // Set time to 00:00:00 IST on start of week

          const endOfWeek = new Date(startOfWeek);
          endOfWeek.setDate(endOfWeek.getDate() + 7); // Add 6 days to get next Saturday
          endOfWeek.setHours(0, 0, 0, 0); // Set time to 23:59:59 of next Saturday (IST)

          // Construct timeMin for the start of this week in IST
          timeMin = startOfWeek.toISOString();

          // Construct timeMax for the end of this week in IST (excluding events after 23:59:59 of next Saturday)
          timeMax = endOfWeek.toISOString();
          break;

        default:
          // Default to today's events if no valid timePeriod provided
          console.warn(
            "Invalid time period provided. Defaulting to today's events."
          );
          const defaultDate = new Date();
          defaultDate.setHours(0, 0, 0, 0); // Set time to 00:00:00 IST
          timeMin = defaultDate.toISOString();
          timeMax = undefined; // Fetch events indefinitely
          break;
      }

      const response = await fetch(
        `${
          import.meta.env.VITE_Backend_URL
        }/events?timeMin=${encodeURIComponent(
          timeMin
        )}&timeMax=${encodeURIComponent(timeMax)}`
      );

      if (response.ok) {
        const data = await response.json();
        setEvents(data);
        setSelectedTimePeriod(timePeriod);
      } else {
        console.error("Failed to fetch events:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  // Function to add an event
  const handleAddEvent = async (eventData) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_Backend_URL}/createEvent`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(eventData),
        }
      );
      console.log(JSON.stringify(eventData))
      if (response.ok) {
        setRefresh(true); // Trigger event list refresh
      } else {
        console.error("Failed to add event:", response.statusText);
      }
    } catch (error) {
      console.error("Error adding event:", error);
    }
  };

  // Function to handle deleting an event
  const handleDeleteEvent = async (eventId) => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_Backend_URL}/events/${eventId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        console.log("Event deleted successfully!");
        const updatedEvents = events.filter((event) => event.id !== eventId); // Assuming event.id is used for comparison
        setEvents(updatedEvents);
      } else {
        console.error("Failed to delete event:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting event:", error);
    }
  };

  // Render function for displaying events
  const renderEvents = () => {
    return (
      <div>
        {events.length > 0 ? (
          events.map((event) => (
            <div key={event.id} className="eventFetched">
              <p className="pHead">{event.summary}</p>
              <p className="date">
                <span className="dateHead">Start:</span>{" "}
                {new Date(event.start.dateTime).toLocaleString()}
              </p>
              <p className="date">
                <span className="dateHead">End:</span>{" "}
                {new Date(event.end.dateTime).toLocaleString()}
              </p>
              {event.description && (
                <p className="description">{event.description}</p>
              )}
              <button
                onClick={() => handleDeleteEvent(event.id)}
                className="deleteEvent"
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p>No events found.</p>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <div className="box">
        <div className="left">
          <h2 className="heading">Add Event</h2>
          {/* Form for adding event */}
          <form
            className="form"
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.target);
              const summary = formData.get("summary");
              const description = formData.get("description");
              const start = new Date(formData.get("startDateTime")).toISOString();
              const end = new Date(formData.get("endDateTime")).toISOString();

              handleAddEvent({
                summary,
                description,
                start,
                end,
              });

              e.target.reset(); // Reset form fields after submission
            }}
          >
            <input
              type="text"
              name="summary"
              placeholder="Event Name"
              required
              className="input"
            />
            <input
              type="text"
              name="description"
              placeholder="Description"
              className="input"
            />
            <input
              type="datetime-local"
              name="startDateTime"
              required
              className="input"
            />
            <input
              type="datetime-local"
              name="endDateTime"
              required
              className="input"
            />
            <button type="submit" className="button">
              Add Event
            </button>
          </form>
        </div>
        <div className="right">
          <h2 className="heading">Fetched Events</h2>
          {/* Event filtering buttons */}
          <div className="filterButtons">
            <button
              className={
                selectedTimePeriod === "today" ? "activeButton" : "button"
              }
              onClick={() => fetchEvents("today")}
            >
              Today's Events
            </button>
            <button
              className={
                selectedTimePeriod === "tomorrow" ? "activeButton" : "button"
              }
              onClick={() => fetchEvents("tomorrow")}
            >
              Tomorrow's Events
            </button>
            <button
              className={
                selectedTimePeriod === "thisweek" ? "activeButton" : "button"
              }
              onClick={() => fetchEvents("thisweek")}
            >
              This Week's Events
            </button>
          </div>
          {/* Display fetched events */}
          <div className="eventsContainer">
            {events.length > 0 ? (
              renderEvents()
            ) : (
              <p className="noEvents">No events found.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Googlecalendar;
