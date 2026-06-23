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

import { TOKEN } from "../api/config";
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
