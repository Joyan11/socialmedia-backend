  const express = require('express');
const cors = require("cors")
const { dbConnect } = require("./database/database.connect");
const helmet = require("helmet");
const morgan = require("morgan");
const { authVerify } = require("./middlewares/authVerify.middleware");
const app = express();

dbConnect();
app.use(cors());
app.use(express.json({ limit: '5mb' }));
app.use(helmet());
app.use(morgan("common"));

app.use("/images",require("./routes/images.route"));
app.use("/auth", require("./routes/auth.route"));
app.use("/user", authVerify, require("./routes/user.route"));
app.use("/post",authVerify,require("./routes/post.route"));
app.use("/notifications",authVerify,require("./routes/notification.route"));


app.get('/', (req, res) => {
  res.send('Hello Express app!')
});

app.listen(3000, () => {
  console.log('server started');
});