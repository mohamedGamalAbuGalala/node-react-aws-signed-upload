require("dotenv").config();
const express = require("express");
const aws = require("aws-sdk");
const uuidv4 = require("uuid/v4");
const mime = require("mime-types");
const cors = require("cors");

const app = express();
app.use(cors());

const {
  region,
  awsKey,
  secret,
  bucket
} = process.env;

const s3 = new aws.S3({
  accessKeyId: awsKey,
  secretAccessKey: secret,
  region: region
});

/**
 * @params: {query: {'file-name': String, 'file-ext': String}}
 * @Returns: {presignedURL: 'url to use to upload your file',
 * @                   url: 'the url your file will be uploaded to'}
 */
app.get("/sign", (req, res) => {
  const filename = req.query["file-name"];
  const fileExt = req.query["file-ext"];

  const defaultExt = fileExt;
  let extension = filename.match(/\.(\w+$)/);

  extension =
    extension.length > 1
      ? extension[1]
      : defaultExt;

  const {
    contentStorageKey,
    contentStorageBucketName,
    contentType
  } = {
    contentStorageKey: uuidv4() + "-" + filename,
    contentStorageBucketName: bucket,
    contentType: mime.contentType(extension)
  };

  const params = {
    Bucket: contentStorageBucketName,
    Key: contentStorageKey,
    Expires: 60,
    ContentType: contentType,
    ACL: "public-read"
  };

  try {
    const presignedURL = s3.getSignedUrl(
      "putObject",
      params
    );
    return res.status(200).send({
      url: `https://${bucket}.s3.${region}.amazonaws.com/${contentStorageKey}`,
      presignedURL
    });
  } catch (ex) {
    console.error(ex);
    return res
      .status(500)
      .send({ error: "something wrong!!" });
  }
});

app.listen(process.env.PORT || 5000, () => {
  console.log(
    "CORS-enabled web server listening on port 5000"
  );
});
