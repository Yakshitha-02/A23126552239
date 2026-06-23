import { useEffect, useState } from "react";
import axios from "axios";
import {
Card,
CardContent,
Typography,
Grid,
Select,
MenuItem
} from "@mui/material";

const TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJzZW5hcGF0aGl5YWtzaGl0aGEuMjMuY3NtQGFuaXRzLmVkdS5pbiIsImV4cCI6MTc4MjIwMDIxNCwiaWF0IjoxNzgyMTk5MzE0LCJpc3MiOiJBZmZvcmQgTWVkaWNhbCBUZWNobm9sb2dpZXMgUHJpdmF0ZSBMaW1pdGVkIiwianRpIjoiZmRjNGY3NTMtMjhjMS00MGU2LTkzZGUtYjNkMGJjZjAxMDU0IiwibG9jYWxlIjoiZW4tSU4iLCJuYW1lIjoic2VuYXBhdGhpIHlha3NoaXRoYSIsInN1YiI6ImNjZDAzODhiLWE0ZTEtNDliNS1hYjVhLWQ5ZjcyYzQ2YzE2MCJ9LCJlbWFpbCI6InNlbmFwYXRoaXlha3NoaXRoYS4yMy5jc21AYW5pdHMuZWR1LmluIiwibmFtZSI6InNlbmFwYXRoaSB5YWtzaGl0aGEiLCJyb2xsTm8iOiJhMjMxMjY1NTIyMzkiLCJhY2Nlc3NDb2RlIjoiTVRxeGFyIiwiY2xpZW50SUQiOiJjY2QwMzg4Yi1hNGUxLTQ5YjUtYWI1YS1kOWY3MmM0NmMxNjAiLCJjbGllbnRTZWNyZXQiOiJkS3NldXV6eXpXZXVnZFhjIn0.Rv0JjraiwKcqG3CDcCVZPKUXrPRg987oDFCDQxcnoqA";

export default function NotificationsPage() {
const [notifications, setNotifications] = useState([]);
const [type, setType] = useState("");

useEffect(() => {
fetchNotifications();
}, [type]);

const fetchNotifications = async () => {
try {
const url =
type === ""
? "http://4.224.186.213/evaluation-service/notifications"
: `http://4.224.186.213/evaluation-service/notifications?notification_type=${type}`;


  const res = await axios.get(url, {
    headers: {
      Authorization: `Bearer ${TOKEN}`
    }
  });

  setNotifications(res.data.notifications);
} catch (err) {
  console.error(err);
}


};

return (
<> <Typography variant="h4" gutterBottom>
All Notifications </Typography>


  <Select
    value={type}
    onChange={(e) => setType(e.target.value)}
    sx={{ mb: 3 }}
  >
    <MenuItem value="">All</MenuItem>
    <MenuItem value="Event">Event</MenuItem>
    <MenuItem value="Result">Result</MenuItem>
    <MenuItem value="Placement">Placement</MenuItem>
  </Select>

  <Grid container spacing={2}>
    {notifications.map((n) => (
      <Grid item xs={12} md={6} key={n.ID}>
        <Card>
          <CardContent>
            <Typography variant="h6">{n.Type}</Typography>
            <Typography>{n.Message}</Typography>
            <Typography variant="body2">
              {n.Timestamp}
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    ))}
  </Grid>
</>


);
}
