import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography } from "@mui/material";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzZW5hcGF0aGl5YWtzaGl0aGEuMjMuY3NtQGFuaXRzLmVkdS5pbiIsImV4cCI6MTc4MjIwMDIxNCwiaWF0IjoxNzgyMTk5MzE0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZmRjNGY3NTMtMjhjMS00MGU2LTkzZGUtYjNkMGJjZjAxMDU0IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2VuYXBhdGhpIHlha3NoaXRoYSIsInN1YiI6ImNjZDAzODhiLWE0ZTEtNDliNS1hYjVhLWQ5ZjcyYzQ2YzE2MCJ9LCJlbWFpbCI6InNlbmFwYXRoaXlha3NoaXRoYS4yMy5jc21AYW5pdHMuZWR1LmluIiwibmFtZSI6InNlbmFwYXRoaSB5YWtzaGl0aGEiLCJyb2xsTm8iOiJhMjMxMjY1NTIyMzkiLCJhY2Nlc3NDb2RlIjoiTVRxeGFyIiwiY2xpZW50SUQiOiJjY2QwMzg4Yi1hNGUxLTQ5YjUtYWI1YS1kOWY3MmM0NmMxNjAiLCJjbGllbnRTZWNyZXQiOiJkS3NldXV6eXpXZXVnZFhjIn0.Rv0JjraiwKcqG3CDcCVZPKUXrPRg987oDFCDQxcnoqA";

const PRIORITY = {
Placement: 3,
Result: 2,
Event: 1
};

export default function PriorityPage() {
const [notifications, setNotifications] = useState([]);

useEffect(() => {
fetchPriority();
}, []);

const fetchPriority = async () => {
const res = await axios.get(
"http://4.224.186.213/evaluation-service/notifications",
{
headers: {
Authorization: `Bearer ${TOKEN}`
}
}
);

```
const ranked = res.data.notifications
  .map((n) => ({
    ...n,
    score:
      PRIORITY[n.Type] * 1000000000000 +
      new Date(n.Timestamp).getTime()
  }))
  .sort((a, b) => b.score - a.score)
  .slice(0, 10);

setNotifications(ranked);
```

};

return (
<> <Typography variant="h4" gutterBottom>
Top 10 Priority Notifications </Typography>

```
  {notifications.map((n) => (
    <Card key={n.ID} sx={{ mb: 2 }}>
      <CardContent>
        <Typography variant="h6">{n.Type}</Typography>
        <Typography>{n.Message}</Typography>
        <Typography variant="body2">
          {n.Timestamp}
        </Typography>
      </CardContent>
    </Card>
  ))}
</>


);
}
