import React, { useEffect, useState } from 'react';
import { Table, Tag, Spin, Typography, Divider, Button } from 'antd';
import moment from 'moment';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DownloadOutlined } from '@ant-design/icons';

const { Title } = Typography;

const sanitizeText = (text) => {
  if (typeof text !== 'string') return '';
  return text
    .replace(/[^\x20-\x7EÀ-ỹ\n\r]/g, '') // loại ký tự điều khiển không in được
    .replace(/\s+/g, ' ')
    .trim();
};

const QuizResultTable = () => {
  const { quizId } = useParams();
  const [data, setData] = useState([]);
  const [questionParts, setQuestionParts] = useState([]);
  const [correctAnswersRow, setCorrectAnswersRow] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(
        `http://localhost:5000/api/results/quiz/${quizId}/best-attempts`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const { results, questionParts, correctAnswersRow } = res.data;
      setData(results || []);
      setQuestionParts(questionParts || []);
      setCorrectAnswersRow(correctAnswersRow || []);
    } catch (err) {
      console.error('❌ Failed to fetch results:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (quizId) fetchResults();
  }, [quizId]);

  const exportToPDF = () => {
    const doc = new jsPDF();
    const title = `Best Attempts for Quiz`;
    doc.setFontSize(16);
    doc.text(title, 14, 20);

    const head = [
      [
        'User',
        'Score',
        'Attempt',
        'Submitted At',
        ...questionParts.map((label) => sanitizeText(label)),
      ],
    ];

    const body = data.map((record) => [
      sanitizeText(record.user?.email || ''),
      record.score,
      record.attemptNumber,
      moment(record.submittedAt).format('YYYY-MM-DD HH:mm'),
      ...record.userAnswersRow.map((ans, idx) => {
        const correct = record.answerStatusRow?.[idx];
        const val = sanitizeText(
          ans !== undefined && ans !== null && ans !== '' ? String(ans) : '—'
        );
        return correct === null
          ? val
          : correct
          ? `✔ ${val}`
          : `✘ ${val}`;
      }),
    ]);

    doc.autoTable({
      head,
      body,
      startY: 30,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [22, 160, 133] },
      margin: { left: 10, right: 10 },
    });

    const correctRow = [
      'Correct Answers',
      '',
      '',
      '',
      ...correctAnswersRow.map((ans) =>
        sanitizeText(ans !== undefined && ans !== null && ans !== '' ? String(ans) : '—')
      ),
    ];

    doc.autoTable({
      body: [correctRow],
      startY: doc.lastAutoTable.finalY + 10,
      styles: { fontStyle: 'bold', fillColor: [255, 255, 204] },
      margin: { left: 10, right: 10 },
    });

    doc.save(`quiz-${quizId}-best-attempts.pdf`);
  };

  const baseColumns = [
    {
      title: 'User',
      dataIndex: ['user', 'email'],
      key: 'user',
    },
    {
      title: 'Score',
      dataIndex: 'score',
      key: 'score',
      align: 'center',
    },
    {
      title: 'Attempt',
      dataIndex: 'attemptNumber',
      key: 'attempt',
      align: 'center',
    },
    {
      title: 'Submitted At',
      dataIndex: 'submittedAt',
      key: 'date',
      align: 'center',
      render: (date) => moment(date).format('YYYY-MM-DD HH:mm'),
    },
  ];

  const answerColumns = questionParts.map((label, idx) => ({
    title: label,
    key: `q-${idx}`,
    align: 'center',
    render: (record) => {
      const ans = record.userAnswersRow?.[idx];
      const correct = record.answerStatusRow?.[idx];
      const val = ans !== undefined && ans !== null && ans !== '' ? String(ans) : '—';
      return (
        <Tag color={correct ? 'green' : 'red'}>
          {val}
        </Tag>
      );
    },
  }));

  return (
    <div style={{ padding: 24 }}>
      <Title level={3}>📋 Best Attempts for Quiz</Title>

      <Button
        type="primary"
        icon={<DownloadOutlined />}
        onClick={exportToPDF}
        style={{ marginBottom: 16 }}
      >
        Export PDF
      </Button>

      <Spin spinning={loading}>
        <Table
          columns={[...baseColumns, ...answerColumns]}
          dataSource={data}
          rowKey={(record) => `${record.user._id}-${record.attemptNumber}`}
          pagination={false}
          bordered
          scroll={{ x: 'max-content' }}
        />
        <Divider />
      </Spin>
    </div>
  );
};

export default QuizResultTable;
