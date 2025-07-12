const WebSocket = require("ws");
const wss = new WebSocket.Server({ port: 8443 }, () => {
  console.log("Signaling server listening on ws://0.0.0.0:8443");
});

wss.on("connection", (ws) => {
  console.log("► Client connected");

  ws.on("message", (raw) => {
    let msg;
    try {
      msg = JSON.parse(raw);
    } catch {
      console.error("Failed to parse message:", raw);
      return;
    }

    // --- ✅ ОСНОВНА ЗМІНА ТУТ ---

    // 1) Якщо це "ready" — перевіряємо ліміт перед реєстрацією
    if (msg.action === "ready" && msg.device) {
      // Порахуємо, скільки клієнтів вже в цій кімнаті
      let clientsInRoom = 0;
      wss.clients.forEach((client) => {
        if (
          client.readyState === WebSocket.OPEN &&
          client.deviceId === msg.device
        ) {
          clientsInRoom++;
        }
      });

      // Перевіряємо ліміт (максимум 2 учасники)
      if (clientsInRoom >= 2) {
        console.log(`-> REJECTING client: room '${msg.device}' is full.`);
        // Відправляємо повідомлення про помилку і закриваємо з'єднання
        try {
          ws.send(
            JSON.stringify({
              error: "Room is full. Only 2 participants allowed.",
            }),
          );
        } catch (e) {
          console.error("Failed to send rejection message:", e);
        }
        ws.close(1008, "Room is full"); // 1008 = Policy Violation
        return; // Важливо вийти з обробника
      }

      // Якщо місце є - реєструємо клієнта і продовжуємо, як раніше
      ws.deviceId = msg.device;
      console.log(
        `Client registered in room '${ws.deviceId}' (Total in room now: ${clientsInRoom + 1})`,
      );

      // ...і одразу ж шлемо ready іншим у цій кімнаті
      wss.clients.forEach((client) => {
        if (
          client !== ws &&
          client.readyState === WebSocket.OPEN &&
          client.deviceId === msg.device
        ) {
          client.send(raw);
        }
      });
      return;
    }

    // --- КІНЕЦЬ ЗМІН ---

    // 2) Інші повідомлення (SDP/ICE) — теж по кімнаті
    if (msg.device) {
      wss.clients.forEach((client) => {
        if (
          client !== ws &&
          client.readyState === WebSocket.OPEN &&
          client.deviceId === msg.device
        ) {
          client.send(raw);
        }
      });
    }
  });

  ws.on("close", () => {
    console.log(
      `◄ Client disconnected${ws.deviceId ? " from room '" + ws.deviceId + "'" : ""}`,
    );
  });

  ws.on("error", (err) => {
    console.error("WebSocket error:", err);
  });
});
