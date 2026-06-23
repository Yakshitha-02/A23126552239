import { useEffect, useState } from "react";
import axios from "axios";
import { Card, CardContent, Typography } from "@mui/material";

import { TOKEN } from "../api/config";

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
