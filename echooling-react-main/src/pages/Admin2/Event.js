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

const AdminEvent = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailDrawer, setShowDetailDrawer] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    location: '',
    cost: '',
    host: '',
    phone: '',
    status: '',
    image: '',
    bannerImg: '',
    content: '',
    date: null,
    startTime: null,
  });

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/events', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const resetForm = () => {
    setFormData({
      title: '', category: '', location: '', cost: '', host: '',
      phone: '', status: '', image: '', bannerImg: '', content: '',
      date: null, startTime: null
    });
  };

  const handleEdit = async (id) => {
    const response = await fetch(`http://localhost:5000/api/events/${id}`);
    const eventToEdit = await response.json();
    setFormData({
      title: eventToEdit.title || '',
      category: eventToEdit.category || '',
      location: eventToEdit.location || '',
      cost: eventToEdit.cost || '',
      host: eventToEdit.host || '',
      phone: eventToEdit.phone || '',
      status: eventToEdit.status || '',
      image: eventToEdit.image || '',
      bannerImg: eventToEdit.bannerImg || '',
      content: eventToEdit.content || '',
      date: eventToEdit.date ? dayjs(eventToEdit.date) : null,
      startTime: eventToEdit.startTime ? dayjs(eventToEdit.startTime, 'HH:mm') : null,
    });
    setEditingId(eventToEdit.id);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!formData.title || !formData.content) {
      message.error("Title and Content are required");
      return;
    }

    const method = editingId ? 'PUT' : 'POST';
    const url = editingId
      ? `http://localhost:5000/api/events/${editingId}`
      : 'http://localhost:5000/api/events/create';

    const token = localStorage.getItem('token');
    const payload = {
      ...formData,
      date: formData.date?.toISOString(),
      startTime: formData.startTime?.format('HH:mm'),
      createdAt: new Date().toISOString(),
    };

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const err = await response.json();
      message.error(err.message || 'Save failed');
      return;
    }

    fetchEvents();
    setShowModal(false);
    setEditingId(null);
    resetForm();
  };

  const handleDelete = async (id) => {
    const token = localStorage.getItem('token');
    const response = await fetch(`http://localhost:5000/api/events/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) return message.error('Delete failed');
    setEvents(prev => prev.filter(e => e.id !== id));
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

  const columns = [
    { title: 'No.', dataIndex: 'index', render: (_, __, i) => i + 1 },
    { title: 'Title', dataIndex: 'title' },
    { title: 'Status', dataIndex: 'status' },
    { title: 'Created On', dataIndex: 'createdAt', render: val => new Date(val).toLocaleString() },
    {
      title: 'Actions',
      render: (_, record) => (
        <>
          <Button type="link" onClick={() => handleEdit(record.id)}>Edit</Button>
          <Button type="link" danger onClick={() => handleDelete(record.id)}>Delete</Button>
        </>
      ),
    },
  ];

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <Button type="primary" onClick={() => { resetForm(); setEditingId(null); setShowModal(true); }}>
          Add Event
        </Button>
        <Input.Search
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '50%' }}
        />
      </div>

      <Table
        rowKey="id"
        dataSource={events.filter(e => e.title?.toLowerCase().includes(searchQuery.toLowerCase()))}
        columns={columns}
        onRow={(record) => ({ onClick: () => { setSelectedEvent(record); setShowDetailDrawer(true); } })}
      />

      <Drawer
        title="Event Details"
        placement="right"
        width={500}
        onClose={() => setShowDetailDrawer(false)}
        open={showDetailDrawer}
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
        title={editingId ? 'Edit Event' : 'Create New Event'}
        width={800}
        destroyOnClose
      >
        <Tabs
          defaultActiveKey="1"
          items={[
            {
              key: '1',
              label: 'Basic Info',
              children: (
                <>
                  <Input
                    placeholder="Title"
                    value={formData.title}
                    onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="mb-2"
                  />
                  <Input placeholder="Category" value={formData.category} onChange={e => setFormData(prev => ({ ...prev, category: e.target.value }))} className="mb-2" />
                  <DatePicker
                    value={formData.date}
                    onChange={date => setFormData(prev => ({ ...prev, date }))}
                    className="w-full mb-2"
                  />
                  <TimePicker
                    value={formData.startTime}
                    onChange={t => setFormData(prev => ({ ...prev, startTime: t }))}
                    format="HH:mm"
                    className="w-full mb-2"
                  />
                  <Input placeholder="Location" value={formData.location} onChange={e => setFormData(prev => ({ ...prev, location: e.target.value }))} className="mb-2" />
                  <Input placeholder="Cost" value={formData.cost} onChange={e => setFormData(prev => ({ ...prev, cost: e.target.value }))} className="mb-2" />
                  <Input placeholder="Host" value={formData.host} onChange={e => setFormData(prev => ({ ...prev, host: e.target.value }))} className="mb-2" />
                  <Input placeholder="Phone" value={formData.phone} onChange={e => setFormData(prev => ({ ...prev, phone: e.target.value }))} className="mb-2" />
                  <Select
                    value={formData.status}
                    onChange={val => setFormData(prev => ({ ...prev, status: val }))}
                    className="w-full mb-2"
                  >
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
              children: (
                <>
                  {['image', 'bannerImg'].map(field => (
                    <div key={field} className="mb-4">
                      <Upload
                        name="file"
                        accept="image/*"
                        action="http://localhost:5000/api/upload-media"
                        showUploadList={false}
                        headers={{ Authorization: `Bearer ${localStorage.getItem('token')}` }}
                        onChange={info => handleUpload(info, field)}
                      >
                        <Button icon={<UploadOutlined />}>Upload {field}</Button>
                      </Upload>
                      {formData[field] && <img src={formData[field]} alt={field} style={{ width: 100, marginTop: 8 }} />}
                    </div>
                  ))}
                </>
              )
            },
            {
              key: '3',
              label: 'Content',
              children: (
                <Editor
                  apiKey="n37usgxk136y7jbgbd22rrry2ki2agrdp3zzkfg8gc0adi22"
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
          ]}
        />
        <Button type="primary" onClick={handleSubmit} className="w-full mt-4">
          {editingId ? 'Update Event' : 'Create Event'}
        </Button>
      </Modal>
    </div>
  );
};

export default AdminEvent;
