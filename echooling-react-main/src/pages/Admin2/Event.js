import React, { useEffect, useState } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import {
  Modal, Drawer, Tabs, Input, Button, Table, Select,
  DatePicker, Upload, message, TimePicker
} from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import './AdminEvent.css';

const { TextArea } = Input;
const { Option } = Select;

const defaultForm = {
  title: '', category: '', location: '', cost: '', host: '',
  phone: '', status: '', image: '', bannerImg: '', content: '',
  date: null, startTime: null
};

const AdminEvent = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState(defaultForm);

  const token = localStorage.getItem('token');

  const fetchEvents = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setEvents(data);
    } catch (err) {
      console.error('Error fetching events:', err);
    }
  };

  const fetchEventById = async (_id) => {
    const res = await fetch(`http://localhost:5000/api/events/${_id}`);
    const event = await res.json();
    return event;
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const populateForm = (event) => {
    setFormData({
      title: event.title || '',
      category: event.category || '',
      location: event.location || '',
      cost: event.cost || '',
      host: event.host || '',
      phone: event.phone || '',
      status: event.status || '',
      image: event.image || '',
      bannerImg: event.bannerImg || '',
      content: event.content || '',
      date: event.date ? dayjs(event.date) : null,
      startTime: event.startTime ? dayjs(event.startTime, 'HH:mm') : null,
    });
  };

  const handleEdit = async (_id) => {
    const event = await fetchEventById(_id);
    populateForm(event);
    setEditingId(event._id);
    setShowModal(true);
  };

  const getPayloadFromFormData = () => ({
    ...formData,
    date: formData.date?.toISOString(),
    startTime: formData.startTime?.format('HH:mm'),
    createdAt: new Date().toISOString(),
  });

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      return message.error("Title and Content are required");
    }

    const url = editingId
      ? `http://localhost:5000/api/events/${editingId}`
      : 'http://localhost:5000/api/events/create';
    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(getPayloadFromFormData()),
    });

    if (!res.ok) {
      const err = await res.json();
      return message.error(err.message || 'Save failed');
    }

    fetchEvents();
    setShowModal(false);
    setEditingId(null);
    setFormData(defaultForm);
  };

  const handleDelete = async (_id) => {
    const res = await fetch(`http://localhost:5000/api/events/${_id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) return message.error('Delete failed');
    setEvents(prev => prev.filter(e => e._id !== _id));
  };

  const handleUpload = (info, field) => {
    if (info.file.status === 'done') {
      const url = info.file.response?.fileUrl;
      if (url) {
        setFormData(prev => ({ ...prev, [field]: url }));
        message.success(`${field} uploaded successfully`);
      }
    } else if (info.file.status === 'error') {
      message.error('Upload failed');
    }
  };

  const filteredEvents = events.filter(e =>
    e.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const columns = [
    { title: 'No.', render: (_, __, i) => i + 1 },
    { title: 'Title', dataIndex: 'title' },
    { title: 'Status', dataIndex: 'status' },
    {
      title: 'Created On',
      dataIndex: 'createdAt',
      render: val => new Date(val).toLocaleString()
    },
    {
      title: 'Actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record._id)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record._id)}>Delete</Button>
        </>
      )
    }
  ];

  const tabItems = [
    {
      key: '1',
      label: 'Basic Info',
      children: (
        <>
          <Input placeholder="Title" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} className="mb-2" />
          <Input placeholder="Category" value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} className="mb-2" />
          <DatePicker value={formData.date} onChange={date => setFormData(prev => ({ ...prev, date }))} className="w-full mb-2" />
          <TimePicker value={formData.startTime} onChange={t => setFormData(prev => ({ ...prev, startTime: t }))} format="HH:mm" className="w-full mb-2" />
          <Input placeholder="Location" value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} className="mb-2" />
          <Input placeholder="Cost" value={formData.cost} onChange={e => setFormData(prev => ({ ...prev, cost: e.target.value }))} className="mb-2" />
          <Input placeholder="Host" value={formData.host} onChange={e => setFormData(prev => ({ ...prev, host: e.target.value }))} className="mb-2" />
          <Input placeholder="Phone" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="mb-2" />
          <Select value={formData.status} onChange={val => setFormData(prev => ({ ...prev, status: val }))} className="w-full mb-2">
            <Option value="Upcoming">Upcoming</Option>
            <Option value="Ongoing">Ongoing</Option>
            <Option value="Finished">Finished</Option>
          </Select>
        </>
      )
    },
    {
      key: '2',
      label: 'Images',
      children: ['image', 'bannerImg'].map(field => (
        <div key={field} className="mb-4">
          <Upload
            name="file"
            accept="image/*"
            action="http://localhost:5000/api/upload-media"
            showUploadList={false}
            headers={{ Authorization: `Bearer ${token}` }}
            onChange={info => handleUpload(info, field)}
          >
            <Button icon={<UploadOutlined />}>Upload {field}</Button>
          </Upload>
          {formData[field] && <img src={formData[field]} alt={field} style={{ width: 100, marginTop: 8 }} />}
        </div>
      ))
    },
    {
      key: '3',
      label: 'Content',
      children: (
        <Editor
          apiKey="your-tinymce-api-key"
          value={formData.content}
          onEditorChange={content => setFormData(prev => ({ ...prev, content }))}
          init={{
            height: 300,
            plugins: 'link image code lists table',
            toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | link image',
          }}
        />
      )
    }
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Button type="primary" onClick={() => { setFormData(defaultForm); setEditingId(null); setShowModal(true); }}>
          Add Event
        </Button>
        <Input.Search
          placeholder="Search by title..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ width: '50%' }}
        />
      </div>

      <Table
        rowKey="_id"
        dataSource={filteredEvents}
        columns={columns}
        onRow={record => ({
          onClick: () => {
            setSelectedEvent(record);
            setShowDetailDrawer(true);
          }
        })}
      />

      <Drawer
        title="Event Details"
        placement="right"
        width={500}
        open={showDetailDrawer}
        onClose={() => setShowDetailDrawer(false)}
      >
        {selectedEvent && (
          <div>
            <img src={selectedEvent.image} alt="event" className="w-full mb-4" />
            <p><strong>Title:</strong> {selectedEvent.title}</p>
            <p><strong>Date:</strong> {new Date(selectedEvent.date).toLocaleDateString()}</p>
            <p><strong>Time:</strong> {selectedEvent.startTime}</p>
            <p><strong>Location:</strong> {selectedEvent.location}</p>
            <p><strong>Status:</strong> {selectedEvent.status}</p>
            <div dangerouslySetInnerHTML={{ __html: selectedEvent.content }}></div>
          </div>
        )}
      </Drawer>

      <Modal
        open={showModal}
        onCancel={() => setShowModal(false)}
        footer={null}
        title={editingId ? 'Edit Event' : 'Create Event'}
        width={800}
        destroyOnClose
      >
        <Tabs defaultActiveKey="1" items={tabItems} />
        <Button type="primary" onClick={handleSubmit} className="w-full mt-4">
          {editingId ? 'Update Event' : 'Create Event'}
        </Button>
      </Modal>
    </div>
  );
};

export default AdminEvent;
