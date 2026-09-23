import express from "express";

const app = express();

app.use(express.json());

app.post("/webhook", (req, res) => {
  console.log("Webhook received:");
  console.log(JSON.stringify(req.body, null, 2));

  res.status(200).json({
    received: true,
  });
});

app.listen(4000, () => {
  console.log(
    "Test webhook server running on port 4000"
  );
});