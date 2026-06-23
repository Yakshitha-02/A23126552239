import { BrowserRouter, Routes, Route, Link } from "react-router-dom";
import { AppBar, Toolbar, Button, Container } from "@mui/material";
import NotificationsPage from "./pages/NotificationsPage";
import PriorityPage from "./pages/PriorityPage";

export default function App() {
return ( <BrowserRouter> <AppBar position="static"> <Toolbar> <Button color="inherit" component={Link} to="/">
All Notifications </Button>

```
      <Button color="inherit" component={Link} to="/priority">
        Priority Notifications
      </Button>
    </Toolbar>
  </AppBar>

  <Container sx={{ mt: 3 }}>
    <Routes>
      <Route path="/" element={<NotificationsPage />} />
      <Route path="/priority" element={<PriorityPage />} />
    </Routes>
  </Container>
</BrowserRouter>

);
}
