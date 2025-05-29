// QuizStartScreen.jsx
import React from "react";

const QuizStartScreen = ({ instruction, onStart }) => {
  return (
    <div className="p-4 max-w-xl mx-auto text-center">
     <h2 className="text-xl font-bold mb-4">Instructions</h2>
<div
  className="mb-6 whitespace-pre-wrap"
  dangerouslySetInnerHTML={{ __html: instruction }}
/>

      <button
        onClick={onStart}
        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
      >
        Start Quiz
      </button>
    </div>
  );
};

export default QuizStartScreen;



// QuizSubmitScreen.j