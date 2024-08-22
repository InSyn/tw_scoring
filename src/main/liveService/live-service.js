import { ipcMain } from "../index";
import axios from "axios";

ipcMain.on("update-live-event", (event, eventData) => {
  try {
    const response = axios.patch(
      "http://79.143.30.189:8081/api/v1/events/" + eventData.id,
      eventData
    );
    if (response.status === 200) {
      event.returnValue = "ok";
    }
  } catch (e) {
    console.log(e);
  }
});
