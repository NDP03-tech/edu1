import React, { useEffect, useState } from "react";

const extractCorrectAnswer = (gap) => {
  const answerList = gap?.correct_answers || gap?.correct_answer || [];
  return Array.isArray(answerList) ? answerList[0] : answerList;
};

const getRandomChoices = (correctAnswer, allGaps, count = 4) => {
  const allAnswers = allGaps
    .map((gap) => extractCorrectAnswer(gap))
    .filter((ans) => typeof ans === "string" && ans !== correctAnswer);

  const uniqueWrongAnswers = [...new Set(allAnswers)];
  const wrongChoices = uniqueWrongAnswers
    .sort(() => 0.5 - Math.random())
    .slice(0, count - 1);

  return [...wrongChoices, correctAnswer].sort(() => 0.5 - Math.random());
};

const GeneratedDropdownRenderer = ({
  question,
  editable = true,
  initialAnswer = {},
  onAnswerChange,
  correctAnswer,
  answerStatus,
  showCorrectAnswer,
}) => {
  const [selectedAnswers, setSelectedAnswers] = useState({});

  const combinedGaps = [...(question.gaps || []), ...(question.dropdowns || [])]
    .map((item) => ({
      ...item,
      type: item.correct_answers ? "gap" : "dropdown",
    }))
    .sort((a, b) => a.position - b.position);

  useEffect(() => {
    if (initialAnswer && typeof initialAnswer === "object") {
      setSelectedAnswers({ ...initialAnswer });
    } else {
      setSelectedAnswers({});
    }
  }, [question._id, initialAnswer]);

  const handleSelectChange = (gapIndex, value) => {
    const updated = {
      ...selectedAnswers,
      [gapIndex]: value,
    };
    setSelectedAnswers(updated);
    onAnswerChange?.(question._id, updated);
  };

  if (!question?.question_text || combinedGaps.length === 0) {
    return <p>Invalid question data</p>;
  }

  const parser = new DOMParser();
  const doc = parser.parseFromString(question.question_text, "text/html");
  const nodes = Array.from(doc.body.childNodes);

  const renderNode = (node, gapIndexRef) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = node.tagName.toLowerCase();

      // ✅ Inject "border" class to table, td, th
      if (["table", "td", "th"].includes(tagName)) {
        node.classList.add("border");
      }

      if (tagName === "a" && node.classList.contains("cloze")) {
        const gapIndex = gapIndexRef.current;
        const gapData = combinedGaps[gapIndex];
        gapIndexRef.current += 1;

        if (!gapData) return null;

        let correctAns;
        let choices = [];

        if (gapData.type === "gap") {
          correctAns = extractCorrectAnswer(gapData);
          choices = getRandomChoices(correctAns, question.gaps, 4);
        } else if (gapData.type === "dropdown") {
          correctAns = gapData.correct_answer;
          choices = Array.isArray(gapData.options) ? [...gapData.options] : [];

          if (choices.length === 0) {
            const dataOptions = node.getAttribute("data-options");
            try {
              const parsed = JSON.parse(dataOptions);
              if (Array.isArray(parsed)) {
                choices = parsed;
              }
            } catch (err) {
              console.warn("Invalid data-options:", dataOptions);
            }
          }
        }

        const selectedValue = selectedAnswers[gapIndex] || "";

        if (selectedValue && !choices.includes(selectedValue)) {
          choices.push(selectedValue);
        }

        choices = [...new Set(choices)].sort(() => 0.5 - Math.random());

        const isCorrect = answerStatus?.[gapIndex];

        return (
          <select
            key={`select-${gapIndex}`}
            className={`d-inline-block mx-1 dropdown-select ${
              showCorrectAnswer
                ? isCorrect === true
                  ? "border-success text-success"
                  : isCorrect === false
                  ? "border-danger text-danger"
                  : ""
                : ""
            }`}
            style={{
              width: "auto",
              maxWidth: "180px",
              textAlign: "center",
              textAlignLast: "center",
              appearance: "none",
              fontSize: "0.9rem",
              borderRadius: "8px",
              padding: "2px 3px",
            }}
            value={selectedValue}
            disabled={!editable}
            onChange={(e) => handleSelectChange(gapIndex, e.target.value)}
          >
            <option value="">{editable ? "-- Select --" : ""}</option>
            {choices.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        );
      } else {
        return React.createElement(
          tagName,
          {
            key: Math.random(),
            className: node.className || undefined,
          },
          Array.from(node.childNodes).map((child) =>
            renderNode(child, gapIndexRef)
          )
        );
      }
    }
    return null;
  };

  const gapIndexRef = { current: 0 };

  return (
    <div className="rendered-question">
      {nodes.map((node, i) => (
        <React.Fragment key={i}>{renderNode(node, gapIndexRef)}</React.Fragment>
      ))}
    </div>
  );
};

export default GeneratedDropdownRenderer;
