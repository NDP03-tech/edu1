import React, { useEffect, useState, useRef } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import '@fortawesome/fontawesome-free/css/all.min.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './AdminEvent.css';

const AdminEvent = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingIndex, setEditingIndex] = useState(null);

  const initialEventState = {
    id: '',
    image: '',
    bannerImg: '',
    title: '',
    content: '',
    date: '',
    startTime: '',
    category: '',
    location: '',
    cost: '',
    host: '',
    phone: '',
    createdAt: new Date().toISOString(),
  };

  const [event, setEvent] = useState(initialEventState);
  const editorRef = useRef(null);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/events', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        setEvents(data);
      } catch (error) {
        console.error('Lỗi khi lấy danh sách sự kiện:', error);
      }
    };
    fetchEvents();
  }, []);

  const uploadToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "vestaedu");
    formData.append("cloud_name", "dubzoozqi");

    try {
      const response = await fetch("https://api.cloudinary.com/v1_1/dubzoozqi/image/upload", {
        method: "POST",
        body: formData
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(`Upload thất bại: ${data.error?.message || 'Unknown error'}`);
      }

      return data.secure_url;
    } catch (error) {
      console.error("Lỗi khi upload ảnh lên Cloudinary:", error.message);
      return null;
    }
  };

  const handleFileUpload = async (e, field) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imageUrl = await uploadToCloudinary(file);
        if (imageUrl) {
          setEvent((prevEvent) => ({
            ...prevEvent,
            [field]: imageUrl,
          }));
          console.log(`${field} uploaded successfully:`, imageUrl);
        } else {
          console.error(`Upload ${field} không thành công.`);
        }
      } catch (error) {
        console.error("Lỗi khi upload ảnh:", error);
      }
    }
  };

  const handleEditorChange = (newContent) => {
    setEvent(prevEvent => ({ ...prevEvent, content: newContent }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEvent((prevEvent) => ({ ...prevEvent, [name]: value }));
  };

  const handleEdit = async (id) => {
    try {
      const response = await fetch(`http://localhost:5000/api/events/${id}`);
      if (!response.ok) throw new Error(`Error: ${response.status} - ${response.statusText}`);

      const eventToEdit = await response.json();
      setEvent(eventToEdit);
      setEditingIndex(eventToEdit.id); // Sử dụng id
      setShowModal(true); // Mở modal
    } catch (error) {
      console.error('Error fetching event:', error.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const requiredFields = ['title', 'content', 'date', 'startTime', 'category', 'location', 'cost', 'host', 'phone', 'image', 'bannerImg'];

    for (const field of requiredFields) {
      if (!event[field]) {
        alert(`Vui lòng điền trường ${field}`);
        return;
      }
    }

    try {
      const method = editingIndex !== null ? 'PUT' : 'POST';
      const url = editingIndex !== null
        ? `http://localhost:5000/api/events/${event.id}` // Sử dụng id để cập nhật
        : 'http://localhost:5000/api/events/create'; // Sử dụng cho việc tạo mới

      const updatedEvent = {
        ...event,
        createdAt: new Date().toISOString(),
      };

      const token = localStorage.getItem('token');
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updatedEvent),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(`Failed to ${editingIndex !== null ? 'update' : 'add'} event: ${errorData.message || 'Unknown error'}`);
      }

      const updatedEvents = await fetch('http://localhost:5000/api/events', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      setEvents(await updatedEvents.json());

      setShowModal(false);
      setEditingIndex(null);
      setEvent(initialEventState);
    } catch (error) {
      console.error("Error during submit:", error.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Bạn cần đăng nhập để xóa sự kiện');
      }

      const response = await fetch(`http://localhost:5000/api/events/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete event');
      }

      console.log('Event deleted successfully');
      setEvents(prevEvents => prevEvents.filter(event => event.id !== id)); // Cập nhật danh sách sự kiện
    } catch (error) {
      console.error("Error deleting event:", error.message);
    }
  };

  return (
    <div className="container mt-5">
      <h1 className="mb-4 text-center">Admin Event</h1>
      <button className="btn btn-success mb-3" onClick={() => { setEvent(initialEventState); setEditingIndex(null); setShowModal(true); }}>
        Add Event
      </button>

      <table className="table table-bordered table-hover">
        <thead className="table-dark">
          <tr>
            <th>No.</th>
            <th>Title</th>
            <th>Created On</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event, index) => (
            <tr key={event.id}>
              <td>{index + 1}</td>
              <td>{event.title}</td>
              <td>{new Date(event.createdAt).toLocaleString()}</td>
              <td>
                <button className="btn btn-warning me-2" onClick={() => handleEdit(event.id)}>Edit</button>
                <button className="btn btn-danger" onClick={() => handleDelete(event.id)}>X</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {showModal && (
        <div className="modal show d-block" tabIndex="-1"
          style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100vw', height: '100vh' }}>
          <div className="modal-dialog w-100 m-0" style={{ maxWidth: '100vw' }}>
            <div className="modal-content" style={{ width: '100%' }}>
              <div className="modal-header">
                <h5 className="modal-title">{editingIndex !== null ? 'Edit Event' : 'Add New Event'}</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Title</label>
                    <input
                      type="text"
                      className="form-control"
                      name="title"
                      placeholder="Event Title"
                      value={event.title}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-control"
                      name="category"
                      placeholder="Event Category"
                      value={event.category}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Date</label>
                    <input
                      type="date"
                      className="form-control"
                      name="date"
                      value={event.date}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Start Time</label>
                    <input
                      type="text"
                      className="form-control"
                      name="startTime"
                      placeholder="Start Time"
                      value={event.startTime}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Location</label>
                    <input
                      type="text"
                      className="form-control"
                      name="location"
                      placeholder="Event Location"
                      value={event.location}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Cost</label>
                    <input
                      type="text"
                      className="form-control"
                      name="cost"
                      placeholder="Event Cost"
                      value={event.cost}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Host</label>
                    <input
                      type="text"
                      className="form-control"
                      name="host"
                      placeholder="Host Name"
                      value={event.host}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      name="phone"
                      placeholder="Contact Phone"
                      value={event.phone}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  {[
                    { key: "image", label: "Event Image" },
                    { key: "bannerImg", label: "Banner Image" }
                  ].map(({ key, label }) => (
                    <div className="mb-3" key={key}>
                      <label className="form-label">{label}</label>
                      {event[key] && <img src={event[key]} alt={key} style={{ width: "100px" }} />}
                      <input
                        type="file"
                        className="form-control"
                        onChange={(e) => handleFileUpload(e, key)}
                      />
                    </div>
                  ))}
                  <div className="mb-3">
                    <label className="form-label">Content</label>
                    <Editor
                      apiKey="n37usgxk136y7jbgbd22rrry2ki2agrdp3zzkfg8gc0adi22"
                      onInit={(evt, editor) => (editorRef.current = editor)}
                      value={event.content}
                      onEditorChange={handleEditorChange}
                      init={{
                        height: 300,
                        plugins: 'anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount',
                        toolbar: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table | align lineheight | numlist bullist indent outdent | emoticons charmap | removeformat',
                      }}
                    />
                  </div>
                  <button type="submit" className="btn btn-primary w-100">
                    {editingIndex !== null ? "Update" : "Save"}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminEvent;