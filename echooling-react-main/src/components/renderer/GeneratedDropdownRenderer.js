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
}) => {
  // Lưu dạng: { 0: "answer1", 1: "answer2" }
  const [selectedAnswers, setSelectedAnswers] = useState({});

  // Khi question hoặc initialAnswer thay đổi thì cập nhật state
  useEffect(() => {
    if (initialAnswer && typeof initialAnswer === "object") {
      setSelectedAnswers(initialAnswer);
    } else {
      setSelectedAnswers({});
    }
  }, [question._id, JSON.stringify(initialAnswer)]);

  const handleSelectChange = (gapIndex, value) => {
    const updated = {
      ...selectedAnswers,
      [gapIndex]: value,
    };
    setSelectedAnswers(updated);
    onAnswerChange?.(question._id, updated);
  };

  if (!question?.question_text || !Array.isArray(question.gaps)) {
    return <p>Invalid question data</p>;
  }

  // Tách câu hỏi thành các phần, thay các "a.cloze" bằng select dropdown
  // Vì bạn có question_text chứa <a class="cloze">...</a>, ta sẽ parse nó như HTML rồi render
  // Nhưng React không parse HTML string tự động => dùng dangerouslySetInnerHTML cho phần text còn lại, rồi thay bằng dropdowns

  // Cách đơn giản: tách câu hỏi bằng regex để thay select theo thứ tự gaps

  // Mình sẽ render câu hỏi theo dạng:
  // text trước gap 0, dropdown 0, text giữa gap 0 và gap 1, dropdown 1, ...

  // Vì câu hỏi được lưu dưới dạng string html, ta sẽ dùng thư viện DOMParser để parse
  // Nhưng trong React thì dùng DOMParser khá phức tạp, bạn có thể chuyển câu hỏi về dạng template với vị trí gaps

  // Ở đây mình giả sử question.question_text dạng chuỗi html chứa <a class="cloze">...</a> theo thứ tự gaps

  // Mình sẽ dùng DOMParser để chia nhỏ, sau đó render lại trong React

  const parser = new DOMParser();
  const doc = parser.parseFromString(question.question_text, "text/html");
  const nodes = Array.from(doc.body.childNodes);

  // Hàm hỗ trợ render từng node
  const renderNode = (node, gapIndexRef) => {
    if (node.nodeType === Node.TEXT_NODE) {
      return node.textContent;
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      if (node.tagName.toLowerCase() === "a" && node.classList.contains("cloze")) {
        const gapIndex = gapIndexRef.current;
        gapIndexRef.current += 1;

        const gapData = question.gaps[gapIndex];
        if (!gapData) return null;

        const correctAnswer = extractCorrectAnswer(gapData);
        if (!correctAnswer) return null;

        let choices = getRandomChoices(correctAnswer, question.gaps, 4);

        // Đảm bảo giá trị chọn hiện tại nằm trong choices
        const selectedValue = selectedAnswers[gapIndex] || "";

        if (selectedValue && !choices.includes(selectedValue)) {
          choices.push(selectedValue);
        }

        choices = [...new Set(choices)].sort(() => 0.5 - Math.random());

        return (
          <select
            key={`select-${gapIndex}`}
            className="form-select d-inline-block mx-1"
            style={{ width: "auto" }}
            value={selectedValue}
            disabled={!editable}
            onChange={(e) => handleSelectChange(gapIndex, e.target.value)}
          >
            <option value="">{editable ? "-- chọn --" : ""}</option>
            {choices.map((choice) => (
              <option key={choice} value={choice}>
                {choice}
              </option>
            ))}
          </select>
        );
      } else {
        // Nếu là element khác, render con của nó
        return React.createElement(
          node.tagName.toLowerCase(),
          { key: Math.random() }, // bạn có thể dùng key khác nếu muốn
          Array.from(node.childNodes).map((child) => renderNode(child, gapIndexRef))
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
