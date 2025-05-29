import React from "react";

const QuizSubmitScreen = ({ score, message }) => {
  return (
    <div className="p-4 max-w-xl mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">Quiz Complete!</h2>
      <div
  className="text-lg mb-4"
  dangerouslySetInnerHTML={{ __html: message }}
/>

      {score !== null && (
        <div className="text-xl font-semibold text-green-600">
          Your Score: {score}
        </div>
      )}
    </div>
  );
};

export default QuizSubmitScreen;