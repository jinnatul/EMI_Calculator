import app from "./app";

const port = process.env.PORT || 5010;
app.listen(port, () => {
  console.log(
    `The server is running on port ${port} in ${process.env.STAGE} mode`
  );
});
