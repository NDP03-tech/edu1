import { motion } from "framer-motion";

const quotes = [
  "Không có áp lực, không có kim cương 💎",
  "Thất bại không phải là thất bại, trừ khi bạn từ bỏ 🔥",
  "Chặng đường ngàn dặm bắt đầu từ một bước chân 👣",
  "Kiến tha lâu cũng đầy tổ 🐜",
  "Mỗi ngày là một cơ hội mới để học hỏi và tiến bộ 🚀",
  "Đừng mơ về thành công – hãy làm việc vì nó 💼",
];

function getQuoteOfTheDay() {
  const today = new Date().toDateString(); // Ví dụ: "Wed May 29 2025"
  const hash = [...today].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return quotes[hash % quotes.length];
}

const QuoteOfTheDay = () => {
  const quote = getQuoteOfTheDay();

  return (
    <motion.div
      initial={{ opacity: 0, x: 100, rotateY: 90 }}
      animate={{ opacity: 1, x: 0, rotateY: 0 }}
      transition={{ duration: 1.2, ease: "easeOut" }}
      style={{
        background: "linear-gradient(to right, #f472b6, #c084fc)",
        padding: "16px 24px",
        borderRadius: "12px",
        color: "#fff",
        fontSize: "18px",
        fontWeight: 500,
        fontFamily: "Georgia, serif",
        boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
        maxWidth: 400,
      }}
    >
      ✨ {quote}
    </motion.div>
  );
};

export default QuoteOfTheDay;
