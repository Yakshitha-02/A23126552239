const axios = require("axios");
const { TOKEN, Log } = require("./logging-middleware/logger");

const API_URL =
  "http://4.224.186.213/evaluation-service/notifications";

const PRIORITY = {
  Placement: 3,
  Result: 2,
  Event: 1
};

async function getTopNotifications() {
  try {
    await Log(
      "backend",
      "info",
      "handler",
      "Fetching notifications"
    );

    const response = await axios.get(API_URL, {
      headers: {
        Authorization: `Bearer ${TOKEN}`
      }
    });

   
const notifications = response.data.notifications;

    const rankedNotifications = notifications.map(
      (notification) => {

        const typeScore =
          PRIORITY[notification.Type] || 0;

        const timeScore =
          new Date(notification.Timestamp).getTime();

        return {
          ...notification,
          score:
            typeScore * 1000000000000 +
            timeScore
        };
      }
    );

    rankedNotifications.sort(
      (a, b) => b.score - a.score
    );

    const top10 =
      rankedNotifications.slice(0, 10);

    console.log(
      "\n===== TOP 10 PRIORITY NOTIFICATIONS =====\n"
    );

    top10.forEach((item, index) => {
      console.log(
        `${index + 1}. ${item.Type} - ${item.Message}`
      );
    });

    await Log(
      "backend",
      "info",
      "handler",
      "Top notifications calculated successfully"
    );

  } catch (error) {

    await Log(
      "backend",
      "error",
      "handler",
      error.message
    );

    console.error(
      error.response?.data || error.message
    );
  }
}

getTopNotifications();