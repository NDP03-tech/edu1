import React, { useState, useEffect } from "react";
import BlankBoxesRenderer from "./renderer/BlankBoxesRenderer";
import MultipleChoiceRenderer from "./renderer/MultipleChoiceRenderer";
import CheckboxesRenderer from "./renderer/CheckboxesRenderer";
import EssayRenderer from "./renderer/EssayRenderer";
import DescriptionRenderer from "./renderer/DescriptionRenderer";
import GeneratedDropdownRender from "./renderer/GeneratedDropdownRenderer";
import FindHighlightRenderer from "./renderer/FindhighlightRenderer";
import DragDropRenderer from "./renderer/DragDropRenderer";
import SpeakingRenderer from "./renderer/SpeakingRenderer";
import ReadingRenderer from "./renderer/ReadingRenderer";

const QuestionRenderer = ({
  question,
  initialAnswer,
  onAnswerChange,
  showCorrectAnswer,
  frozenAnswers,
  correctAnswers,
}) => {
  const questionType = question?.questionType || question?.question_type;
  const frozenAnswer = frozenAnswers?.[question._id];

  const correctAnswer = Array.isArray(correctAnswers)
    ? correctAnswers.find((ca) => ca.question === question._id)?.answer
    : null;

  const getAnswerStatus = (userAnswer, correctAnswer) => {
    const status = {};
    if (!userAnswer || !correctAnswer || typeof userAnswer !== "object" || typeof correctAnswer !== "object") {
      return status;
    }

    Object.keys(correctAnswer).forEach((key) => {
      const userVal = userAnswer[key]?.trim?.().toLowerCase?.();
      const correctVal = correctAnswer[key]?.trim?.().toLowerCase?.();
      status[key] = userVal === correctVal;
    });

    return status;
  };

  const generateCheckboxAnswerStatus = (userAnswer, correctAnswer) => ({
    selected: Array.isArray(userAnswer) ? [...userAnswer] : [],
    correct: Array.isArray(correctAnswer) ? [...correctAnswer] : [],
  });

  const [frozenAnswerStatus, setFrozenAnswerStatus] = useState({});

  // ✅ Chỉ freeze khi lần đầu submit
  useEffect(() => {
    if (showCorrectAnswer && Object.keys(frozenAnswerStatus).length === 0) {
      if (questionType === "checkboxes") {
        setFrozenAnswerStatus(generateCheckboxAnswerStatus(initialAnswer, correctAnswer));
      } else {
        setFrozenAnswerStatus(getAnswerStatus(initialAnswer, correctAnswer));
      }
    }
  }, [showCorrectAnswer, questionType, initialAnswer, correctAnswer]);

  // 🔄 Reset khi user chưa submit lại
  useEffect(() => {
    if (!showCorrectAnswer) {
      setFrozenAnswerStatus({});
    }
  }, [showCorrectAnswer]);

  const answerStatus = frozenAnswerStatus;

  if (!question || !questionType) {
    return <p>Invalid or missing question data</p>;
  }

  switch (questionType) {
    case "blank-boxes":
      return (
        <BlankBoxesRenderer
          question={question}
          editable={true}
          initialAnswer={typeof initialAnswer === "object" ? initialAnswer : {}}
          onAnswerChange={onAnswerChange}
          correctAnswer={correctAnswer}
          answerStatus={answerStatus}
          showCorrectAnswer={showCorrectAnswer}
        />
      );

    case "generated-dropdowns":
      return (
        <GeneratedDropdownRender
          key={question._id}
          question={question}
          editable={true}
          initialAnswer={typeof initialAnswer === "object" ? initialAnswer : {}}
          onAnswerChange={onAnswerChange}
          correctAnswer={correctAnswer}
          answerStatus={answerStatus}
          showCorrectAnswer={showCorrectAnswer}
        />
      );

    case "multiple-choice":
      return (
        <MultipleChoiceRenderer
          question={question}
          initialAnswer={typeof initialAnswer === "string" ? initialAnswer : ""}
          frozenAnswer={frozenAnswer}
          showCorrectAnswer={showCorrectAnswer}
          answerStatus={answerStatus}
          onAnswerChange={onAnswerChange}
        />
      );

    case "checkboxes":
      return (
        <CheckboxesRenderer
          question={question}
          initialAnswer={initialAnswer}
          onAnswerChange={onAnswerChange}
          correctAnswer={correctAnswer}
          showCorrectAnswer={showCorrectAnswer}
          answerStatus={answerStatus}
        />
      );

    case "drag-drop-matching":
      return (
        <DragDropRenderer
          question={question}
          questionId={question._id}
          initialAnswer={typeof initialAnswer === "object" ? initialAnswer : {}}
          onAnswerChange={onAnswerChange}
          correctAnswer={correctAnswer}
          showCorrectAnswer={showCorrectAnswer}
          answerStatus={answerStatus}
        />
      );

    case "find-highlight":
      return (
        <FindHighlightRenderer
          question={question}
          questionId={question._id}
          initialAnswer={Array.isArray(initialAnswer) ? initialAnswer : []}
          onAnswerChange={onAnswerChange}
          correctAnswer={correctAnswer}
          showCorrectAnswer={showCorrectAnswer}
          answerStatus={answerStatus}
        />
      );

    case "essay":
      return (
        <EssayRenderer
          question={question}
          initialAnswer={typeof initialAnswer === "string" ? initialAnswer : ""}
          onAnswerChange={onAnswerChange}
        />
      );

    case "reading":
      return (
        <ReadingRenderer
          question={question}
          correctAnswer={correctAnswer}
      answerStatus={answerStatus}
      showCorrectAnswer={showCorrectAnswer}
      correctAnswers={correctAnswer} // ✅ truyền correctAnswer
      answerStatus={answerStatus}   // ✅ truyền answerStatus
      frozenAnswers={frozenAnswer}
          initialAnswer={typeof initialAnswer === "string" ? initialAnswer : ""}
          onAnswerChange={onAnswerChange}
        />
      );

    case "speaking":
      return (
        <SpeakingRenderer
          question={question}
          initialAnswer={
            typeof initialAnswer === "string" || initialAnswer instanceof File
              ? initialAnswer
              : null
          }
          onAnswerChange={onAnswerChange}
        />
      );

    case "description":
      return <DescriptionRenderer question={question} />;

    default:
      return <p>Unsupported question type: {questionType}</p>;
  }
};

export default QuestionRenderer;
