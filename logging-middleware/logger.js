const axios = require("axios");

const LOG_API = "http://4.224.186.213/evaluation-service/logs";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzZW5hcGF0aGl5YWtzaGl0aGEuMjMuY3NtQGFuaXRzLmVkdS5pbiIsImV4cCI6MTc4MjE5NTE5OCwiaWF0IjoxNzgyMTk0Mjk4LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZjQ1NjIwOTYtZDFjOC00NmM5LWEzMDEtMDgxZWQyZDAzYTAzIiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2VuYXBhdGhpIHlha3NoaXRoYSIsInN1YiI6ImNjZDAzODhiLWE0ZTEtNDliNS1hYjVhLWQ5ZjcyYzQ2YzE2MCJ9LCJlbWFpbCI6InNlbmFwYXRoaXlha3NoaXRoYS4yMy5jc21AYW5pdHMuZWR1LmluIiwibmFtZSI6InNlbmFwYXRoaSB5YWtzaGl0aGEiLCJyb2xsTm8iOiJhMjMxMjY1NTIyMzkiLCJhY2Nlc3NDb2RlIjoiTVRxeGFyIiwiY2xpZW50SUQiOiJjY2QwMzg4Yi1hNGUxLTQ5YjUtYWI1YS1kOWY3MmM0NmMxNjAiLCJjbGllbnRTZWNyZXQiOiJkS3NldXV6eXpXZXVnZFhjIn0.V_XnnjWVMVUhwe2r7oZ5XfrKHMHD8iS9qLD36fMfTq0";

async function Log(stack, level, packageName, message) {
  try {
    await axios.post(
      LOG_API,
      {
        stack,
        level,
        package: packageName,
        message
      },
      {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          "Content-Type": "application/json"
        }
      }
    );
  } catch (error) {
    console.error("Log Error:", error.message);
  }
}

module.exports = Log;
console.log(TOKEN);