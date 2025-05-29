import React from "react";
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

const QuestionRenderer = ({ question, initialAnswer, onAnswerChange }) => {
  if (!question || (!question.questionType && !question.question_type)) {
    return <p>Invalid or missing question data</p>;
  }

  const questionType = question.questionType || question.question_type;

  switch (questionType) {
    case "blank-boxes":
  return (
    <BlankBoxesRenderer
      question={question}
      initialAnswer={typeof initialAnswer === "object" && initialAnswer !== null ? initialAnswer : {}}
      onAnswerChange={onAnswerChange}
    />
  );

    case "multiple-choice":
      return (
        <MultipleChoiceRenderer
          question={question}
          editable={true}
          initialAnswer={typeof initialAnswer === "string" ? initialAnswer : ""}
          onAnswerChange={onAnswerChange}
        />
      );

      case "checkboxes":
        return (
          <CheckboxesRenderer
            question={question}
            
            initialAnswer={
              Array.isArray(initialAnswer)
                ? initialAnswer
                : initialAnswer && typeof initialAnswer === "object"
                ? initialAnswer[question._id] || []
                : []
            }            
            onAnswerChange={onAnswerChange}
          />
        );

    case "drag-drop-matching":
      return (
        <DragDropRenderer
          question={question}
          questionId={question._id}
          initialAnswer={typeof initialAnswer === "object" && initialAnswer !== null ? initialAnswer : {}}
          onAnswerChange={onAnswerChange}
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

    case "description":
      return <DescriptionRenderer question={question} />;

    case "generated-dropdowns":
      return (
        <GeneratedDropdownRender
       
        key={question._id}
      question={question}
      editable={true}
      initialAnswer={
        typeof initialAnswer === "object" && initialAnswer !== null
          ? initialAnswer
          : {}
      }
      onAnswerChange={onAnswerChange}
    
        />
      );

    case "find-highlight":
      return (
        <FindHighlightRenderer
          question={question}
          questionId={question._id}
          initialAnswer={Array.isArray(initialAnswer) ? initialAnswer : []}
          onAnswerChange={onAnswerChange}
        />
      );

    case "reading":
      return (
        <ReadingRenderer
          question={question}
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
      

    default:
      return <p>Unsupported question type: {questionType}</p>;
  }
};

export default QuestionRenderer;
